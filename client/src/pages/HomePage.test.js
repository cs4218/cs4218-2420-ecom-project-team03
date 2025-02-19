import React from 'react';
import { getByLabelText, screen } from '@testing-library/dom'
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage';
import { Prices } from '../components/Prices';
import ProductDetails from './ProductDetails';
import { el } from 'date-fns/locale';
import exp from 'constants';

const NUS_TSHIRT = {
    _id: 'nus t-shirt',
    name: "NUS T-shirt",
    slug: "nus-tshirt",
    description: "Plain NUS T-shirt for sale",
    price: 0.00,
    category: {
      _id: "clothing",
      name: "Clothing",
      slug: "clothing"
    },
    quantity: 200,
    shipping: true,
}

const TEXTBOOK = {
    _id: 'textbook',
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 20.00,
    category: {
      _id: "book",
      name: "Book",
      slug: "book"
    },
    quantity: 50,
    shipping: false,
}

const NOVEL = {
    _id: 'novel',
    name: "Novel",
    slug: "novel",
    description: "A best-selling novel",
    price: 40.00,
    category: {
      _id: "book",
      name: "Book",
      slug: "book"
    },
    quantity: 200,
    shipping: true,
}

const CONTRACT = {
    _id: 'contract',
    name: "The Law of Contract in Singapore",
    slug: "the-law-of-contract-in-singapore",
    description: "A best selling book in Singapore",
    price: 60.00,
    category: {
        _id: "book",
        name: "Book",
        slug: "book"
    },
    quantity: 200,
    shipping: true,
}

const SMARTPHONE = {
    _id: 'smartphone',
    name: "Smartphone",
    slug: "smartphone",
    description: "A high-end smartphone",
    price: 80.00,
    category: {
      _id: "electronics",
      name: "Electronics",
      slug: "electronics"
    },
    quantity: 50,
    shipping: false,
}

