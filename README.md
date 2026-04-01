# Makeventory

An inventory management application with a browser-based installation wizard. Built with Node.js, Express, MongoDB, React, Vite, and Material UI.

---

## Requirements

Before running the installer, ensure you have:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **MongoDB or Docker** — the installer will detect and configure MongoDB automatically. [MongoDB](https://www.mongodb.com/products/self-managed/community-edition) | [Docker Engine](https://docs.docker.com/engine/install)

---

## Installation

```bash
chmod +x install.sh
./install.sh
```

This will:

1. Install the installer's own dependencies
2. Build the installer UI
3. Open the installation wizard in your browser at `http://localhost:3000`
4. Install the `client/` and `server/` dependencies in the background while you complete setup

---

## Tech stack

| Layer | Technology |
|---|---|
| Front-end | React 18, Vite, Material UI v5, React Router, Recharts |
| Back-end | Node.js, Express, Mongoose |
| Database | MongoDB |
| Installer | Express, React, Vite, MUI, native `mongodb` driver |

---