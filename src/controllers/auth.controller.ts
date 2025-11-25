import { Request, Response } from "express";
import * as authService from "../services/auth.service";
const generateUniqueUsername = (fullName: string): string => {
  const sanitizedName = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const specialDigits = Math.floor(1000 + Math.random() * 9000).toString();
  let username = `${sanitizedName.substring(0, 11)}${specialDigits}`;
  return username;
};
