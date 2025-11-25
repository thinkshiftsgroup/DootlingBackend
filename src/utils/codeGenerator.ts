import * as crypto from "crypto";

export const generateSixDigitCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};
