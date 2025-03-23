import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';
import AdminOrders from './AdminOrders';
import { AuthProvider } from '../../context/auth';
import { CartProvider } from '../../context/cart';
import { SearchProvider } from '../../context/search';

axios.defaults.baseURL = 'http://localhost:6060';

const adminCredentials = {
    email: 'test@example.com',
    password: 'password123',
};

const loginAdmin = async () => {
    const res = await axios.post('/api/v1/auth/login', adminCredentials);
    const token = res.data.token;
    localStorage.setItem('auth', JSON.stringify(res.data));
    axios.defaults.headers.common['Authorization'] = token;
};

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  };
};

describe('AdminOrders Integration Test', () => {
    beforeAll(async () => {
        await loginAdmin();
    });

    afterEach(() => {
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
    });

    it('renders admin orders with product details and buyer info', async () => {
        render(
            <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <MemoryRouter initialEntries={['/dashboard/admin/orders']}>
                            <Routes>
                                <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
                            </Routes>
                        </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('All Orders')).toBeInTheDocument();
          
            expect(screen.getAllByText('John Doe')).toHaveLength(3);
          
            expect(screen.getByText(/Processing/i)).toBeInTheDocument();
            expect(screen.getByText(/Not Process/i)).toBeInTheDocument();
          
            expect(screen.getAllByText('Laptop').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Smartphone').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Book').length).toBeGreaterThanOrEqual(1);

            expect(screen.getByText(/A powerful laptop/i)).toBeInTheDocument();
            expect(screen.getByText(/A high-end smartphone/i)).toBeInTheDocument();
            expect(screen.getByText(/A thick book/i)).toBeInTheDocument();
          
            expect(screen.getByText(/Price\s*:\s*1499\.99/)).toBeInTheDocument();
            expect(screen.getByText(/Price\s*:\s*99\.99/)).toBeInTheDocument();
            expect(screen.getByText(/Price\s*:\s*10/)).toBeInTheDocument();
          
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Failed')).toBeInTheDocument();

            expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
          });                
    });

    it('handles API error gracefully when fetching orders fails', async () => {
        const mockError = new Error('API fetch failed');
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(); // suppress real console
      
        // Mock axios.get to throw an error
        axios.get = jest.fn().mockRejectedValueOnce(mockError);
      
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={['/dashboard/admin/orders']}>
                  <Routes>
                    <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
                  </Routes>
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      
        await waitFor(() => {
          // Check that error is logged
          expect(consoleSpy).toHaveBeenCalledWith(mockError);
      
          // You can optionally check that no orders rendered
          expect(screen.getByText('All Orders')).toBeInTheDocument();
          expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // assuming no data
        });
      
        consoleSpy.mockRestore();
      });
});
