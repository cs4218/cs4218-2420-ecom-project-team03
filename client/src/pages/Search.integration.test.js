import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSearch, SearchProvider } from '../context/search';
import SearchInput from '../components/Form/SearchInput';
import ProductDetails from './ProductDetails';
import CartPage from './CartPage';
import Search from './Search';
import axios from 'axios';

// Mock axios
jest.mock('axios');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));
  
jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock('react-hot-toast');

describe('Search Integration', () => {
    beforeEach(() => {
        // Mock localStorage
        window.localStorage = {
            getItem: jest.fn(() => null),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        };

        // Mock the search API response
        axios.get.mockResolvedValue({
          data: [
            {
              _id: '1',
              name: 'Test Product',
              description: 'This is a test product',
              price: 10.99,
            },
          ],
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

  it('should display search results after submitting a search query', async () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
            <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
            </Routes>
            </SearchProvider>
        </MemoryRouter>
    );

    // Find the search input and submit button
    const searchInput = screen.getByPlaceholderText('Search');
    const submitButton = screen.getByRole('button', { name: 'Search' });

    // Enter a search query and submit the form
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    // Wait for the search results to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Found 1/)).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('This is a test product')).toBeInTheDocument();
      expect(screen.getByText('$ 10.99')).toBeInTheDocument();
    });
  });

  it('should navigate to product details page when clicking "More Details"', async () => {
    render(
        <MemoryRouter initialEntries={['/search']}>
            <SearchProvider>
            <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
                <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
            </SearchProvider>
        </MemoryRouter>
    );

    // Enter a search query and submit the form
    const searchInput = screen.getByPlaceholderText('Search');
    const submitButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    // Wait for the search results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click the "More Details" button
    const moreDetailsButton = screen.getByRole('button', { name: 'More Details' });
    fireEvent.click(moreDetailsButton);

    // Check if navigate was called with the correct path
    await waitFor(() => expect(screen.getByText("Product Details")).toBeInTheDocument());
  });

  it('should add product to cart when clicking "Add To Cart"', async () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
            <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
            </Routes>
            </SearchProvider>
        </MemoryRouter>
    );

    // Enter a search query and submit the form
    const searchInput = screen.getByPlaceholderText('Search');
    const submitButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    // Wait for the search results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click the "Add To Cart" button
    const addToCartButton = screen.getByRole('button', { name: 'Add To Cart' });
    fireEvent.click(addToCartButton);

    // Check if the product is added to the cart
    expect(localStorage.getItem('cart')).toContain('Test Product');

    // Dynamically render the CartPage component
    render(
        <MemoryRouter initialEntries={['/cart']}>
            <SearchProvider>
            <Routes>
                <Route path="/cart" element={<CartPage />} />
            </Routes>
            </SearchProvider>
        </MemoryRouter>
    );

    // Wait for the cart page to load and verify the cart contents
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$ 10.99')).toBeInTheDocument();
    });
  });

  it('should display "No Products Found" when no products match the search query', async () => {
    // Mock the search API response to return an empty array
    axios.get.mockResolvedValue({ data: [] });

    render(
        <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
            <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
            </Routes>
            </SearchProvider>
        </MemoryRouter>
    );

    // Find the search input and submit button
    const searchInput = screen.getByPlaceholderText('Search');
    const submitButton = screen.getByRole('button', { name: 'Search' });

    // Enter a search query and submit the form
    fireEvent.change(searchInput, { target: { value: 'noresults' } });
    fireEvent.click(submitButton);

    // Wait for the "No Products Found" message to be displayed
    await waitFor(() => {
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });
  });

  it('should display "No Products Found" when the search query is empty', async () => {
    // Mock the search API response to return an empty array
    axios.get.mockResolvedValue({ data: [] });
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchProvider>
          <Routes>
            <Route path="/" element={<SearchInput />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </SearchProvider>
      </MemoryRouter>
    );
  
    // Find the search input and submit button
    const searchInput = screen.getByPlaceholderText('Search');
    const submitButton = screen.getByRole('button', { name: 'Search' });
  
    // Enter an empty search query and submit the form
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.click(submitButton);
  
    // Wait for the "No Products Found" message to be displayed
    await waitFor(() => {
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });
  });
});