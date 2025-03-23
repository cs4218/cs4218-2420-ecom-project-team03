import React from 'react';
import request from "supertest";
import axios from 'axios';
import { getByLabelText, screen } from '@testing-library/dom';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from '../client/src/pages/HomePage';
import { Prices } from '../client/src/components/Prices';
import ProductDetails from '../client/src/pages/ProductDetails';
import slugify from "slugify";
import categoryModel from '../models/categoryModel';

// jest.useFakeTimers();

const mockedUsedNavigate = jest.fn();
const mockedSetCart = jest.fn();

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

jest.mock("../../../models/categoryModel.js");

describe("HomePage Integration Test", () => {
    beforeAll(() => {
        categoryModel.find.mockImplementation(() => ({
            category: [
              { _id: "1", name: "Clothing", slug: "clothing" },
              { _id: "2", name: "Electronics", slug: "electronics" },
              { _id: "3", name: "Book", slug: "book" },
            ],
        }));

        productModel.find.mockImplementation(() => ({
            products: [
              {
                _id: "1",
                name: "Black T-shirt",
                slug: "black-t-shirt",
                description: "This is a black t-shirt",
                price: 100,
                category: "1",
                quantity: 10,
                shipping: true,
              },
              {
                _id: "2",
                name: "Iphone 12",
                slug: "iphone-12",
                description: "This is an iphone 12",
                price: 1000,
                category: "2",
                quantity: 5,
                shipping: true,
              },
            ],
        }));
    });

    it("should fetch and display categories from the backend", async () => {
        const { getByText } = render(
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        );
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
    
        await waitFor(() => {
            expect(getByText("Filter By Category")).toBeInTheDocument();
            expect(getByText("Clothing")).toBeInTheDocument();
        });
        console.log(axios.get.mock.calls)
    });
});