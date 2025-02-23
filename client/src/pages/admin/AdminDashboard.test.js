// AdminDashboard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
// import { useAuth } from '../../context/auth';
import '@testing-library/jest-dom';

// Mock useAuth hook
const mockAuth = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '123-456-7890',
  },
};

const mockUseAuth = jest.fn(() => [mockAuth]);

// Mock the useAuth hook to return null state and a mock function
jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [mockAuth]),
}));

// Mock useCart hook to return null state and a mock function
jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()])
}));
    
// Mock useSearch hook to return null state and a mock function
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));  

// Mock useCategory hook to return null state and a mock function
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe('AdminDashboard', () => {
  it('renders the AdminMenu component', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  it('renders the admin details correctly', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Name : Admin User/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email : admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact : 123-456-7890/i)).toBeInTheDocument();
  });

  it('renders the admin details with default values if auth.user is undefined', () => {
    // Mock auth with undefined user
    const mockAuthUndefined = { user: undefined };
    mockUseAuth.mockReturnValue([mockAuthUndefined]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Name : /i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email : /i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact : /i)).toBeInTheDocument();
  });
});