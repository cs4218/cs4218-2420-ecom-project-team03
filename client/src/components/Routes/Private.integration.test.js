import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import PrivateRoute from './Private';
import axios from 'axios';
import { DUMMY_USERS } from '../../misc/dummyData';
import { AuthProvider } from '../../context/auth';

axios.defaults.baseURL = 'http://localhost:6060';

const adminUser = DUMMY_USERS[0];
const adminCredentials = {
  email: adminUser.email,
  password: 'password123',
};

const normalUser = DUMMY_USERS[1];
const normalCredentials = {
  email: normalUser.email,
  password: 'hello@test.com',
};

const loginUser = async (credentials) => {
  const res = await axios.post('/api/v1/auth/login', credentials);
  const token = res.data.token;
  console.log(res)

  localStorage.setItem('auth', JSON.stringify(res.data));
  axios.defaults.headers.common['Authorization'] = token;

  return res.data;
};

afterEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

jest.setTimeout(10000);

describe('PrivateRoute integration', () => {
  it('shows outlet content when user is logged in (admin)', async () => {
    await loginUser(adminCredentials);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route index element={<div>Dashboard Page</div>} />
            </Route>
            <Route path="/" element={<div>Public Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  it('shows outlet content when user is logged in (normal)', async () => {
    await loginUser(normalCredentials);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route index element={<div>Dashboard Page</div>} />
            </Route>
            <Route path="/" element={<div>Public Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  it('shows spinner when user is not logged in', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route index element={<div>Dashboard Page</div>} />
            </Route>
            <Route path="/" element={<div>Public Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/redirecting you in \d+ second\(s\)/i)).toBeInTheDocument();
    });

    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });
});
