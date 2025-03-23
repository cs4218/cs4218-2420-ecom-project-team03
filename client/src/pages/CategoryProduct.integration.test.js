import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';
import CategoryProduct from './CategoryProduct';
import { CartProvider } from '../context/cart';
import { AuthProvider } from '../context/auth';
import { SearchProvider } from '../context/search';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast')

axios.defaults.baseURL = "http://localhost:6060";

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  };
};

describe('CategoryProduct integration', () => {
  it('renders Electronic category with Laptop and Smartphone', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/category/electronic']}>
              <Routes>
                <Route path="/category/:slug" element={<CategoryProduct />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Category - Electronic')).toBeInTheDocument();

      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Smartphone')).toBeInTheDocument();

      expect(screen.getByText('$1,499.99')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('shows toast when API call fails', async () => {
    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('API error'));

    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/category/electronic']}>
              <Routes>
                <Route path="/category/:slug" element={<CategoryProduct />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while fetching categories data");
    });
  });
});
