import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { appWithTranslation } from 'next-i18next/pages';
import nextI18NextConfig from '../../next-i18next.config.js';

function AppContent({ Component, pageProps }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const publicRoutes = ['/', '/forgot-pw'];
  const isPublic = publicRoutes.includes(router.pathname);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && !isPublic) {
        router.replace('/');
      } else if (isAuthenticated && router.pathname === '/') {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="colored"
      />
    </AuthProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
