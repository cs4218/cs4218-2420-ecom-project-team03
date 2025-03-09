import React from 'react';
import { screen } from '@testing-library/dom'
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';

const LAPTOP = {
  _id: 'example',
  name: "Laptop",
  slug: "laptop",
  description: "A powerful laptop",
  price: 1499.99,
  category: {
    _id: "example",
    name: "Electronics",
    slug: "electronics"
  },
  quantity: 30,
  // photo: {
  //   data: Buffer,
  // },
  shipping: true,
}

const SMARTPHONE = {
  _id: 'example',
  name: "Smartphone",
  slug: "smartphone",
  description: "A high-end smartphone",
  price: 999.99,
  category: {
    _id: "example",
    name: "Electronics",
    slug: "electronics"
  },
  quantity: 50,
  // photo: {
  //   data: Buffer,
  // },
  shipping: false,
}

jest.mock('axios');

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()])
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
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(getByText('Name :')).toBeInTheDocument();
    expect(getByText('Description :')).toBeInTheDocument();
    expect(getByText('Price :')).toBeInTheDocument();
    expect(getByText('Category :')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();
    expect(await screen.findByText('Description : A powerful laptop')).toBeInTheDocument();
    expect(await screen.findByText('Price :$1,499.99')).toBeInTheDocument();
    expect(await screen.findByText('Category : Electronics')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();
  });

  it('should render no similar products', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    expect(getByText('Similar Products ➡️')).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('No Similar Products found')).toBeInTheDocument();
  });

  it('should render similar products', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ SMARTPHONE ] } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    expect(getByText('Similar Products ➡️')).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('$999.99')).toBeInTheDocument();
    expect(await screen.findByText('A high-end smartphone...')).toBeInTheDocument();
  });

  it('should navigate to product details page of similar product', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: LAPTOP,
      }
    })
    .mockResolvedValueOnce({ data: { products: [ SMARTPHONE ] } })
    .mockResolvedValueOnce({
      data: {
        success: true,
        message: "Single Product Fetched",
        product: SMARTPHONE,
      }
    }).mockResolvedValueOnce({ data: { products: [ LAPTOP ] } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    fireEvent.click(await screen.findByText('More Details'));
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(4));

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(await screen.findByText('Name : Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('Description : A high-end smartphone')).toBeInTheDocument();
    expect(await screen.findByText('Price :$999.99')).toBeInTheDocument();
    expect(await screen.findByText('Category : Electronics')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();
  });
})