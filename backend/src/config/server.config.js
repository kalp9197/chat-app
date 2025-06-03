import express from "express";
import cors from "cors";
import { CORS_ORIGIN } from "../constants/env.js";
import { initializeDatabase } from "./database.config.js";

export const configureServer = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  initializeDatabase();

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
};
