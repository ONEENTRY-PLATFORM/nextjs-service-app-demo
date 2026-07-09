import parse from 'html-react-parser';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

/**
 * ServiceDescription component displays the service description from page attributes
 * @param   {object}       props      - Component props
 * @param   {IPagesEntity} props.page - The page entity containing attribute values including service_hero_description
 * @returns {JSX.Element}             JSX element containing the parsed HTML description or empty fragment if no description exists
 */
const ServiceDescription = ({ page }: { page: IPagesEntity }): JSX.Element => {
  /** Extract service description from page attributes */
  const { service_hero_description } = page.attributeValues;
  /** Get HTML description value from the service hero description */
  const descArr = service_hero_description?.value as
    Array<{ htmlValue?: string }> | undefined;
  const description = descArr?.[0]?.htmlValue;

  /** Return empty fragment if no description is available */
  if (!description) {
    return <></>;
  }

  /** Render service description with parsed HTML content */
  return (
    <div className="hero-description text-7xl leading-21 tracking-wider max-lg:text-5xl max-md:mx-auto max-md:mt-10 max-md:text-4xl max-md:leading-10">
      {parse(description)}
    </div>
  );
};

export default ServiceDescription;
