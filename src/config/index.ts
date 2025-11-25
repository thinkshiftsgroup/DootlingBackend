import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const JWT_SECRET = process.env.JWT_SECRET || "YOUR_UNSAFE_DEFAULT_SECRET";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "YOUR_UNSAFE_REFRESH_SECRET";
