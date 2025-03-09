import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Dashboard from "./Dashboard";

// Mock the useAuth hook to return a test user
jest.mock("../../context/auth", () => ({
    useAuth: () => [
        {
            user: {
                name: "John Doe",
                email: "john@example.com",
                address: "123 Main Street",
            },
        },
    ],
}));

// Mock the Layout component to render its children and title
jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div data-testid="layout">
        <h1>{title}</h1>
        {children}
    </div>
));

// Mock the UserMenu component
jest.mock("../../components/UserMenu", () => () => (
    <div data-testid="user-menu">User Menu</div>
));

describe("Dashboard Component", () => {
    it("Should render Dashboard with user information", () => {
        render(<Dashboard />);
        
        // Assert that the title is rendered
        expect(screen.getByText("Dashboard - Ecommerce App")).toBeInTheDocument();
        
        // Assert that the user menu is present
        expect(screen.getByTestId("user-menu")).toBeInTheDocument();
        
        // Assert that user details are rendered correctly
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("123 Main Street")).toBeInTheDocument();
    });

    it("Should render Dashboard gracefully when no user info is available", () => {
        jest.resetModules();
        jest.doMock("../../context/auth", () => ({
            useAuth: () => [{}],
        }));

        const DashboardNoAuth = require("./Dashboard").default;
        render(<DashboardNoAuth />);

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
        expect(screen.queryByText("123 Main Street")).not.toBeInTheDocument();
    });
});