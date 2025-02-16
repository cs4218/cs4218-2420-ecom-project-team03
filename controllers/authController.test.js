import bcrypt from "bcrypt";
import { registerController } from "./authController.js";
import userModel from "../models/userModel.js";
import { jest } from "@jest/globals";

jest.spyOn(bcrypt, "hash");

jest.spyOn(userModel, "findOne");
jest.spyOn(userModel, "create");

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
