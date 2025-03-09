// Search.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSearch } from '../context/search';
import Search from './Search';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';

// Mock useSearch hook
const mockSetValues = jest.fn();
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '', results: [] }, mockSetValues])
}));  

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));
  
jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
  
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '', results: [] }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));
  
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

// Mock toast
jest.mock('react-hot-toast');

// Mock the localStorage
Object.defineProperty(window, "localStorage", {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

describe('Search', () => {
  it('renders no results message when there are no results', () => {
    // Mock the useSearch hook to return no results
    useSearch.mockReturnValue([{ keyword: '', results: [] }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
    );

    // Check if the no results were rendered
    expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  });

  it('renders search results correctly', () => {
    // Mock the useSearch hook to return some results
    const mockResults = [
      { _id: '1', name: 'Product 1', description: 'Description 1', price: 10 },
      { _id: '2', name: 'Product 2', description: 'Description 2', price: 20 },
    ];
    useSearch.mockReturnValue([{ keyword: '', results: mockResults }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
    );

    // Check if the search results are rendered
    expect(screen.getByText(/Found 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/More Details/i)).toHaveLength(2);
    expect(screen.getAllByText(/Add To Cart/i)).toHaveLength(2);
  });

  it('renders product details correctly', () => {
    // Mock the useSearch hook to return some results
    const mockResults = [
      { _id: '1', name: 'Product 1', description: 'Description 1', price: 10 },
      { _id: '2', name: 'Product 2', description: 'Description 2', price: 20 },
    ];
    useSearch.mockReturnValue([{ keyword: '', results: mockResults }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Description 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 10/i)).toBeInTheDocument();

    expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Description 2/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 20/i)).toBeInTheDocument();
  });

  it('renders product details with "..." only if the description is longer than 30 characters', () => {
    // Mock the useSearch hook to return some results
    const mockResults = [
      { _id: '1', name: 'Product 1', description: 'Description 1', price: 10 },
      { _id: '2', name: 'Product 2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', price: 20 },
    ];
    useSearch.mockReturnValue([{ keyword: '', results: mockResults }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Description 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 10/i)).toBeInTheDocument();

    expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Lorem ipsum dolor sit amet, co.../i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 20/i)).toBeInTheDocument();
  });

  it('adds product to cart when Add to Cart button is clicked', () => {
    const mockResults = [
      { _id: '1', name: 'Product 1', description: 'Description 1', price: 10 },
      { _id: '2', name: 'Product 2', description: 'Description 2', price: 20 },
      { _id: '3', name: 'Product 3', description: 'Description 3', price: 30 },
    ];
    useSearch.mockReturnValue([{ keyword: '', results: mockResults }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
    );

    // Click the Add to Cart button for the first product
    fireEvent.click(screen.getAllByText(/Add To Cart/i)[2]);

    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Item added to cart");
  });

  it("navigates to product page when clicking More Details button", () => {
    // Mock the useSearch hook to return some results
    const mockResults = [
        { _id: '1', name: 'Product 1', description: 'Description 1', price: 10 },
        { _id: '2', name: 'Product 2', description: 'Description 2', price: 20 },
    ];
    useSearch.mockReturnValue([{ keyword: '', results: mockResults }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
        <Routes>
            <Route path="/search" element={<Search />} />
        </Routes>
        </MemoryRouter>
    );

    // Click the More Details button
    fireEvent.click(screen.getAllByText(/More Details/i)[0]);

    // Expect navigation to product page
    expect(mockNavigate).toHaveBeenCalledWith(`/product/1`);
  });
});