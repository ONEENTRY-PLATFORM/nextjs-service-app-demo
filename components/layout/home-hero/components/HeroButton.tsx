import Link from 'next/link';
import type { JSX } from 'react';

interface IAttributeValues {
  button_link?: {
    value?: string;
  };
  button_text?: {
    value?: string;
  };
}

/**
 * HeroButton component.
 *
 * This component renders a call-to-action button in the hero section.
 * It displays a link with customizable text and destination.
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Object containing button attributes (link and text)
 * @returns {JSX.Element}                            JSX.Element representing the HeroButton
 */
const HeroButton = ({
  attributeValues,
}: {
  attributeValues: IAttributeValues;
}): JSX.Element => {
  /** Extract button link and text from attribute values */
  const { button_link, button_text } = attributeValues;

  /** Render hero call-to-action button with link and styling */
  return (
    <Link
      href={button_link?.value || '#'}
      style={{
        opacity: 0,
      }}
      className="hero-button relative mb-6 ml-auto justify-center overflow-hidden bg-white px-10 py-1.5 text-xl leading-10 tracking-[3.98px] whitespace-nowrap text-zinc-800 uppercase transition-all duration-300 ease-in-out hover:opacity-85 hover:backdrop-blur-md max-md:mt-10 max-md:px-5 max-sm:mx-auto"
    >
      {button_text?.value}
    </Link>
  );
};

export default HeroButton;
