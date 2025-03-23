import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Orders from './Orders';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('axios');

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [{ token: 'fake-token' }])
}));

jest.mock('../../components/UserMenu', () => () => <div>UserMenu</div>);

jest.mock('../../components/Layout', () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

const mockAuth = {
  user: {
      name: 'User',
      email: 'user@example.com',
      phone: '123-456-7890',
  },
  token: 'fake-token',
};

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [mockAuth]),
}));

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const mockOrders = [
  {
    _id: 'order1',
    status: 'Delivered',
    buyer: { name: 'Buyer One' },
    createAt: '2024-03-01T00:00:00Z',
    payment: { success: true },
    products: [
      { _id: 'prod1', name: 'Product A', description: 'This is a good product', price: 100 },
      { _id: 'prod2', name: 'Product B', description: 'Another great product', price: 200 },
      { _id: 'prod3', name: 'Product C', description: 'Yet another product', price: 120 },
      { _id: 'prod4', name: 'Product D', description: 'The very best product', price: 69 },
      { _id: 'prod5', name: 'Product E', description: 'Truly the very worst product', price: 420 },
    ],
  },
  {
    _id: 'order2',
    status: 'Processing',
    buyer: { name: 'Buyer Two' },
    createAt: '2024-03-02T00:00:00Z',
    payment: { success: false },
    products: [
      { _id: 'prod3', name: 'Product C', description: 'Yet another product', price: 120 },
      { _id: 'prod4', name: 'Product D', description: 'The very best product', price: 69 },
      { _id: 'prod5', name: 'Product E', description: 'Truly the very worst product', price: 420 },
      { _id: 'prod6', name: 'Product F', description: 'The most mediocre product', price: 300 },
      { _id: 'prod7', name: 'Product G', description: 'The most average product', price: 222 },
      { _id: 'prod8', name: 'Product H', description: 'The most expensive product', price: 999 },
      { _id: 'prod9', name: 'Product I', description: 'Product for the ages', price: 42 },
    ],
  },
];

describe('Orders Component', () => {
    beforeEach(() => {

      axios.get.mockResolvedValue({ data: mockOrders });
    });

    it('should fetch and display orders', async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
  
        // Check that the header from Layout and main title are rendered
        expect(screen.getByText('Your Orders')).toBeInTheDocument();
        expect(screen.getByText('All Orders')).toBeInTheDocument();
    
        // Check for buyer names and statuses
        expect(screen.getByText('Buyer One')).toBeInTheDocument();
        expect(screen.getByText('Buyer Two')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
    
        // Check payment status text
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
    
        // Check Quantity - order1 has 5 products and order2 has 6 product
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
      });
    });
  
    it('should render order details correctly', async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        // Product details from order1
        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText(/This is a good product/)).toBeInTheDocument();
        expect(screen.getByText('Price : 100')).toBeInTheDocument();
  
        expect(screen.getByText('Product B')).toBeInTheDocument();
        expect(screen.getByText(/Another great product/)).toBeInTheDocument();
        expect(screen.getByText('Price : 200')).toBeInTheDocument();
  
        expect(screen.getAllByText('Product C')).toHaveLength(2);
        expect(screen.getAllByText(/Yet another product/)).toHaveLength(2);
        expect(screen.getAllByText('Price : 120')).toHaveLength(2);

        expect(screen.getAllByText('Product D')).toHaveLength(2);
        expect(screen.getAllByText(/The very best product/)).toHaveLength(2);
        expect(screen.getAllByText('Price : 69')).toHaveLength(2);

        expect(screen.getAllByText('Product E')).toHaveLength(2);
        expect(screen.getAllByText(/Truly the very worst product/)).toHaveLength
        expect(screen.getAllByText('Price : 420')).toHaveLength(2);

        expect(screen.queryByText('Product F')).toBeInTheDocument();
        expect(screen.queryByText(/The most mediocre product/)).toBeInTheDocument();
        expect(screen.queryByText('Price : 300')).toBeInTheDocument();

        expect(screen.queryByText('Product G')).toBeInTheDocument();
        expect(screen.queryByText(/The most average product/)).toBeInTheDocument();
        expect(screen.queryByText('Price : 222')).toBeInTheDocument();

        expect(screen.queryByText('Product H')).toBeInTheDocument();
        expect(screen.queryByText(/The most expensive product/)).toBeInTheDocument();
        expect(screen.queryByText('Price : 999')).toBeInTheDocument();

        expect(screen.queryByText('Product I')).toBeInTheDocument();
        expect(screen.queryByText(/Product for the ages/)).toBeInTheDocument();
        expect(screen.queryByText('Price : 42')).toBeInTheDocument();
      });
    });
  
    it('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      axios.get.mockRejectedValue(new Error('Network Error'));
  
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
      });
  
      // With an error, no orders will be rendered, but the header remains
      expect(screen.getByText('All Orders')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  
    it('renders gracefully when no orders are found', async () => {
      axios.get.mockResolvedValue({ data: [] });
  
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        // The header should still render even if there are no orders
        expect(screen.getByText('All Orders')).toBeInTheDocument();
      });
  
      // No table should be rendered when orders array is empty
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));

      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );

      await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
          expect(screen.getByText('All Orders')).toBeInTheDocument();
      });
    });
});