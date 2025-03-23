import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom";
import AdminRoute from './AdminRoute';
import axios from 'axios';
import { DUMMY_USERS } from '../../misc/dummyData';
import { AuthProvider } from '../../context/auth';

axios.defaults.baseURL = 'http://localhost:6060';

const dummyUser = DUMMY_USERS[0];
const adminCredentials = {
    email: dummyUser.email,
    password: 'password123',
};

const normalUser = DUMMY_USERS[1];
const normalCredentials = {
    email: normalUser.email,
    password: "hello@test.com"
}

const loginAdmin = async () => {
    const res = await axios.post('/api/v1/auth/login', adminCredentials);
    const token = res.data.token;

    localStorage.setItem('auth', JSON.stringify(res.data));
    axios.defaults.headers.common['Authorization'] = token;

    return res.data;
};

const loginNormalUser = async () => {
    const res = await axios.post('/api/v1/auth/login', normalCredentials);
    const token = res.data.token;

    localStorage.setItem('auth', JSON.stringify(res.data));
    axios.defaults.headers.common['Authorization'] = token;

    return res.data;
};

afterEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
});

jest.setTimeout(10000);

describe('AdminRoute integration', () => {
    it('shows Spinner immediately when no token is present', async () => {
        render(
          <AuthProvider>
            <MemoryRouter initialEntries={['/admin']}>
              <Routes>
                <Route path="/admin" element={<AdminRoute />}>
                  <Route index element={<div>Admin Page</div>} />
                </Route>
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        );
      
        // Spinner should appear immediately, and Admin Page should not be visible
        expect(screen.getByText(/redirecting you in \d+ second\(s\)/i)).toBeInTheDocument();
        expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
      });

    it('shows countdown text when user is unauthorized', async () => {
        await loginNormalUser();

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/admin']}>
                    <Routes>
                        <Route path="/admin" element={<AdminRoute />}>
                            <Route index element={<div>Admin Page</div>} />
                        </Route>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/redirecting you in \d+ second\(s\)/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
        });
    });

    it('shows outlet content when user is authorized', async () => {
        await loginAdmin();

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/admin']}>
                    <Routes>
                        <Route path="/admin" element={<AdminRoute />}>
                            <Route index element={<div>Admin Page</div>} />
                        </Route>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Admin Page')).toBeInTheDocument();
        });
    });
});
