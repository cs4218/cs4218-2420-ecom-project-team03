// AdminMenu.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMenu from './AdminMenu';
import '@testing-library/jest-dom';

describe('AdminMenu', () => {
  it('renders the Admin Panel title', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  it('renders the Create Category link', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const createCategoryLink = screen.getByRole('link', { name: /Create Category/i });
    expect(createCategoryLink).toHaveAttribute('href', '/dashboard/admin/create-category');
  });

  it('renders the Create Product link', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const createProductLink = screen.getByRole('link', { name: /Create Product/i });
    expect(createProductLink).toHaveAttribute('href', '/dashboard/admin/create-product');
  });

  it('renders the Products link', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const productsLink = screen.getByRole('link', { name: /Products/i });
    expect(productsLink).toHaveAttribute('href', '/dashboard/admin/products');
  });

  it('renders the Orders link', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const ordersLink = screen.getByRole('link', { name: /Orders/i });
    expect(ordersLink).toHaveAttribute('href', '/dashboard/admin/orders');
  });

  it('does not render the Users link', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /Users/i })).toBeNull();
  });
});