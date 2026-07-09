import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import MenuSection from './components/MenuSection';

/**
 * Footer component to render the site footer section.
 *
 * This component renders the main site footer which includes the menu section.
 * It uses the provided dictionary for localization of text elements.
 *
 * The footer contains:
 * 1. Menu section with navigation links
 * 2. Copyright information
 * 3. Social media links
 * 4. Contact information
 * @param   {object}               props      - Component properties
 * @param   {IAttributeValues}     props.dict - Dictionary object containing localized text values from OneEntry CMS
 * @returns {Promise<JSX.Element>}            JSX.Element representing the site footer
 */
const Footer = async ({
  dict,
}: {
  dict: IAttributeValues;
}): Promise<JSX.Element> => {
  return (
    <footer className="max-w-full bg-gradient-1 fade-in">
      <MenuSection dict={dict} />
    </footer>
  );
};

export default Footer;
