import express from "express";
import cors from "cors";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import net from "net";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createHash, randomBytes, scryptSync } from "crypto";
import { MongoClient, ObjectId } from "mongodb";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const OS = process.env.MAKEVENTORY_OS || "linux";

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '10mb' })); // 10mb allowed here for logo uploads during install
app.use(express.static(path.join(__dirname, "dist")));

// ─── npm install tracking ─────────────────────────────────────────────────────
const ROOT = path.join(__dirname, "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const installJobs = {
    install: { status: "complete" },
    client: { status: "running" },
    server: { status: "running" },
};

const sseClients = new Set();

function broadcastProgress() {
    const payload = `data: ${JSON.stringify(installJobs)}\n\n`;
    for (const res of sseClients) {
        try {
            res.write(payload);
        } catch {
            /* client disconnected */
        }
    }
}

function spawnInstall(id, cwd) {
    const child = spawn(npmCmd, ["install"], { cwd, shell: true });
    child.stdout.on("data", () => broadcastProgress());
    child.stderr.on("data", () => broadcastProgress());
    child.on("close", (code) => {
        installJobs[id].status = code === 0 ? "complete" : "error";
        broadcastProgress();
    });
}

// Kick off background installs immediately when the server starts
spawnInstall("client", path.join(ROOT, "client"));
spawnInstall("server", path.join(ROOT, "server"));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function checkPort(port, host = "127.0.0.1", timeoutMs = 2500) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ port, host });
        const timer = setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, timeoutMs);
        socket.once("connect", () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(true);
        });
        socket.once("error", () => {
            clearTimeout(timer);
            resolve(false);
        });
    });
}

async function commandExists(cmd) {
    try {
        const which = OS === "windows" ? "where" : "which";
        await execAsync(`${which} ${cmd}`);
        return true;
    } catch {
        return false;
    }
}

async function runCommand(cmd) {
    try {
        const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
        return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_MODULES = [
    {
        name: "Inventory",
        description: "Track stock levels, locations, and movements across your warehouse or storage sites.",
        isActive: true,
        displayOrder: 0,
    },
    {
        name: "Products",
        description: "Manage your product catalogue, including SKUs, pricing, categories, and supplier details.",
        isActive: false,
        displayOrder: 1,
    },
    {
        name: "Orders",
        description: "Create, manage, and fulfil customer and purchase orders from start to finish.",
        isActive: false,
        displayOrder: 2,
    },
    {
        name: "Year Review",
        description: "Generate annual summaries and trend reports across your inventory, orders, and sales data.",
        isActive: false,
        displayOrder: 3,
    },
];

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/api/ping", (_req, res) => res.json({ ok: true }));

// npm install progress — Server-Sent Events
app.get("/api/npm-progress", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    // Send current state immediately so late-connecting clients are never out of sync
    res.write(`data: ${JSON.stringify(installJobs)}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
});

app.get("/api/status", (_req, res) => res.json({ os: OS }));

// Step 1 – Check if mongod binary is available
app.post("/api/database/check-mongodb", async (_req, res) => {
    const available = await commandExists("mongod");
    res.json({ available });
});

// Step 2 – Check if Docker is installed and the daemon is reachable
app.post("/api/database/check-docker", async (_req, res) => {
    const exists = await commandExists("docker");
    if (!exists) return res.json({ available: false });
    const result = await runCommand("docker info");
    res.json({ available: result.success });
});

// Step 3 – Check whether a container named "mongodb" exists (and if it's running)
app.post("/api/database/check-docker-container", async (_req, res) => {
    const all = await runCommand('docker ps -a --filter "name=^/mongodb$" --format "{{.Names}}"');
    const exists = all.success && all.stdout.toLowerCase().includes("mongodb");
    if (!exists) return res.json({ exists: false, running: false });

    const running = await runCommand('docker ps --filter "name=^/mongodb$" --format "{{.Names}}"');
    res.json({ exists: true, running: running.success && running.stdout.toLowerCase().includes("mongodb") });
});

// Step 4a – Create the MongoDB Docker container
app.post("/api/database/create-docker-container", async (_req, res) => {
    const result = await runCommand("docker run -d --name mongodb -p 27017:27017 --restart unless-stopped mongo:latest");
    res.json({ success: result.success, error: result.error });
});

// Step 4b – Start an existing (stopped) MongoDB container
app.post("/api/database/start-docker-container", async (_req, res) => {
    const result = await runCommand("docker start mongodb");
    res.json({ success: result.success, error: result.error });
});

// Step 5 – Ensure MongoDB is actually accepting connections on 27017
// If it is a locally installed instance and it isn't running, try to start it.
app.post("/api/database/ensure-running", async (_req, res) => {
    let running = await checkPort(27017);

    if (!running) {
        // Try to start a locally installed mongod
        const mongoAvailable = await commandExists("mongod");
        if (mongoAvailable) {
            if (OS === "mac") {
                // Homebrew service first, fall back to fork
                await runCommand("brew services start mongodb-community 2>/dev/null || " + "mongod --fork --logpath /tmp/makeventory-mongod.log --dbpath /usr/local/var/mongodb 2>/dev/null");
            } else if (OS === "linux") {
                await runCommand("sudo systemctl start mongod 2>/dev/null || sudo service mongod start 2>/dev/null");
            } else if (OS === "windows") {
                await runCommand("net start MongoDB");
            }
        }

        // Give MongoDB up to 10 seconds to become reachable
        for (let i = 0; i < 10; i++) {
            await sleep(1000);
            running = await checkPort(27017);
            if (running) break;
        }
    }

    res.json({ running });
});

// Step 6 / 7 – Validate DB name, write .env to server/
app.post("/api/database/create", async (req, res) => {
    const { dbName } = req.body ?? {};

    if (!dbName || !/^[a-zA-Z]+$/.test(dbName)) {
        return res.status(400).json({ error: "Database name must contain letters only." });
    }

    const jwtSecret = randomBytes(64).toString("hex");
    const envContentServer = `MONGODB_URI=mongodb://localhost:27017/${dbName}\n`
        + `PORT=5001\n`
        + `JWT_SECRET=${jwtSecret}\n`
        + `CLIENT_ORIGIN=http://localhost:3000\n`
        + `COOKIE_SECURE=false\n`;

    const envPathServer = path.join(__dirname, "..", "server", ".env");

    try {
        await fs.writeFile(envPathServer, envContentServer, "utf8");

        // Seed initial modules into the new database
        const mongoUri = `mongodb://localhost:27017/${dbName}`;
        const client = new MongoClient(mongoUri);
        try {
            await client.connect();
            const col = client.db(dbName).collection("modules");
            await col.deleteMany({});
            await col.insertMany(SEED_MODULES.map((m) => ({ ...m, createdAt: new Date(), updatedAt: new Date() })));
        } finally {
            await client.close();
        }

        res.json({ success: true, dbName });
    } catch (err) {
        res.status(500).json({ error: `Could not write server/.env: ${err.message}` });
    }
});

// Signal that installation is complete – shut down the server cleanly
app.post("/api/install/complete", (_req, res) => {
    res.json({ ok: true });
    setTimeout(() => process.exit(0), 500);
});

// ─── Account creation ─────────────────────────────────────────────────────────

// Shared helper: read URI from .env, connect, run fn(db), disconnect
async function withDb(fn) {
    const envRaw = await fs.readFile(path.join(__dirname, "..", "server", ".env"), "utf8");
    const match = envRaw.match(/^MONGODB_URI=(.+)$/m);
    if (!match) throw new Error("MONGODB_URI not found in server/.env");
    const mongoUri = match[1].trim();
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const dbName = new URL(mongoUri).pathname.replace("/", "");
        return await fn(client.db(dbName));
    } finally {
        await client.close();
    }
}

app.post("/api/account/create", async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body ?? {};

    const missing = ["firstName", "lastName", "email", "username", "password"].filter((k) => !req.body?.[k]?.trim());
    if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    // Hash password with scrypt — stored as "salt:hash"
    const salt = randomBytes(16).toString("hex");
    const hashBuf = scryptSync(password, salt, 64);
    const passwordHash = `${salt}:${hashBuf.toString("hex")}`;

    try {
        await withDb(async (db) => {
            const users = db.collection("users");
            const existing = await users.findOne({
                $or: [{ email: email.trim().toLowerCase() }, { username: username.trim() }],
            });
            if (existing) {
                const err = new Error("A user with that email or username already exists.");
                err.status = 409;
                throw err;
            }
            await users.insertOne({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                username: username.trim(),
                passwordHash,
                role: "admin",
                createdAt: new Date(),
            });
        });
        res.json({ success: true });
    } catch (err) {
        res.status(err.status ?? 500).json({ error: err.message });
    }
});

