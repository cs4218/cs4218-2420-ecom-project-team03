import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock the Header and Footer components
jest.mock('./Header', () => () => <div data-testid="header">Header</div>);
jest.mock('./Footer', () => () => <div data-testid="footer">Footer</div>);

describe('Layout Component', () => {
  it('renders children correctly', () => {
    const children = <div data-testid="children">Children</div>;
    render(
        <MemoryRouter>
            <Layout>
                {children}
            </Layout>;
        </MemoryRouter>
    )

    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('renders Header and Footer components', () => {
    render(
        <MemoryRouter>
            <Layout />;
        </MemoryRouter>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});