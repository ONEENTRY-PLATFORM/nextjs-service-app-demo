import type { JSX } from 'react';

/**
 * AddressCard component renders an address with a location icon.
 *
 * This component displays a formatted address with a location icon, typically used
 * to display business addresses or location information. The address is rendered
 * within an HTML `<address>` element for semantic markup.
 * @param   {object}      props         - Component properties
 * @param   {string}      props.address - Address text to display
 * @returns {JSX.Element}               JSX.Element representing an address card with location icon
 */
const AddressCard = ({ address }: { address: string }): JSX.Element => {
  return (
    <address className="flex w-full gap-1 text-xs leading-5 not-italic">
      <svg
        className="size-5 shrink-0 fill-neutral-600"
        width="32"
        height="33"
        viewBox="0 0 32 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M15.9957 1.93359C21.3828 1.93359 25.75 6.59252 25.75 12.3396C25.75 14.5043 25.0618 16.1861 24.07 18.1797C21.2803 24.4317 15.9957 31.9336 15.9957 31.9336C15.9957 31.9336 10.7111 24.4317 7.92137 18.1797C6.78724 15.78 6.24137 14.5044 6.24137 12.3396C6.24137 6.59254 10.6085 1.93359 15.9957 1.93359ZM15.9957 18.0488C18.9513 18.0488 21.3474 15.4927 21.3474 12.3396C21.3474 9.18648 18.9513 6.63039 15.9957 6.63039C13.04 6.63039 10.644 9.18649 10.644 12.3396C10.644 15.4928 13.04 18.0488 15.9957 18.0488Z" />
      </svg>
      <div className="my-auto flex-auto text-gray-700">{address}</div>
    </address>
  );
};

export default AddressCard;
