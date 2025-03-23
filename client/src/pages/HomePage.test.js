import React from 'react';
import { getByLabelText, screen } from '@testing-library/dom'
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage';
import { Prices } from '../components/Prices';
import ProductDetails from './ProductDetails';

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
        expect(cardWithin.getByAltText('Novel')).toHaveAttribute('src', expect.stringContaining('/api/v1/product/product-photo/novel'));
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

    it('should not show loading when there is an error', async () => {
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
                return Promise.reject(new Error("Error getting products"));
            };
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

        const loadMoreButton = await screen.findByText('Load More');
        fireEvent.click(loadMoreButton);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(4));
        expect(await screen.findByText('Loading ...')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading ...')).not.toBeInTheDocument());
        expect(await screen.findByText('Load More')).toBeInTheDocument();
      });
});

describe('Combination Filter test', () => {
    function priceStringToArr(price) {
      return price.split(',').map((p) => parseFloat(p));
    }

    beforeEach(() => {
        jest.clearAllMocks();
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
                total: 6,
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
    });

    it('Should filter No categories + 0-19.99', async () => {
        const priceZeroToNinteen = screen.getByLabelText('$0 to 19.99');
        expect(priceZeroToNinteen).toBeInTheDocument();
        fireEvent.click(priceZeroToNinteen);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining([]),
            radio: priceStringToArr(priceZeroToNinteen.value),
        });
    });

    it('Should filter Clothing + 20-39.99', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const priceTwentyToThirtyNine = screen.getByLabelText('$20 to 39.99');
        expect(clothingCategory).toBeInTheDocument();
        expect(priceTwentyToThirtyNine).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(priceTwentyToThirtyNine);
        await waitFor(() => expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['clothing']),
            radio: priceStringToArr(priceTwentyToThirtyNine.value),
        }));
    });

    it('Should filter Clothing, Book + 40-59.99', async () => {
        const bookCategory = await screen.findByText('Book');
        const clothingCategory = await screen.findByText('Clothing');
        const priceFortyToFiftyNine = screen.getByLabelText('$40 to 59.99');
        expect(bookCategory).toBeInTheDocument();
        expect(clothingCategory).toBeInTheDocument();
        expect(priceFortyToFiftyNine).toBeInTheDocument();
        fireEvent.click(bookCategory);
        fireEvent.click(clothingCategory);
        fireEvent.click(priceFortyToFiftyNine);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['clothing', 'book']),
            radio: priceStringToArr(priceFortyToFiftyNine.value),
        });
    });

    it('Should filter Book, Electronics + 60-79.99', async () => {
        const bookCategory = await screen.findByText('Book');
        const electronicsCategory = await screen.findByText('Electronics');
        const priceSixtyToSeventyNine = screen.getByLabelText('$60 to 79.99');
        expect(bookCategory).toBeInTheDocument();
        expect(electronicsCategory).toBeInTheDocument();
        expect(priceSixtyToSeventyNine).toBeInTheDocument();
        fireEvent.click(bookCategory);
        fireEvent.click(electronicsCategory);
        fireEvent.click(priceSixtyToSeventyNine);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['electronics', 'book']),
            radio: priceStringToArr(priceSixtyToSeventyNine.value),
        });
    });

    it('Should filter Clothing, Electronics + 80-99.99', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const electronicsCategory = await screen.findByText('Electronics');
        const priceEightyToNintyNine = screen.getByLabelText('$80 to 99.99');
        expect(clothingCategory).toBeInTheDocument();
        expect(electronicsCategory).toBeInTheDocument();
        expect(priceEightyToNintyNine).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(electronicsCategory);
        fireEvent.click(priceEightyToNintyNine);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['electronics', 'clothing']),
            radio: priceStringToArr(priceEightyToNintyNine.value),
        });
    });

    it('Should filter Clothing, Book + none', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const bookCategory = await screen.findByText('Book');
        expect(clothingCategory).toBeInTheDocument();
        expect(bookCategory).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(bookCategory);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['clothing', 'book']),
            radio: [],
        });
    });

    it('Should filter Clothing, Book, Electronics + 100 or more', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const bookCategory = await screen.findByText('Book');
        const electronicsCategory = await screen.findByText('Electronics');
        const priceHundredOrMore = screen.getByLabelText('$100 or more');
        expect(clothingCategory).toBeInTheDocument();
        expect(bookCategory).toBeInTheDocument();
        expect(electronicsCategory).toBeInTheDocument();
        expect(priceHundredOrMore).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(bookCategory);
        fireEvent.click(electronicsCategory);
        fireEvent.click(priceHundredOrMore);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: expect.arrayContaining(['electronics', 'clothing', 'book']),
            radio: priceStringToArr(priceHundredOrMore.value),
        });
    });

    it('Should filter check and uncheck', async () => {
        const bookCategory = await screen.findByText('Book');
        const electronicsCategory = await screen.findByText('Electronics');
        expect(bookCategory).toBeInTheDocument();
        expect(electronicsCategory).toBeInTheDocument();
        fireEvent.click(bookCategory);
        fireEvent.click(electronicsCategory);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
          checked: ['book', 'electronics'],
          radio: [],
        });
        fireEvent.click(bookCategory);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
          checked: ['electronics'],
          radio: [],
        });
    });

    it('Should check and uncheck radio buttons', async () => {
        const priceZeroToNinteen = screen.getByLabelText('$0 to 19.99');
        const bookCategory = await screen.findByText('Book');
        expect(priceZeroToNinteen).toBeInTheDocument();
        expect(bookCategory).toBeInTheDocument();
        fireEvent.click(priceZeroToNinteen);
        fireEvent.click(bookCategory);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: ['book'],
            radio: priceStringToArr(priceZeroToNinteen.value),
        });
        fireEvent.click(priceZeroToNinteen);
        expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
            checked: ['book'],
            radio: [],
        });
    });

    it('Should refresh page when reset button is clicked', async () => {
        const reloadSpy = jest.fn();
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: { reload: reloadSpy },
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
        const resetButton = screen.getByText('RESET FILTERS');
        expect(resetButton).toBeInTheDocument();
        fireEvent.click(resetButton);
        expect(reloadSpy).toHaveBeenCalled();
    });

    it('should trigger getAllProducts when all filters are unchecked', async () => {
        const initialProductListCalls = axios.get.mock.calls.filter(
          (call) => call[0] === '/api/v1/product/product-list/1'
        ).length;

        const clothingCategory = await screen.findByText('Clothing');
        fireEvent.click(clothingCategory);
        fireEvent.click(clothingCategory);
        
        await waitFor(() => {
          const newProductListCalls = axios.get.mock.calls.filter(
            (call) => call[0] === '/api/v1/product/product-list/1'
          ).length;
          expect(newProductListCalls).toBe(initialProductListCalls + 1);
        });

        const priceZeroToNinteen = screen.getByLabelText('$0 to 19.99');
        fireEvent.click(priceZeroToNinteen);
        fireEvent.click(priceZeroToNinteen);

        await waitFor(() => {
          const newProductListCalls = axios.get.mock.calls.filter(
            (call) => call[0] === '/api/v1/product/product-list/1'
          ).length;
          expect(newProductListCalls).toBe(initialProductListCalls + 2);
        });

    });

    it('Should display filtered products and no have Load More', async () => {
      axios.post.mockImplementation((url, data) => {
        if (url === '/api/v1/product/product-filters') {
          return Promise.resolve({
            data: {
              success: true,
              products: [NUS_TSHIRT]
            },
          });
        }
        return Promise.reject(new Error('Unexpected axios.post call'));
      });

      const clothingCategory = await screen.findByText('Clothing');
      fireEvent.click(clothingCategory);

      expect(await screen.findByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
});