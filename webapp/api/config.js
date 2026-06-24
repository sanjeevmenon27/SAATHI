import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// SC-02: Fallback for Vercel if the user forgets to add JWT_SECRET to environment variables
const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET : "05877ca97cf8dcb45e79414c046c28b2732efca901b93eb7a37d1290a31e9102";

export const config = {
  port: 5000,
  mongoUri: "mongodb+srv://sanjeevsmenon27_db_user:Prosanjeev2005@saathicare.vrrjjdw.mongodb.net/saathicare?retryWrites=true&w=majority",
  jwtSecret: jwtSecret,
  clientUrl: process.env.CLIENT_URL ? process.env.CLIENT_URL : "http://localhost:5173"
};