const LAPTOP = {
    _id: 'laptop',
    name: "Laptop",
    slug: "laptop",
    description: "A powerful laptop",
    price: 100.00,
    category: {
      _id: "electronics",
      name: "Electronics",
      slug: "electronics"
    },
    quantity: 30,
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
    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: jest.fn() },
          });
    });

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
        expect(cardWithin.getByText('$40.00')).toBeInTheDocument();
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

    it('should filter products by category and price', async () => {        
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
                  total: 18,
                },
              });
            } else if (url === `/api/v1/product/product-list/1`) {
              return Promise.resolve({
                data: {
                  success: true,
                  products: [LAPTOP, SMARTPHONE, NOVEL, NUS_TSHIRT, TEXTBOOK, CONTRACT],
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
        const electronicsCategory = await screen.findByText('Electronics');
        const clothingCategory = await screen.findByText('Clothing');
        const bookCategory = await screen.findByText('Book');
        const priceZeroToNinteen = screen.getByLabelText('$0 to 19.99');
        const priceTwentyToThirtyNine = screen.getByLabelText('$20 to 39.99');
        const priceFortyToFiftyNine = screen.getByLabelText('$40 to 59.99');
        const priceSixtyToSeventyNine = screen.getByLabelText('$60 to 79.99');
        const priceEightyToNintyNine = screen.getByLabelText('$80 to 99.99');
        const priceHundredOrMore = screen.getByLabelText('$100 or more');
        const resetFilter = await screen.findByText('RESET FILTERS');
        expect(electronicsCategory).toBeInTheDocument();
        expect(clothingCategory).toBeInTheDocument();
        expect(bookCategory).toBeInTheDocument();
        expect(priceZeroToNinteen).toBeInTheDocument();
        expect(priceTwentyToThirtyNine).toBeInTheDocument();
        expect(priceFortyToFiftyNine).toBeInTheDocument();
        expect(priceSixtyToSeventyNine).toBeInTheDocument();
        expect(priceEightyToNintyNine).toBeInTheDocument();
        expect(priceHundredOrMore).toBeInTheDocument();
        expect(resetFilter).toBeInTheDocument();

        // Filter by category
        fireEvent.click(electronicsCategory);
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
        expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
            checked: ['electronics'],
            radio: [],
        });

        fireEvent.click(clothingCategory);
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
        expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
            checked: ['electronics', 'clothing'],
            radio: [],
        });

        fireEvent.click(bookCategory);
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(3));
        expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
            checked: ['electronics', 'clothing', 'book'],
            radio: [],
        });

        fireEvent.click(clothingCategory);
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(4));
        expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
            checked: ['electronics', 'book'],
            radio: [],
        });

        fireEvent.click(resetFilter);
        await waitFor(() => expect(window.location.reload).toHaveBeenCalledTimes(1));

        // Filter by price
        // fireEvent.change(priceZeroToNinteen, { target: { value: priceZeroToNinteen.value } });
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: priceZeroToNinteen.value,
        // });

        // fireEvent.click(priceTwentyToThirtyNine);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(6));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceTwentyToThirtyNine.value),
        // });

        // fireEvent.click(priceFortyToFiftyNine);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(7));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceFortyToFiftyNine.value),
        // });

        // fireEvent.click(priceSixtyToSeventyNine);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(8));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceSixtyToSeventyNine.value),
        // });

        // fireEvent.click(priceEightyToNintyNine);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(9));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceEightyToNintyNine.value),
        // });

        // fireEvent.click(priceHundredOrMore);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(10));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceHundredOrMore.value),
        // });

        // // Filter by category and price
        // fireEvent.click(electronicsCategory);
        // fireEvent.click(priceZeroToNinteen);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(12));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: ['electronics'],
        //     radio: JSON.parse(priceZeroToNinteen.value),
        // });

        // fireEvent.click(eletronicsCategory);
        // fireEvent.click(priceTwentyToThirtyNine);
        // await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(14));
        // expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
        //     checked: [],
        //     radio: JSON.parse(priceTwentyToThirtyNine.value),
        // });
    });

    it('should load more products when available', async () => {
        // Creating list of products for the price ranges (three each for min, max and some value in the middle)
        const product_list = [LAPTOP, SMARTPHONE, NOVEL, NUS_TSHIRT, CONTRACT, TEXTBOOK];
        const altered_products_list = product_list.flatMap(
            (product) => [product, 
                { ...product, _id: `${product._id}-middle`, price: product.price + 10 },
                { ...product, _id: `${product._id}-high`, price: product.price + 19.99 },
            ]);
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
                    total: 18,
                },
                });
            } else if (url === `/api/v1/product/product-list/1`) {
                return Promise.resolve({
                data: {
                    success: true,
                    products: altered_products_list.slice(0, 6),
                },
                });
            } else if (url === `/api/v1/product/product-list/2`) {
                return Promise.resolve({
                data: {
                    success: true,
                    products: altered_products_list.slice(6, 12),
                },
                });
            } else if (url === `/api/v1/product/product-list/3`) {
                return Promise.resolve({
                data: {
                    success: true,
                    products: altered_products_list.slice(12, 18),
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
        expect(await screen.findByText('Load More')).toBeInTheDocument();
        expect(screen.queryByText('Novel')).not.toBeInTheDocument();
        expect(screen.queryByText('Textbook')).not.toBeInTheDocument();

        const loadMoreButton = await screen.findByText('Load More');
        fireEvent.click(loadMoreButton);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(4));
        expect(await screen.findAllByText('Novel')).toHaveLength(3);
        expect(await screen.queryByText('Textbook')).not.toBeInTheDocument();

        fireEvent.click(loadMoreButton);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(5));
        expect(await screen.findAllByText('Textbook')).toHaveLength(3);

        // Filter mode should not have find more button
        const bookCategory = await screen.findByText('Book');
        fireEvent.click(bookCategory);
        expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
});