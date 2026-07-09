import type { JSX } from 'react';

/**
 * OrderStatus
 * @param   {object}      props                  - Props for the component
 * @param   {string}      props.statusIdentifier - The status identifier for the order
 * @returns {JSX.Element}                        JSX element
 */
const OrderStatus = ({
  statusIdentifier,
}: {
  statusIdentifier: string;
}): JSX.Element => {
  return (
    <div className="h-8.5 w-full min-w-20 items-center justify-center rounded-3xl border border-solid border-neutral-400 bg-transparent p-1 text-center text-base leading-6 font-bold tracking-wide text-neutral-400 uppercase transition-colors duration-300 hover:border-neutral-400 hover:text-neutral-400 focus-visible:text-neutral-400 focus-visible:outline-neutral-400 disabled:border-neutral-300 disabled:text-neutral-300">
      {statusIdentifier}
    </div>
  );
};

export default OrderStatus;
