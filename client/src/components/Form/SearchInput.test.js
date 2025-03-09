// SearchInput.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider, useSearch } from '../../context/search';
import SearchInput from './SearchInput';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useSearch hook
const mockSetValues = jest.fn();
const mockUseSearch = jest.fn(() => [{ keyword: '', results: [] }, mockSetValues]);
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '', results: [] }, mockSetValues])
}));   

describe('SearchInput', () => {
  let consoleLogSpy;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input correctly', () => {
    // Mock the useSearch hook to return initial values
    mockUseSearch.mockReturnValue([{ keyword: '', results: [] }, jest.fn()]);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<SearchInput />} />
          </Routes>
        </MemoryRouter>
    );

    // Check if the search form, input and button are rendered
    const searchForm = screen.getByRole('search');
    const searchInput = screen.getByPlaceholderText('Search');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    expect(searchForm).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  it('updates the keyword state on input change', async () => {
    // Mock the useSearch hook to return initial values
    useSearch.mockReturnValue([{ keyword: '', results: [] }, mockSetValues]);

    render(
        <MemoryRouter initialEntries={['/search']}>
            <Routes>
                <Route path="/search" element={<SearchInput />} />
            </Routes>
        </MemoryRouter>
    );

    // Get the search input and change its value
    const searchInput = screen.getByPlaceholderText('Search');
    await waitFor(() => fireEvent.change(searchInput, { target: { value: 'test' } }));

    // Check if the setValues function was called with the correct value
    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalledTimes(1);
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: 'test', results: [] });
    });
  });

  it('handles form submission correctly', async () => {
    // Mock the useSearch hook to return initial values
    useSearch.mockReturnValue([{ keyword: 'test', results: ['result1', 'result2'] }, mockSetValues]);

    // Mock the axios.get method to return a mock response
    axios.get.mockResolvedValue({ data: ['result1', 'result2'] });

    render(
        <MemoryRouter initialEntries={['/search']}>
            <Routes>
            <Route path="/search" element={<SearchInput />} />
            </Routes>
        </MemoryRouter>
    );

    // Get the search input and change its value
    const searchInput = screen.getByPlaceholderText('Search');
    await waitFor(() => fireEvent.change(searchInput, { target: { value: 'test' } }));

    // Submit the form
    const searchForm = screen.getByRole('search');
    fireEvent.submit(searchForm);

    // Check if the axios.get method was called with the correct URL
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/test');
    });

    // Check if the setValues function was called with the correct results
    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: 'test', results: ['result1', 'result2'] });
    });

    // Check if the navigate function was called with the correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  it('handles form submission errors correctly', async () => {
    // Mock the useSearch hook to return initial values
    useSearch.mockReturnValue([{ keyword: 'test', results: ['result1', 'result2'] }, mockSetValues]);

    // Mock the axios.get method to throw an error
    const mockError = new Error('Network Error');
    axios.get.mockRejectedValue(mockError);

    render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<SearchInput />} />
          </Routes>
        </MemoryRouter>
    );

    // Get the search input and change its value
    const searchInput = screen.getByPlaceholderText('Search');
    await waitFor(() => fireEvent.change(searchInput, { target: { value: 'test' } }));

    // Submit the form
    const searchForm = screen.getByRole('search');
    fireEvent.submit(searchForm);

    // Check if the axios.get method was called with the correct URL
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/test');
    });

    // Check if the error was logged to the console
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    // Check if the navigate function was not called
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});