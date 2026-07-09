'use client';

import type { JSX } from 'react';

/**
 * NotFound
 * @param   {object}      props         - { message: string }
 * @param   {string}      props.message - message to display
 * @returns {JSX.Element}               NotFound component
 */
const NotFound = ({ message }: { message: string }): JSX.Element => {
  return <div className="text-center text-gray-700">{message}</div>;
};

export default NotFound;
