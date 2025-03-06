import express from "express";
import cors from "cors";
import { authenticateUser } from "./middleware/authMiddleware";
import app from "./app";

// Mount app with base path /api
const server = express();
server.use(cors());
server.use(express.json());
server.use("/api", app);

export default server;
