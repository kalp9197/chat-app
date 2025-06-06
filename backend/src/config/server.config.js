import express from "express";
import cors from "cors";
import { CORS_ORIGIN, CORS_ORIGIN_2 } from "../constants/env.js";
import { initializeDatabase } from "./database.config.js";

export const configureServer = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: [CORS_ORIGIN, CORS_ORIGIN_2],
      credentials: true,
    })
  );
  initializeDatabase();
};
