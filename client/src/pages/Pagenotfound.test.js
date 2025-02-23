import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pagenotfound from './Pagenotfound';
import "@testing-library/jest-dom"

// Mock the Layout component
jest.mock('../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout">
    <h1 data-testid="title">{title}</h1>
    {children}
  </div>
));

describe('Pagenotfound Component', () => {
  it('renders the Layout component with the correct title', () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );
    const layout = screen.getByTestId('layout');
    const title = screen.getByTestId('title');

    expect(layout).toBeInTheDocument();
    expect(title).toHaveTextContent('go back- page not found');
  });

  it('renders the 404 title, heading, and Go Back link correctly', () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );
    const title = screen.getByText('404');
    const heading = screen.getByText('Oops ! Page Not Found');
    const link = screen.getByText('Go Back');

    expect(title).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});