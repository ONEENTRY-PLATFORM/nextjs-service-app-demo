import parse from 'html-react-parser';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

/**
 * ServiceTitle component for rendering the service title on a page
 * @param   {object}       props      - Component properties object
 * @param   {IPagesEntity} props.page - Page entity object containing attributeValues property to get title content
 * @returns {JSX.Element}             JSX element displaying parsed HTML title or empty fragment
 */
const ServiceTitle = ({ page }: { page: IPagesEntity }): JSX.Element => {
  /** Extract service title value from page attributes (`page_simple` set) */
  const { page_title } = page.attributeValues;
  const title = page_title?.value as string | undefined;

  /** If no title content, return empty fragment */
  if (!title) {
    return <></>;
  }

  return (
    <div className="hero-title mb-4 flex items-baseline justify-start text-[190px] leading-55 max-lg:text-display max-lg:leading-4 max-md:text-9xl max-md:leading-4 max-sm:text-9xl">
      {parse(title)}
    </div>
  );
};

export default ServiceTitle;
