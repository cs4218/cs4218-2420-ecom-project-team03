// SearchProvider.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSearch, SearchProvider } from './search';
import '@testing-library/jest-dom';

// Test the SearchProvider and useSearch hook
describe('SearchProvider and useSearch', () => {
  beforeEach(() => {
    // Clear localStorage and all mocks before each test
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    // Render a component that uses the useSearch hook
    const TestComponent = () => {
      const [searchState] = useSearch();
      return (
        <div>
          <p>Keyword: {searchState.keyword}</p>
          <p>Results: {searchState.results.length}</p>
        </div>
      );
    };

    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    // Check initial state
    expect(screen.getByText(/Keyword:/)).toHaveTextContent('Keyword:');
    expect(screen.getByText(/Results:/)).toHaveTextContent('Results: 0');
  });

  it('updates the search state correctly', () => {
    // Render a component that uses the useSearch hook
    const TestComponent = () => {
      const [searchState, setSearchState] = useSearch();
      return (
        <div>
          <p>Keyword: {searchState.keyword}</p>
          <p>Results: {searchState.results.length}</p>
          <button onClick={() => setSearchState({ keyword: 'test', results: ['item1', 'item2'] })}>
            Update Search
          </button>
        </div>
      );
    };

    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    // Check initial state
    expect(screen.getByText(/Keyword:/)).toHaveTextContent('Keyword:');
    expect(screen.getByText(/Results: /)).toHaveTextContent('Results: 0');

    // Update the search state
    fireEvent.click(screen.getByText(/Update Search/i));

    // Check updated state
    expect(screen.getByText(/Keyword: /)).toHaveTextContent('Keyword: test');
    expect(screen.getByText(/Results: /)).toHaveTextContent('Results: 2');
  });
});