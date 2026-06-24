import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// SC-02: Fallback for Vercel if the user forgets to add JWT_SECRET to environment variables
const jwtSecret = process.env.JWT_SECRET || "05877ca97cf8dcb45e79414c046c28b2732efca901b93eb7a37d1290a31e9102";

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saathicare",
  jwtSecret: jwtSecret,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};
