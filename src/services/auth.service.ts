import { prisma } from "../prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { generateSixDigitCode } from "../utils/codeGenerator";
import { sendVerificationCodeEmail, sendPasswordResetCodeEmail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_UNSAFE_DEFAULT_SECRET";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "YOUR_UNSAFE_REFRESH_SECRET";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const getExpiry = (minutes: number): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

const generateUniqueUsername = (fullName: string): string => {
  const sanitizedName = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const specialDigits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${sanitizedName.substring(0, 11)}${specialDigits}`;
};

const generateAccessToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions);
};

const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions);
};

export const register = async (email: string, firstname: string, lastname: string, password: string, phone?: string, howDidYouFindUs?: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  // Generate fullName from firstname and lastname
  const fullName = `${firstname} ${lastname}`.trim();

  const username = generateUniqueUsername(fullName);
  const verificationCode = generateSixDigitCode();
  const verificationCodeExpires = getExpiry(15);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      firstname,
      lastname,
      phone,
      howDidYouFindUs,
      username,
      verificationCode,
      verificationCodeExpires,
    },
  });

  await sendVerificationCodeEmail(email, verificationCode, fullName);
  return { message: "Registration successful. Please check your email for verification code.", userId: user.id };
};

export const verifyEmail = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");
  if (!user.verificationCode || user.verificationCode !== code) throw new Error("Invalid verification code");
  if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) throw new Error("Verification code expired");

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationCode: null, verificationCodeExpires: null },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName, isVerified: true } };
};

export const resendVerificationCode = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");

  const verificationCode = generateSixDigitCode();
  const verificationCodeExpires = getExpiry(15);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationCode, verificationCodeExpires },
  });

  await sendVerificationCodeEmail(email, verificationCode, user.fullName);
  return { message: "Verification code resent successfully" };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  if (!user.isVerified) throw new Error("Please verify your email first");

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken, lastActive: new Date() } });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName, username: user.username } };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== refreshToken) throw new Error("Invalid refresh token");

    const newAccessToken = generateAccessToken(user.id);
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetCode = generateSixDigitCode();
  const resetPasswordExpires = getExpiry(15);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetCode, resetPasswordExpires },
  });

  await sendPasswordResetCodeEmail(email, resetCode, user.fullName);
  return { message: "Password reset code sent to your email" };
};

export const verifyResetCode = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.resetPasswordToken || user.resetPasswordToken !== code) throw new Error("Invalid reset code");
  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) throw new Error("Reset code expired");

  return { message: "Reset code verified", email: user.email };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.resetPasswordToken || user.resetPasswordToken !== code) throw new Error("Invalid reset code");
  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) throw new Error("Reset code expired");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
  });

  return { message: "Password reset successful" };
};

export const logout = async (userId: number) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  return { message: "Logged out successfully" };
};

export const setPassword = async (userId: number, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};
