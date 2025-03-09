import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminOrders from './AdminOrders';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import axios from 'axios';
import { describe } from 'node:test';

jest.mock('axios');

jest.mock('antd', () => {
    const antd = jest.requireActual('antd');

    const Select = ({ children, onChange }) => {
        return <select data-testid="mock-select" onChange={e => onChange(e.target.value)}>{children}</select>;
    };

    Select.Option = ({ children, ...otherProps }) => {
        return <option {...otherProps}>{children}</option>;
    };

    return {
        ...antd,
        Select,
    };
});

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu</div>);

const mockAuth = {
    user: {
        name: 'Admin User',
        email: 'admin@example.com',
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

// Axios mock response
axios.get.mockResolvedValue({ data: [] });

const mockOrders = [
    {
        _id: 'order1',
        buyer: { name: 'Buyer One' },
        status: 'Not Process',
        createAt: '2024-03-01',
        payment: { success: true },
        products: [],
    },
];

describe("AdminOrders", () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockOrders });
        axios.put.mockResolvedValue({ data: { success: true } });
    });

    it('renders AdminOrders component', async () => {
        axios.get.mockResolvedValue({ data: mockOrders });
    
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
    
        await waitFor(() => {
            expect(screen.getByText('All Orders')).toBeInTheDocument();
            expect(screen.getByText('Buyer One')).toBeInTheDocument();
        });
    });
    

    it('fetches orders on mount', async () => {
        axios.get.mockResolvedValue({ data: [{ _id: '123', status: 'Processing', buyer: { name: 'John' }, createAt: '2024-03-01', payment: { success: true }, products: [] }] });

        render(<AdminOrders />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
            expect(screen.getByText('John')).toBeInTheDocument();
        });
    });

    it('renders order details correctly', async () => {
        const ordersData = [
            {
                _id: 'order123',
                status: 'Shipped',
                buyer: { name: 'Alice' },
                createAt: '2024-03-01',
                payment: { success: true },
                products: [{ _id: 'prod1', name: 'Product A', description: 'Good product', price: 100 }],
            },
        ];

        axios.get.mockResolvedValue({ data: ordersData });

        render(<AdminOrders />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Shipped')).toBeInTheDocument();
            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('Good product')).toBeInTheDocument();
            expect(screen.getByText('Price : 100')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));

        render(<AdminOrders />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
            expect(screen.getByText('All Orders')).toBeInTheDocument();
        });
    });

    it('tests handleChange function correctly', async () => {
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Not Process')).toBeInTheDocument());

        const select = screen.getByTestId('mock-select');
        userEvent.selectOptions(select, 'Processing');

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/${mockOrders[0]._id}`, { status: 'Processing' });
        });
    });

    it('handles errors in handleChange function gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockError = new Error('Update Error');
        axios.put.mockRejectedValue(mockError);
    
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
    
        await waitFor(() => expect(screen.getByText('Not Process')).toBeInTheDocument());
    
        const select = screen.getByTestId('mock-select');
        userEvent.selectOptions(select, 'Processing');
    
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/${mockOrders[0]._id}`, { status: 'Processing' });
            expect(consoleSpy).toHaveBeenCalledWith(mockError);
        });
    
        consoleSpy.mockRestore();
    });

    it('renders gracefully when no orders found', async () => {
        axios.get.mockResolvedValue({ data: [] });

        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('mock-select')).not.toBeInTheDocument();
        });
    });
})
