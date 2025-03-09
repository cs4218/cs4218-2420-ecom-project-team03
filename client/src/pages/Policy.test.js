import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Policy from "./Policy";

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()])
}));

jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));

describe("Policy Component", () => {
    it("Should render Policy with image and policies", () => {
        render(
          <MemoryRouter>
              <Policy />
          </MemoryRouter>);
        
        expect(screen.getByAltText("contactus")).toBeInTheDocument();
        expect(screen.getByAltText("contactus")).toHaveAttribute("src", "/images/contactus.jpeg");

        const privacy_policies = screen.getAllByText("add privacy policy");
        expect(privacy_policies).toHaveLength(7);
    });
});
