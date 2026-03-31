import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { GameDetail } from './pages/GameDetail';
import { GameTools } from './pages/GameTools';
import { NotFound } from './pages/NotFound';
import { CardViewer } from './pages/CardViewer';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Wiki } from './pages/Wiki';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/wiki',
    element: <Layout><Wiki /></Layout>,
  },
  {
    path: '/cards',
    element: <Layout><CardViewer /></Layout>,
  },
  {
    path: '/admin/login',
    element: <Layout><AdminLogin /></Layout>,
  },
  {
    path: '/admin/dashboard',
    element: <Layout><AdminDashboard /></Layout>,
  },
  {
    path: '/game/:gameId',
    element: <Layout><GameDetail /></Layout>,
  },
  {
    path: '/tools',
    element: <Layout><GameTools /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
]);
