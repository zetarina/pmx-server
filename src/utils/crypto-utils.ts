import { scrypt, randomBytes, timingSafeEqual } from "crypto";

// Function to hash the password and return both the salt and hash
export async function hashPassword(
  password: string
): Promise<{ salt: string; hash: string }> {
  return new Promise<{ salt: string; hash: string }>((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve({ salt, hash: derivedKey.toString("hex") });
    });
  });
}

// Function to compare the password using the provided salt and hash
export async function comparePassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(timingSafeEqual(Buffer.from(hash, "hex"), derivedKey));
      } catch (e: any) {
        if (e.code === "ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH") {
          resolve(false); // Return false if buffer lengths do not match
        } else {
          reject(e);
        }
      }
    });
  });
}
