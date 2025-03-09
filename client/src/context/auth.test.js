import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";
import axios from "axios";

jest.mock("axios");

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const MockComponent = () => {
    const [auth, setAuth] = useAuth();
    
    return (
        <div>
            <p data-testid="user">{auth.user ? auth.user.name : "No User"}</p>
            <p data-testid="token">{auth.token || "No Token"}</p>
            <button onClick={() => setAuth({ user: { name: "New User" }, token: "new-token" })}>
                Update Auth
            </button>
        </div>
    );
};

describe("Auth Context", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should initialize with default values", () => {
        render(
            <AuthProvider>
                <MockComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId("user").textContent).toBe("No User");
        expect(screen.getByTestId("token").textContent).toBe("No Token");
    });

    it("should retrieve auth data from localStorage on mount", async () => {
        localStorageMock.getItem.mockReturnValue(
            JSON.stringify({ user: { name: "John Doe" }, token: "test-token" })
        );

        render(
            <AuthProvider>
                <MockComponent />
            </AuthProvider>
        );

        await screen.findByTestId("token");

        expect(screen.getByTestId("user").textContent).toBe("John Doe");
        expect(screen.getByTestId("token").textContent).toBe("test-token");
    });

    it("should set axios authorization header when token is available", async () => {
        render(
            <AuthProvider>
                <MockComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText("Update Auth").click();
        });

        await screen.findByTestId("token");

        expect(axios.defaults.headers.common["Authorization"]).toBe("new-token");
    });
});
