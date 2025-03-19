import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/auth';
import { useCart } from '../context/cart';
import { useSearch } from '../context/search';
import useCategory from "../hooks/useCategory";
import toast from 'react-hot-toast';

// Mock the hooks
jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()]),
}));

jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
})); 

jest.mock('../hooks/useCategory', () => jest.fn(() => []));

// Mock the toast function
jest.mock('react-hot-toast');

describe('Layout Integration', () => {
  it('renders Header and Footer correctly', () => {
    // Mock the hooks to return specific values if needed
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 1 },
      token: 'test-token',
    }, jest.fn()]);

    useCart.mockReturnValue([[], jest.fn()]);

    useCategory.mockReturnValue([
      { _id: '1', name: 'Category 1', slug: 'category-1' },
      { _id: '2', name: 'Category 2', slug: 'category-2' },
    ]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    // Check if Header elements are rendered
    expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();

    // Check if Footer elements are rendered
    expect(screen.getByText('All Rights Reserved © TestingComp')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
  });

  it('renders Header with empty cart', () => {
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 1 },
      token: 'test-token',
    }, jest.fn()]);
  
    useCart.mockReturnValue([[], jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  
    expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Cart badge should show 0
  });

  it('renders Header with non-empty cart', () => {
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 1 },
      token: 'test-token',
    }, jest.fn()]);
  
    useCart.mockReturnValue([[
      { _id: '1', name: 'Test Product', description: 'This is a test product', price: 10.99 },
    ], jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  
    expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Cart badge should show 1
  });

  it('renders Header with user logged in', () => {
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 0 },
      token: 'test-token',
    }, jest.fn()]);
  
    useCart.mockReturnValue([[], jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
  });

  it('renders Header with user not logged in', () => {
    useAuth.mockReturnValue([null, jest.fn()]);
  
    useCart.mockReturnValue([[], jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('renders Header with different user roles', () => {
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 1 },
      token: 'test-token',
    }, jest.fn()]);
  
    useCart.mockReturnValue([[], jest.fn()]);
  
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('logs out user correctly', () => {
    const setAuthMock = jest.fn();
    useAuth.mockReturnValue([{
      user: { name: 'Test User', role: 1 },
      token: 'test-token',
    }, setAuthMock]);

    useCart.mockReturnValue([[], jest.fn()]);

    useCategory.mockReturnValue([
      { _id: '1', name: 'Category 1', slug: 'category-1' },
      { _id: '2', name: 'Category 2', slug: 'category-2' },
    ]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    // Find the logout button and click it
    const logoutButton = screen.getByRole('link', { name: 'Logout' });
    fireEvent.click(logoutButton);

    // Check if the user is logged out
    expect(setAuthMock).toHaveBeenCalledWith({
      user: null,
      token: '',
    });

    // Check if the success message is displayed
    expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
  });
});