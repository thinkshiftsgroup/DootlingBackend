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

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const generateAccessToken = (customerId: number): string => {
  return jwt.sign({ id: customerId, scope: "customer" }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions);
};

const generateRefreshToken = (customerId: number): string => {
  return jwt.sign({ id: customerId, scope: "customer" }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions);
};

export const register = async (
  storeId: number,
  email: string,
  firstName: string,
  lastName: string,
  password: string
) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!firstName || !firstName.trim()) throw new Error("First name is required");
  if (!lastName || !lastName.trim()) throw new Error("Last name is required");
  if (!password || !password.trim()) throw new Error("Password is required");
  if (!validateEmail(email.trim())) throw new Error("Invalid email format");
  if (!validatePassword(password)) throw new Error("Password must be at least 8 characters long");

  const existing = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (existing) throw new Error("Email already registered");

  const verificationCode = generateSixDigitCode();
  const verificationCodeExpires = getExpiry(15);
  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await prisma.customer.create({
    data: {
      storeId,
      email: email.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    },
  });

  await sendVerificationCodeEmail(email.toLowerCase(), verificationCode, `${firstName.trim()} ${lastName.trim()}`.trim());
  return { message: "Registration successful. Please check your email for verification code.", customerId: customer.id };
};

export const verifyEmail = async (storeId: number, email: string, code: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!code || !code.trim()) throw new Error("Verification code is required");

  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer) throw new Error("Customer not found");
  if (customer.isVerified) throw new Error("Email already verified");
  if (!customer.verificationCode || customer.verificationCode !== code.trim()) throw new Error("Invalid verification code");
  if (!customer.verificationCodeExpires || customer.verificationCodeExpires < new Date()) throw new Error("Verification code expired");

  await prisma.customer.update({
    where: { id: customer.id },
    data: { isVerified: true, verificationCode: null, verificationCodeExpires: null },
  });

  const accessToken = generateAccessToken(customer.id);
  const refreshToken = generateRefreshToken(customer.id);
  await prisma.customer.update({ where: { id: customer.id }, data: { refreshToken } });

  return {
    accessToken,
    refreshToken,
    customer: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName, isVerified: true },
  };
};

export const resendVerificationCode = async (storeId: number, email: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer) throw new Error("Customer not found");
  if (customer.isVerified) throw new Error("Email already verified");

  const verificationCode = generateSixDigitCode();
  const verificationCodeExpires = getExpiry(15);
  await prisma.customer.update({ where: { id: customer.id }, data: { verificationCode, verificationCodeExpires } });
  await sendVerificationCodeEmail(email.toLowerCase(), verificationCode, `${customer.firstName} ${customer.lastName}`.trim());
  return { message: "Verification code resent successfully" };
};

export const login = async (storeId: number, email: string, password: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!password || !password.trim()) throw new Error("Password is required");

  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer || !customer.password) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, customer.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");
  if (!customer.isVerified) throw new Error("Please verify your email first");

  const accessToken = generateAccessToken(customer.id);
  const refreshToken = generateRefreshToken(customer.id);
  await prisma.customer.update({ where: { id: customer.id }, data: { refreshToken, lastActive: new Date() } });

  return {
    accessToken,
    refreshToken,
    customer: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: number };
    const customer = await prisma.customer.findUnique({ where: { id: decoded.id } });
    if (!customer || customer.refreshToken !== refreshToken) throw new Error("Invalid refresh token");
    const newAccessToken = generateAccessToken(customer.id);
    return { accessToken: newAccessToken };
  } catch (e) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const forgotPassword = async (storeId: number, email: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer) throw new Error("Customer not found");

  const resetCode = generateSixDigitCode();
  const resetPasswordExpires = getExpiry(15);
  await prisma.customer.update({ where: { id: customer.id }, data: { resetPasswordToken: resetCode, resetPasswordExpires } });
  await sendPasswordResetCodeEmail(email.toLowerCase(), resetCode, `${customer.firstName} ${customer.lastName}`.trim());
  return { message: "Password reset code sent to your email" };
};

export const verifyResetCode = async (storeId: number, email: string, code: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!code || !code.trim()) throw new Error("Reset code is required");
  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer) throw new Error("Customer not found");
  if (!customer.resetPasswordToken || customer.resetPasswordToken !== code.trim()) throw new Error("Invalid reset code");
  if (!customer.resetPasswordExpires || customer.resetPasswordExpires < new Date()) throw new Error("Reset code expired");
  return { message: "Reset code verified", email: customer.email };
};

export const resetPassword = async (storeId: number, email: string, code: string, newPassword: string) => {
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!code || !code.trim()) throw new Error("Reset code is required");
  if (!newPassword || !newPassword.trim()) throw new Error("New password is required");
  if (!validatePassword(newPassword)) throw new Error("Password must be at least 8 characters long");
  const customer = await prisma.customer.findFirst({ where: { storeId, email: email.toLowerCase() } });
  if (!customer) throw new Error("Customer not found");
  if (!customer.resetPasswordToken || customer.resetPasswordToken !== code.trim()) throw new Error("Invalid reset code");
  if (!customer.resetPasswordExpires || customer.resetPasswordExpires < new Date()) throw new Error("Reset code expired");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.customer.update({ where: { id: customer.id }, data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null } });
  return { message: "Password reset successful" };
};

export const logout = async (customerId: number) => {
  await prisma.customer.update({ where: { id: customerId }, data: { refreshToken: null } });
  return { message: "Logged out successfully" };
};

export const updateProfile = async (
  storeId: number,
  customerId: number,
  data: {
    phone?: string;
    instagramHandle?: string;
    additionalInfo?: string;
    shippingAddress?: string;
    shippingCountry?: string;
    shippingState?: string;
    shippingCity?: string;
    shippingZipCode?: string;
    billingAddress?: string;
    billingCountry?: string;
    billingState?: string;
    billingCity?: string;
    billingZipCode?: string;
    sameAsShippingAddress?: boolean;
    subscribedToNewsletter?: boolean;
    customerGroupId?: number | null;
    firstName?: string;
    lastName?: string;
  }
) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.storeId !== storeId) throw new Error("Customer not found");

  const allowed: any = {};
  const fields = [
    "phone",
    "instagramHandle",
    "additionalInfo",
    "shippingAddress",
    "shippingCountry",
    "shippingState",
    "shippingCity",
    "shippingZipCode",
    "billingAddress",
    "billingCountry",
    "billingState",
    "billingCity",
    "billingZipCode",
    "sameAsShippingAddress",
    "subscribedToNewsletter",
    "customerGroupId",
    "firstName",
    "lastName",
  ] as const;

  for (const key of fields) {
    if (key in data) (allowed as any)[key] = (data as any)[key];
  }

  const updated = await prisma.customer.update({ where: { id: customerId }, data: allowed });
  return { message: "Profile updated", customer: updated };
};