// ─── Account update ───────────────────────────────────────────────────────────
app.put("/api/account/update", async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body ?? {};

    const missing = ["firstName", "lastName", "email", "username"].filter((k) => !req.body?.[k]?.trim());
    if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    try {
        await withDb(async (db) => {
            const users = db.collection("users");
            const update = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                username: username.trim(),
                updatedAt: new Date(),
            };
            if (password?.trim()) {
                const salt = randomBytes(16).toString("hex");
                const hashBuf = scryptSync(password, salt, 64);
                update.passwordHash = `${salt}:${hashBuf.toString("hex")}`;
            }
            await users.updateOne({ role: "admin" }, { $set: update });
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Business profile ─────────────────────────────────────────────────────────
app.post("/api/business/create", async (req, res) => {
    const { businessName, logoBase64, logoMime, website, twitter, instagram, tiktok, facebook } = req.body ?? {};

    if (!businessName?.trim()) {
        return res.status(400).json({ error: "Business name is required." });
    }

    const logoDataUri = logoBase64 ? `data:${logoMime};base64,${logoBase64}` : null;

    const doc = {
        businessName: businessName.trim(),
        ...(logoDataUri && { logo: logoDataUri }),
        ...(website && { website: website.trim() }),
        ...(twitter && { twitter: twitter.trim() }),
        ...(instagram && { instagram: instagram.trim() }),
        ...(tiktok && { tiktok: tiktok.trim() }),
        ...(facebook && { facebook: facebook.trim() }),
        createdAt: new Date(),
    };

    try {
        await withDb(async (db) => {
            const col = db.collection("businessinfo");
            await col.deleteMany({});
            await col.insertOne(doc);
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Modules ─────────────────────────────────────────────────────────────────
app.get("/api/modules", async (_req, res) => {
    try {
        const modules = await withDb((db) => db.collection("modules").find({}).sort({ displayOrder: 1 }).toArray());
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/modules/save", async (req, res) => {
    const { modules } = req.body ?? {};
    if (!Array.isArray(modules)) {
        return res.status(400).json({ error: "modules must be an array." });
    }
    try {
        await withDb(async (db) => {
            const col = db.collection("modules");
            await Promise.all(modules.map(({ _id, isActive }) => col.updateOne({ _id: new ObjectId(_id) }, { $set: { isActive, updatedAt: new Date() } })));
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all: serve the React app
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Makeventory installer running at http://localhost:${PORT}`);
});
