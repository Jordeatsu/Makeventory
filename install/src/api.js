import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const ping = () => api.get("/ping");
export const getStatus = () => api.get("/status");
export const checkMongoDB = () => api.post("/database/check-mongodb");
export const checkDocker = () => api.post("/database/check-docker");
export const checkDockerContainer = () => api.post("/database/check-docker-container");
export const createDockerContainer = () => api.post("/database/create-docker-container");
export const startDockerContainer = () => api.post("/database/start-docker-container");
export const ensureMongoRunning = () => api.post("/database/ensure-running");
export const createDatabase = (dbName) => api.post("/database/create", { dbName });
export const createAccount = (data) => api.post("/account/create", data);
export const updateAccount = (data) => api.put("/account/update", data);
export const createBusiness = (data) => api.post("/business/create", data);
export const getModules = () => api.get("/modules");
export const saveModules = (modules) => api.put("/modules/save", { modules });
export const completeInstall = () => api.post("/install/complete");
