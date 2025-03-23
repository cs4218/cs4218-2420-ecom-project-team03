import React from 'react';
import { getByLabelText, screen } from '@testing-library/dom'
import { render, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage';
import { Prices } from '../components/Prices';
import ProductDetails from './ProductDetails';
import { afterEach } from 'node:test';

const mockedUsedNavigate = jest.fn();
const mockedSetCart = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

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

axios.defaults.baseURL = "http://localhost:6060";


describe('HomePage Integration Tests', () => {
    beforeEach(() => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
        </MemoryRouter>
        );
    });

    afterEach(() => {
        cleanup();
    });

    it('should load categories and products', async () => {
        await waitFor(() => {
          expect(screen.getByText('Clothing')).toBeInTheDocument();
          expect(screen.getByText('Book')).toBeInTheDocument();
          expect(screen.getByText('Electronics')).toBeInTheDocument();
          expect(screen.getByText('The Law of Contract in Singapore')).toBeInTheDocument();
          expect(screen.getByText('Novel')).toBeInTheDocument();
          expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
          expect(screen.getByText('Smartphone')).toBeInTheDocument();
          expect(screen.getByText('Laptop')).toBeInTheDocument();
          expect(screen.getByText('Textbook')).toBeInTheDocument();
        });
    });

    it('Should filter No categories + 0-19.99', async () => {
        const priceZeroToNinteen = screen.getByLabelText('$0 to 19.99');
        expect(priceZeroToNinteen).toBeInTheDocument();
        fireEvent.click(priceZeroToNinteen);
        await waitFor(() => {
            expect(screen.getByText('Novel')).toBeInTheDocument();
            expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
            expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
            expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
            expect(screen.queryByText('Textbook')).not.toBeInTheDocument();
            expect(screen.queryByText('The Law of Contract in Singapore')).not.toBeInTheDocument();
        });
    });

    it('Should filter Clothing + 20-39.99', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const priceTwentyToThirtyNine = screen.getByLabelText('$20 to 39.99');
        expect(clothingCategory).toBeInTheDocument();
        expect(priceTwentyToThirtyNine).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(priceTwentyToThirtyNine);
        await waitFor(() => {
          expect(screen.queryByText('Novel')).not.toBeInTheDocument();
          expect(screen.queryByText('NUS T-shirt')).not.toBeInTheDocument();
          expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
          expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
          expect(screen.queryByText('Textbook')).not.toBeInTheDocument();
          expect(screen.queryByText('The Law of Contract in Singapore')).not.toBeInTheDocument();
        });
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
        await waitFor(() => {
          expect(screen.queryByText('Novel')).not.toBeInTheDocument();
          expect(screen.queryByText('NUS T-shirt')).not.toBeInTheDocument();
          expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
          expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
          expect(screen.queryByText('Textbook')).not.toBeInTheDocument();
          expect(screen.getByText('The Law of Contract in Singapore')).toBeInTheDocument();
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
        await waitFor(() => {
          expect(screen.queryByText('Novel')).not.toBeInTheDocument();
          expect(screen.queryByText('NUS T-shirt')).not.toBeInTheDocument();
          expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
          expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
          expect(screen.getByText('Textbook')).toBeInTheDocument();
          expect(screen.queryByText('The Law of Contract in Singapore')).not.toBeInTheDocument();
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
        await waitFor(() => {
          expect(screen.queryByText('Novel')).not.toBeInTheDocument();
          expect(screen.queryByText('NUS T-shirt')).not.toBeInTheDocument();
          expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
          expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
          expect(screen.queryByText('Textbook')).not.toBeInTheDocument();
          expect(screen.queryByText('The Law of Contract in Singapore')).not.toBeInTheDocument();
        });
    });

    it('Should filter Clothing, Book + none', async () => {
        const clothingCategory = await screen.findByText('Clothing');
        const bookCategory = await screen.findByText('Book');
        expect(clothingCategory).toBeInTheDocument();
        expect(bookCategory).toBeInTheDocument();
        fireEvent.click(clothingCategory);
        fireEvent.click(bookCategory);
        await waitFor(() => {
          expect(screen.getByText('Novel')).toBeInTheDocument();
          expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
          expect(screen.queryByText('Smartphone')).not.toBeInTheDocument();
          expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
          expect(screen.getByText('Textbook')).toBeInTheDocument();
          expect(screen.getByText('The Law of Contract in Singapore')).toBeInTheDocument();
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
        await waitFor(() => {
          expect(screen.queryByText('Novel')).not.toBeInTheDocument();
          expect(screen.queryByText('NUS T-shirt')).not.toBeInTheDocument();
          expect(screen.getByText('Smartphone')).toBeInTheDocument();
          expect(screen.getByText('Laptop')).toBeInTheDocument();
          expect(screen.queryByText('Textbook')).not.toBeInTheDocument();
          expect(screen.queryByText('The Law of Contract in Singapore')).not.toBeInTheDocument();
        });
    });

});