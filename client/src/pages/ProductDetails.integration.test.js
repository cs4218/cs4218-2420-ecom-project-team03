import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';

axios.defaults.baseURL = "http://localhost:6060";

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()])
}));
  
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
})); 

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe('Product Details Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details', async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();
  });
});