import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from "react-hot-toast";
import ProductDetails from './ProductDetails';
import Pagenotfound from './Pagenotfound';

const LAPTOP = {
  _id: '1',
  name: "Laptop",
  slug: "laptop",
  description: "A powerful laptop",
  price: 1499.99,
  category: {
    _id: "1",
    name: "Electronics",
    slug: "electronics"
  }
}

const SMARTPHONE = {
  _id: '2',
  name: "Smartphone",
  slug: "smartphone",
  description: "A high-end smartphone",
  price: 999.99,
  category: {
    _id: "2",
    name: "Electronics",
    slug: "electronics"
  }
}

const TELEVISION = {
  _id: '3',
  name: "Television",
  slug: "television",
  description: "A wide screen television",
  price: 400,
  category: {
    _id: "3",
    name: "Electronics",
    slug: "electronics"
  }
}

jest.mock('axios');
jest.mock("react-hot-toast");

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

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe('Product Details Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    const { getByText } = render(
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

  it('should navigate to 404 is slug has no product associated with it', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: null,
      }
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(getByText("404")).toBeInTheDocument());
  });

  it('should add product to cart', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
        <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("primary-add-to-cart"));
    expect(localStorage.setItem).toHaveBeenCalledWith("cart",JSON.stringify([LAPTOP]));
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it('should generate product image with correct attributes', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    await waitFor(() => {
      const imgElement = screen.getByRole("img");
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute("src", "/api/v1/product/product-photo/1");
      expect(imgElement).toHaveAttribute("alt", "Laptop");
    });
  });

  it('should render no similar products', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ ] } });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(await screen.findByText('No Similar Products found')).toBeInTheDocument();
  });

  it('should render similar product', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ SMARTPHONE ] } });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(await screen.findByText('Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('$999.99')).toBeInTheDocument();
    expect(await screen.findByText('A high-end smartphone...')).toBeInTheDocument();
  });

  it('should render similar products', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ TELEVISION, SMARTPHONE ] } });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(await screen.findByText('Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('$999.99')).toBeInTheDocument();
    expect(await screen.findByText('A high-end smartphone...')).toBeInTheDocument();
    expect(await screen.findByText('Television')).toBeInTheDocument();
    expect(await screen.findByText('$400.00')).toBeInTheDocument();
    expect(await screen.findByText('A wide screen television...')).toBeInTheDocument();
  });

  it('should navigate to product details page of similar product', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ SMARTPHONE ] } })
    
    axios.get.mockResolvedValueOnce({
      data: {
        product: SMARTPHONE,
      }
    }).mockResolvedValueOnce({ data: { products: [ LAPTOP ] } });

    const { getByText } = render(
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

  it('should add similar product to cart', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockResolvedValueOnce({ data: { products: [ SMARTPHONE ] } });
    

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
        <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();

    fireEvent.click(await screen.findByText('Add to Cart'));
    expect(localStorage.setItem).toHaveBeenCalledWith("cart",JSON.stringify([SMARTPHONE]));
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it('should gracefully handle error with getting product details', async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorMsg = "Error getting product details";
    axios.get.mockRejectedValueOnce(errorMsg);

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(errorMsg));
    consoleSpy.mockRestore();

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(getByText('Name :')).toBeInTheDocument();
    expect(getByText('Description :')).toBeInTheDocument();
    expect(getByText('Price :')).toBeInTheDocument();
    expect(getByText('Category :')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();
    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(getByText('No Similar Products found')).toBeInTheDocument();
  });

  it('should gracefully handle error with getting similar products', async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorMsg = "Error getting similar product";
    axios.get.mockResolvedValueOnce({
      data: {
        product: LAPTOP,
      }
    }).mockRejectedValueOnce(errorMsg);

    const { getByText } = render(
      <MemoryRouter initialEntries={['/product/laptop']}>
          <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(errorMsg));
    consoleSpy.mockRestore();

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();
    expect(await screen.findByText('Description : A powerful laptop')).toBeInTheDocument();
    expect(await screen.findByText('Price :$1,499.99')).toBeInTheDocument();
    expect(await screen.findByText('Category : Electronics')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();
    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(getByText('No Similar Products found')).toBeInTheDocument();
  });

  it('should render placeholder text when no slug is present', async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/product']}>
          <Routes>
              <Route path="/product" element={<ProductDetails />} />
          </Routes>
      </MemoryRouter>
    );

    expect(axios.get).toHaveBeenCalledTimes(0);

    expect(getByText('Product Details')).toBeInTheDocument();
    expect(getByText('Name :')).toBeInTheDocument();
    expect(getByText('Description :')).toBeInTheDocument();
    expect(getByText('Price :')).toBeInTheDocument();
    expect(getByText('Category :')).toBeInTheDocument();
    expect(getByText('ADD TO CART')).toBeInTheDocument();
    expect(getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(getByText('No Similar Products found')).toBeInTheDocument();
  });
})