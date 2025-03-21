import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";
import { expect, jest } from "@jest/globals";

jest.spyOn(bcrypt, "hash");
jest.spyOn(bcrypt, "compare")

describe("Auth Helper", () => {
    const mockPassword = "securePassword123";
    const mockHashedPassword = "$2b$10$abcdefghijklmnopqrstuv";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should hash a password using bcrypt", async () => {
        bcrypt.hash.mockResolvedValue(mockHashedPassword);

        const result = await hashPassword(mockPassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
        expect(result).toBe(mockHashedPassword);
    });

    it("should compare passwords correctly using bcrypt", async () => {
        bcrypt.compare.mockResolvedValue(true);

        const isMatch = await comparePassword(mockPassword, mockHashedPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
        expect(isMatch).toBe(true);
    });

    it("should return false when passwords do not match", async () => {
        bcrypt.compare.mockResolvedValue(false);

        const isMatch = await comparePassword("wrongPassword", mockHashedPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith("wrongPassword", mockHashedPassword);
        expect(isMatch).toBe(false);
    });

    it("should handle errors in hashPassword gracefully", async () => {
        bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        const result = await hashPassword(mockPassword);

        expect(consoleSpy).toHaveBeenCalledWith(new Error("Hashing failed"));
        expect(result).toBeUndefined();

        consoleSpy.mockRestore();
    });
});
