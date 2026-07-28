import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import {
  hashPassword,
  comparePassword,
  generateJWT,
  verifyTOTPToken,
  generateBackupCodes,
  hashBackupCode,
  findBackupCodeIndex,
} from "./auth.js";

describe("hashPassword / comparePassword", () => {
  it("hache le mot de passe (le hash ne contient pas le mot de passe en clair)", () => {
    const hash = hashPassword("SuperSecret123!");
    expect(hash).not.toBe("SuperSecret123!");
  });

  it("valide le bon mot de passe contre son hash", () => {
    const hash = hashPassword("SuperSecret123!");
    expect(comparePassword("SuperSecret123!", hash)).toBe(true);
  });

  it("rejette un mauvais mot de passe", () => {
    const hash = hashPassword("SuperSecret123!");
    expect(comparePassword("MauvaisMotDePasse", hash)).toBe(false);
  });
});

describe("generateJWT", () => {
  it("génère un token contenant l'id et l'email de l'utilisateur", () => {
    const token = generateJWT(42, "user@example.com");
    const decoded = jwt.decode(token) as { id: number; email: string };
    expect(decoded.id).toBe(42);
    expect(decoded.email).toBe("user@example.com");
  });

  it("génère un token vérifiable avec le même secret", () => {
    const token = generateJWT(1, "a@b.com");
    expect(() => jwt.verify(token, "test-secret-do-not-use-in-prod")).not.toThrow();
  });
});

describe("verifyTOTPToken", () => {
  it("valide un code TOTP généré avec le même secret", () => {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    const token = speakeasy.totp({ secret, encoding: "base32" });
    expect(verifyTOTPToken(secret, token)).toBe(true);
  });

  it("rejette un code TOTP invalide", () => {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    expect(verifyTOTPToken(secret, "000000")).toBe(false);
  });
});

describe("codes de secours 2FA", () => {
  it("génère le nombre de codes demandé, au format XXXX-XXXX", () => {
    const codes = generateBackupCodes(8);
    expect(codes).toHaveLength(8);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });

  it("retrouve l'index du code de secours correspondant, insensible à la casse", () => {
    const [code] = generateBackupCodes(1);
    const hashed = [hashBackupCode("AAAA-AAAA"), hashBackupCode(code)];
    expect(findBackupCodeIndex(hashed, code.toLowerCase())).toBe(1);
  });

  it("retourne -1 si aucun code de secours ne correspond", () => {
    const hashed = [hashBackupCode("AAAA-AAAA"), hashBackupCode("BBBB-BBBB")];
    expect(findBackupCodeIndex(hashed, "ZZZZ-ZZZZ")).toBe(-1);
  });
});
