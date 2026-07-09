import type { JSX } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * CloseSearch component to render a close button for search results.
 *
 * This component displays a simple close button (×) that, when clicked,
 * hides the search results by updating the state.
 * @param   {object}                            props          - Component properties
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState - Function to update the search results visibility state
 * @returns {JSX.Element}                                      JSX.Element representing a close button for search results
 */
const CloseSearch = ({
  setState,
}: {
  setState: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  return (
    <button
      className="absolute top-3 right-3 size-4"
      onClick={() => setState(false)}
      aria-label="Close search results"
    >
      &#10005;
    </button>
  );
};

export default CloseSearch;
