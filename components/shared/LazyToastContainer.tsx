'use client';

import 'react-toastify/dist/ReactToastify.css';

import type { JSX } from 'react';
import { ToastContainer } from 'react-toastify';

/**
 * LazyToastContainer — the toast host plus its stylesheet, isolated in one
 * chunk so `react-toastify` and its CSS are not part of every page's initial
 * bundle. Loaded on demand by ResponsiveToastContainer.
 * @returns {JSX.Element} Toast container
 */
const LazyToastContainer = (): JSX.Element => {
  return <ToastContainer position="bottom-right" autoClose={2000} />;
};

export default LazyToastContainer;
