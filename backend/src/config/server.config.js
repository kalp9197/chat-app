import express from "express";
import cors from "cors";
import { CORS_ORIGIN, CORS_ORIGIN_2 } from "../constants/env.js";
import { initializeDatabase } from "./database.config.js";
import helmet from "helmet";

export const configureServer = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const allowedOrigins = [CORS_ORIGIN, CORS_ORIGIN_2];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg =
            "The CORS policy for this site does not allow access from the specified Origin.";
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  initializeDatabase();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
};
