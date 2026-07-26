import { Star } from 'lucide-react';
import type { JSX } from 'react';

/**
 * Empty rating star — lucide `Star` with a transparent fill and a coloured
 * outline.
 * @param   {object}      props         - Component properties
 * @param   {number}      props.size    - Icon size in pixels
 * @param   {string}      [props.color] - Outline colour (default CYAN `#109AA9`)
 * @returns {JSX.Element}               Hollow star icon
 */
const StarOpenIcon = ({
  size,
  color = '#109AA9',
}: {
  size: number;
  color?: string;
}): JSX.Element => {
  return <Star size={size} fill="transparent" stroke={color} />;
};

export default StarOpenIcon;
