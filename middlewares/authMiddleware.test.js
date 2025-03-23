import { requireSignIn, isAdmin } from "./authMiddleware.js";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { expect, jest } from "@jest/globals";

jest.spyOn(JWT, "verify");

jest.spyOn(userModel, "findById");

describe("Auth Middleware", () => {
    let req, res, next;
    const mockUserId = "123456789abcdef";
    const mockToken = "valid-token";
    
    beforeEach(() => {
        jest.clearAllMocks();
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    it("should decode a valid JWT token and attach user to req", async () => {
        const mockDecodedUser = { _id: mockUserId, role: 1 };

        JWT.verify.mockReturnValue(mockDecodedUser);
        req.headers.authorization = mockToken;

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
        expect(req.user).toEqual(mockDecodedUser);
        expect(next).toHaveBeenCalled();
    });

    it("should return an error when JWT verification fails", async () => {
        JWT.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        req.headers.authorization = "invalid-token";

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledWith("invalid-token", process.env.JWT_SECRET);
        expect(req.user).toBeUndefined();
        expect(next).not.toHaveBeenCalled();
    });

    // 🔹 Test isAdmin()
    it("should allow access if user is an admin", async () => {
        req.user = { _id: mockUserId, role: 1 };
        userModel.findById.mockResolvedValue(req.user);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith(mockUserId);
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 if user is not an admin", async () => {
        req.user = { _id: mockUserId, role: 0 };
        userModel.findById.mockResolvedValue(req.user);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith(mockUserId);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "UnAuthorized Access",
        });
    });

    it("should return 401 if user is not found", async () => {
        req.user = { _id: mockUserId };
        userModel.findById.mockResolvedValue(null);

        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledWith(mockUserId);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error in admin middleware",
            error: expect.anything(),
        });
    });
});
