import React from 'react';
import { screen } from '@testing-library/dom'
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage';
import { Prices } from '../components/Prices';
import ProductDetails from './ProductDetails';

const LAPTOP = {
    _id: 'laptop',
    name: "Laptop",
    slug: "laptop",
    description: "A powerful laptop",
    price: 1499.99,
    category: {
      _id: "electronics",
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
    _id: 'smartphone',
    name: "Smartphone",
    slug: "smartphone",
    description: "A high-end smartphone",
    price: 999.99,
    category: {
      _id: "electronics",
      name: "Electronics",
      slug: "electronics"
    },
    quantity: 50,
    // photo: {
    //   data: Buffer,
    // },
    shipping: false,
}

const NOVEL = {
    _id: 'novel',
    name: "Novel",
    slug: "novel",
    description: "A best-selling novel",
    price: 14.99,
    category: {
      _id: "book",
      name: "Book",
      slug: "book"
    },
    quantity: 200,
    // photo: {
    //   data: Buffer,
    // },
    shipping: true,
}

const NUS_TSHIRT = {
    _id: 'nus t-shirt',
    name: "NUS T-shirt",
    slug: "nus-tshirt",
    description: "Plain NUS T-shirt for sale",
    price: 4.99,
    category: {
      _id: "clothing",
      name: "Clothing",
      slug: "clothing"
    },
    quantity: 200,
    // photo: {
    //   data: Buffer,
    // },
    shipping: true,
}

const mockedUsedNavigate = jest.fn();
const mockedSetCart = jest.fn();

// Deal with clicking on toast
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
});

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], mockedSetCart])
}));
  
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
})); 

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe('Home Page Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('should render all components in the home page', async () => {
        const { getByAltText, getByText } = render(
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          );
          const bannerImage = getByAltText('bannerimage');

          expect(getByText('All Products')).toBeInTheDocument();
          expect(getByText('Filter By Category')).toBeInTheDocument();
          expect(getByText('Filter By Price')).toBeInTheDocument();
          Prices.forEach((p) => {
            expect(getByText(p.name)).toBeInTheDocument();
          });
          expect(getByText('RESET FILTERS')).toBeInTheDocument();
          expect(bannerImage).toBeInTheDocument();
          expect(bannerImage).toHaveAttribute('src', '/images/Virtual.png');
    });

    it('should render category names', async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
              return Promise.resolve({
                data: {
                  success: true,
                  message: "All Category List",
                  category: [LAPTOP.category, NOVEL.category, NUS_TSHIRT.category],
                },
              });
            } else if (url === "/api/v1/product/product-count") {
              return Promise.resolve({
                data: {
                  success: true,
                  total: 1,
                },
              });
            } else if (url === `/api/v1/product/product-list/1`) {
              return Promise.resolve({
                data: {
                  success: true,
                  products: [LAPTOP],
                },
              });
            }
            return Promise.reject(new Error("not found"));
        });

        const { getByText } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
        expect(await screen.findByText('Electronics')).toBeInTheDocument();
        expect(await screen.findByText('Book')).toBeInTheDocument();
        expect(await screen.findByText('Clothing')).toBeInTheDocument();
    });

    it('should render products', async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
              return Promise.resolve({
                data: {
                  success: true,
                  message: "All Category List",
                  category: [LAPTOP.category, NOVEL.category, NUS_TSHIRT.category],
                },
              });
            } else if (url === "/api/v1/product/product-count") {
              return Promise.resolve({
                data: {
                  success: true,
                  total: 4,
                },
              });
            } else if (url === `/api/v1/product/product-list/1`) {
              return Promise.resolve({
                data: {
                  success: true,
                  products: [LAPTOP, SMARTPHONE, NOVEL, NUS_TSHIRT],
                },
              });
            }
            return Promise.reject(new Error("not found"));
        });

        const {  } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
        expect(await screen.findByText('Laptop')).toBeInTheDocument();
        expect(await screen.findByText('Smartphone')).toBeInTheDocument();
        expect(await screen.findByText('Novel')).toBeInTheDocument();
        expect(await screen.findByText('NUS T-shirt')).toBeInTheDocument();
        
        // Check for the card rendering (for novel)
        const novelCard = await screen.findByText('Novel');
        expect(novelCard).toBeInTheDocument();
        const cardElement = novelCard.closest('.card');
        expect(cardElement).toBeInTheDocument();
        const cardWithin = within(cardElement);
        expect(cardWithin.getByAltText('Novel')).toHaveAttribute('src', '/api/v1/product/product-photo/novel');
        expect(cardWithin.getByText('$14.99')).toBeInTheDocument();
        expect(cardWithin.getByText('A best-selling novel...')).toBeInTheDocument();
        expect(cardWithin.getByText('More Details')).toBeInTheDocument();
        expect(cardWithin.getByText('ADD TO CART')).toBeInTheDocument();
    });

    it('should naivgate to product details page', async () => {
        const navigate = useNavigate();

        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
              return Promise.resolve({
                data: {
                  success: true,
                  message: "All Category List",
                  category: [LAPTOP.category, NOVEL.category, NUS_TSHIRT.category],
                },
              });
            } else if (url === "/api/v1/product/product-count") {
              return Promise.resolve({
                data: {
                  success: true,
                  total: 1,
                },
              });
            } else if (url === `/api/v1/product/product-list/1`) {
              return Promise.resolve({
                data: {
                  success: true,
                  products: [NOVEL],
                },
              });
            }
            return Promise.reject(new Error("not found"));
        });

        const {  } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
        const novelCard = await screen.findByText('Novel');
        expect(novelCard).toBeInTheDocument();
        const cardElement = novelCard.closest('.card');
        expect(cardElement).toBeInTheDocument();
        const cardWithin = within(cardElement);
        expect(cardWithin.getByText('More Details')).toBeInTheDocument();
        fireEvent.click(cardWithin.getByText('More Details'));
        
        expect(navigate).toHaveBeenCalledWith('/product/novel');
    });

    it('should add item to cart and show success toast', async () => {
        jest.spyOn(Storage.prototype, 'setItem');

        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
              return Promise.resolve({
                data: {
                  success: true,
                  message: "All Category List",
                  category: [LAPTOP.category, NOVEL.category, NUS_TSHIRT.category],
                },
              });
            } else if (url === "/api/v1/product/product-count") {
              return Promise.resolve({
                data: {
                  success: true,
                  total: 1,
                },
              });
            } else if (url === `/api/v1/product/product-list/1`) {
              return Promise.resolve({
                data: {
                  success: true,
                  products: [NOVEL],
                },
              });
            }
            return Promise.reject(new Error("not found"));
        });
    
        const { getByText } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        );
    
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
        const novelCard = await screen.findByText('Novel');
        expect(novelCard).toBeInTheDocument();
        const cardElement = novelCard.closest('.card');
        expect(cardElement).toBeInTheDocument();
        const cardWithin = within(cardElement);
        expect(cardWithin.getByText('ADD TO CART')).toBeInTheDocument();
        fireEvent.click(cardWithin.getByText('ADD TO CART'));
    
        expect(mockedSetCart).toHaveBeenCalledWith(expect.arrayContaining([NOVEL]));
        expect(localStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify([NOVEL]));
        expect(await screen.findByText('Item Added to cart')).toBeInTheDocument();
    });
});