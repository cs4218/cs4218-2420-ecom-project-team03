import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../context/auth';

// Mock the useAuth hook
jest.mock('../..//context/auth', () => ({
  useAuth: jest.fn(() => [{
    user: {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '123-456-7890',
      role: 1, 
    },
    token: 'test-token',
  }, jest.fn()]),
}));

// Mock the useCart hook
jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

// Mock the useSearch hook
jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

// Mock the useCategory hook
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));


describe('AdminDashboard Integration', () => {
  it('renders AdminDashboard and AdminMenu correctly', () => {
    // Render the AdminDashboard component
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if AdminMenu elements are rendered
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Category' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Product' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();

    // Check if AdminDashboard elements are rendered
    expect(screen.getByText('Admin Name : Admin User')).toBeInTheDocument();
    expect(screen.getByText('Admin Email : admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin Contact : 123-456-7890')).toBeInTheDocument();
  });

  it('renders AdminDashboard correctly for an admin user', () => {
    useAuth.mockReturnValue([{
      user: {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '123-456-7890',
        role: 1,
      },
      token: 'test-token',
    }, jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Category' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Product' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
  
    expect(screen.getByText('Admin Name : Admin User')).toBeInTheDocument();
    expect(screen.getByText('Admin Email : admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin Contact : 123-456-7890')).toBeInTheDocument();
  });

  it('redirects or shows an error for a non-admin user', () => {
    useAuth.mockReturnValue([{
      user: {
        name: 'Non-admin User',
        email: 'user@example.com',
        phone: '123-456-7890',
        role: 0,
      },
      token: 'test-token',
    }, jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to login page for an unauthenticated user', () => {
    useAuth.mockReturnValue([null, jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('handles incomplete user details gracefully', () => {
    useAuth.mockReturnValue([{
      user: {
        name: 'Admin User',
        email: '', // Missing email
        phone: '123-456-7890',
        role: 1,
      },
      token: 'test-token',
    }, jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Category' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Product' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
  
    expect(screen.getByText('Admin Name : Admin User')).toBeInTheDocument();
    expect(screen.queryByText('Admin Email : admin@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Contact : 123-456-7890')).toBeInTheDocument();
  });
});
