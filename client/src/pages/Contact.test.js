import React from "react";
import Layout from "./../components/Layout";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Contact from "./Contact";

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()])
}));

jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));

describe("Contact Component", () => {
    it("Should render Contact with contact information", () => {
        render(
          <MemoryRouter>
              <Contact />
          </MemoryRouter>);

        expect(screen.getByText("CONTACT US")).toBeInTheDocument();
        expect(screen.getByAltText("contactus")).toBeInTheDocument();
        expect(screen.getByAltText("contactus")).toHaveAttribute("src", "/images/contactus.jpeg");

        expect(screen.getByText("For any query or info about product, feel free to call anytime. We are available 24X7.")).toBeInTheDocument();
        expect(screen.getByText(/www\.help@ecommerceapp\.com/)).toBeInTheDocument();
        expect(screen.getByText(/012-3456789/)).toBeInTheDocument();
        expect(screen.getByText(/1800-0000-0000 \(toll free\)/)).toBeInTheDocument();
      });
});
