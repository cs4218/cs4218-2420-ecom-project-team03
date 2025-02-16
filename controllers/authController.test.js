import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { registerController, loginController, forgotPasswordController, testController } from "./authController.js";
import userModel from "../models/userModel.js";
import { jest } from "@jest/globals";

jest.spyOn(bcrypt, "hash");
jest.spyOn(bcrypt, "compare")
jest.spyOn(JWT, "sign");

jest.spyOn(userModel, "findOne");
jest.spyOn(userModel, "create");
jest.spyOn(userModel, "findByIdAndUpdate");

describe("Register Controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                address: "123 Street",
                answer: "password123",
                email: "test@example.com",
                name: "John Doe",
                password: "password123",
                phone: "1234567890",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    it("should return an error if required fields are missing", async () => {
        req.body.name = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });

        req.body = { ...req.body, name: "John Doe", email: "" };
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });

        req.body = { ...req.body, email: "test@example.com", password: "" };
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });

        req.body = { ...req.body, password: "password123", phone: "" };
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });

        req.body = { ...req.body, phone: "1234567890", address: "" };
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });

        req.body = { ...req.body, address: "123 Street", answer: "" };
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
    });

    it("should return an error if user already exists", async () => {
        userModel.findOne.mockResolvedValue({ email: "test@example.com" });

        await registerController(req, res);

        expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Already Register please login",
        });
    });

    it("should register a new user successfully", async () => {
        userModel.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashedPassword");

        const newUser = {
            address: "123 Street",
            answer: "password123",
            email: "test@example.com",
            name: "John Doe",
            password: "password123",
            phone: "1234567890",
        };

        userModel.create.mockResolvedValue(newUser);
        userModel.collection.insertOne = jest.fn().mockResolvedValue({ insertedId: "mockId" });

        await registerController(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

        const hashedUser = {
            address: "123 Street",
            answer: "password123",
            email: "test@example.com",
            name: "John Doe",
            password: "hashedPassword",
            phone: "1234567890",
        };

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "User Register Successfully",
            user: expect.objectContaining(hashedUser),
        });
    });

    it("should return a 500 error if an exception occurs", async () => {
        userModel.findOne.mockRejectedValue(new Error("Database error"));

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Errro in Registeration",
            error: expect.any(Error),
        });
    });
});

describe("Login Controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                email: "test@example.com",
                password: "password123",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    it("should return an error if email or password is missing", async () => {
        req.body = { email: "", password: "password123" };
        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password",
        });

        req.body = { email: "test@example.com", password: "" };
        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password",
        });
    });

    it("should return an error if user is not registered", async () => {
        userModel.findOne.mockResolvedValue(null);

        await loginController(req, res);

        expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Email is not registerd",
        });
    });

    it("should return an error if password is incorrect", async () => {
        userModel.findOne.mockResolvedValue({
            _id: "user123",
            email: "test@example.com",
            password: "hashedPassword",
        });

        bcrypt.compare.mockResolvedValue(false);

        await loginController(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid Password",
        });
    });

    it("should return a token if login is successful", async () => {
        userModel.findOne.mockResolvedValue({
            _id: "user123",
            name: "John Doe",
            email: "test@example.com",
            phone: "1234567890",
            address: "123 Street",
            role: 0,
            password: "hashedPassword",
        });

        bcrypt.compare.mockResolvedValue(true);
        JWT.sign.mockReturnValue("mockToken123");

        await loginController(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(JWT.sign).toHaveBeenCalledWith(
            { _id: "user123" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "login successfully",
            user: {
                _id: "user123",
                name: "John Doe",
                email: "test@example.com",
                phone: "1234567890",
                address: "123 Street",
                role: 0,
            },
            token: "mockToken123",
        });
    });

    it("should return a 500 error if an exception occurs", async () => {
        userModel.findOne.mockRejectedValue(new Error("Database error"));

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error in login",
            error: expect.any(Error),
        });
    });
});

describe("Forgot Password Controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                email: "test@example.com",
                answer: "oldPassword",
                newPassword: "newSecurePassword",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    it("should return an error if email, answer, or newPassword is missing", async () => {
        req.body = { email: "", answer: "oldPassword", newPassword: "newSecurePassword" };
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "Emai is required" });

        req.body = { email: "test@example.com", answer: "", newPassword: "newSecurePassword" };
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "answer is required" });

        req.body = { email: "test@example.com", answer: "oldPassword", newPassword: "" };
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
    });

    it("should return an error if user is not found", async () => {
        userModel.findOne.mockResolvedValue(null);

        await forgotPasswordController(req, res);

        expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com", answer: "oldPassword" });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Wrong Email Or Answer",
        });
    });

    it("should reset password successfully", async () => {
        userModel.findOne.mockResolvedValue({ _id: "user123" });
        bcrypt.hash.mockResolvedValue("hashedNewPassword");
        userModel.findByIdAndUpdate.mockResolvedValue({});

        await forgotPasswordController(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith("newSecurePassword", 10);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "user123",
            { password: "hashedNewPassword" }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Password Reset Successfully",
        });
    });

    it("should return a 500 error if an exception occurs", async () => {
        userModel.findOne.mockRejectedValue(new Error("Database error"));

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Something went wrong",
            error: expect.any(Error),
        });
    });
});

describe("Test Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            send: jest.fn(),
        };
    });

    it("should return 'Protected Routes'", () => {
        testController(req, res);

        expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });

    it("should handle unexpected errors", () => {
        const errorMock = new Error("Unexpected error");
        
        const faultyTestController = () => {
            throw errorMock;
        };

        try {
            faultyTestController();
        } catch (error) {
            expect(error).toBe(errorMock);
        }
    });
});
