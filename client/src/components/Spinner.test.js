import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from './Spinner';
import "@testing-library/jest-dom";

// Mock useNavigate and useLocation
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    useLocation: jest.fn()
}));

jest.useFakeTimers();

describe('Spinner Component', () => {
  it('renders the spinner and countdown correctly', () => {
    render(
      <MemoryRouter initialEntries={['/some-path']}>
        <Routes>
          <Route path="*" element={<Spinner />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('redirecting you in 3 second(s)')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to the specified path after the countdown', async () => {
    const mockUseNavigate = jest.fn();
    useNavigate.mockReturnValue(mockUseNavigate);
    useLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: undefined,
    });
  
    const { history } = render(
      <MemoryRouter initialEntries={['/some-path']} initialIndex={0}>
        <Routes>
          <Route path="*" element={<Spinner />} />
        </Routes>
      </MemoryRouter>
    );

    // Advance Timer
    act(() => {
        jest.advanceTimersByTime(3000);
    });

    waitFor(() => {
        expect(mockUseNavigate).toHaveBeenCalledWith("/login", { state: "/"});
        expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    })
  });

  it('allows customization of the redirect path', async () => {
    const mockUseNavigate = jest.fn();
    useNavigate.mockReturnValue(mockUseNavigate);
    useLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: undefined,
    });

    const { history } = render(
      <MemoryRouter initialEntries={['/some-path']} initialIndex={0}>
        <Routes>
          <Route path="*" element={<Spinner path="custom-path" />} />
        </Routes>
      </MemoryRouter>
    );

    // Advance Timer
    act(() => {
        jest.advanceTimersByTime(3000);
    });

    waitFor(() => {
        expect(mockUseNavigate).toHaveBeenCalledWith("/custom-path", { state: "/"});
        expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    })
  });
});