import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saathicare",
  jwtSecret: process.env.JWT_SECRET || "super-secret-saathicare-key",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};
