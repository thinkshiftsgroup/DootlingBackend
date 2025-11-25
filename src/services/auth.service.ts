import { prisma } from "../prisma";
import { User, Biodata } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { generateSixDigitCode } from "../utils/codeGenerator";
import {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
} from "../utils/email";

const getExpiry = (minutes: number): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const firstname = parts[0] || "";
  const lastname = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return { firstname, lastname };
};

const generateAuthToken = (user: {
  id: string;
  email: string;
  username: string | null;
  isVerified: boolean;
  userType: string;
}): string => {
  const secret = process.env.JWT_SECRET || "YOUR_UNSAFE_DEFAULT_SECRET";
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      userType: user.userType,
    },
    secret,
    { expiresIn: "7d" }
  );
};
