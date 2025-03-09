import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import CategoryProduct from "../pages/CategoryProduct";

// Mock axios
jest.mock("axios");

// Mock contexts
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("Category Product", () => {
    const mockProducts = [
        {
            _id: "product1",
            name: "Laptop",
            price: 1200,
            description: "High-end gaming laptop with great features",
            slug: "laptop",
        },
        {
            _id: "product2",
            name: "Phone",
            price: 800,
            description: "Latest smartphone with excellent camera",
            slug: "phone",
        },
    ];

    const mockCategory = { name: "Electronics" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch and display products in a category", async () => {
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts, category: mockCategory } });

        render(
            <MemoryRouter initialEntries={["/category/electronics"]}>
                <Routes>
                    <Route path="/category/:slug" element={<CategoryProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics"));

        expect(await screen.findByText("Category - Electronics")).toBeInTheDocument();
        expect(await screen.findByText("2 result found")).toBeInTheDocument();
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("$1,200.00")).toBeInTheDocument();
        expect(screen.getByText("$800.00")).toBeInTheDocument();
        expect(screen.getByText("High-end gaming laptop with great features...")).toBeInTheDocument();
        expect(screen.getByText("Latest smartphone with excellent camera...")).toBeInTheDocument();
    });

    it("should navigate to product details page when 'More Details' is clicked", async () => {
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts, category: mockCategory } });

        render(
            <MemoryRouter initialEntries={["/category/electronics"]}>
                <Routes>
                    <Route path="/category/:slug" element={<CategoryProduct />} />
                    <Route path="/product/:slug" element={<div>Product Details Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

        fireEvent.click(screen.getAllByText("More Details")[0]);

        await waitFor(() => expect(screen.getByText("Product Details Page")).toBeInTheDocument());
    });

    it("should display an error message when API fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("API error"));

        render(
            <MemoryRouter initialEntries={["/category/electronics"]}>
                <Routes>
                    <Route path="/category/:slug" element={<CategoryProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
        expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    });
});
