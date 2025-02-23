import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';
import "@testing-library/jest-dom";

// Mock the Layout component
jest.mock('../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout">
    <h1 data-testid="title">{title}</h1>
    {children}
  </div>
));

describe('About Component', () => {
  it('renders the Layout component with the correct title', () => {
    render(<About />);
    const layout = screen.getByTestId('layout');
    const title = screen.getByTestId('title');

    expect(layout).toBeInTheDocument();
    expect(title).toHaveTextContent('About us - Ecommerce app');
  });

  it('renders the image and text correctly', () => {
    render(<About />);
    const image = screen.getByAltText('contactus');
    const text = screen.getByText(/Add text/i);

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/about.jpeg');
    expect(image).toHaveAttribute('style', 'width: 100%;');
    expect(text).toBeInTheDocument();
  });
});