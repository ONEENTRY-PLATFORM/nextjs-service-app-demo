import { Star } from 'lucide-react';
import type { JSX } from 'react';

/**
 * Filled rating star — lucide `Star` filled and stroked with the given colour,
 * as in the static-html mock rating rows (CYAN by default, PINK on the profile
 * visit card).
 * @param   {object}      props         - Component properties
 * @param   {number}      props.size    - Icon size in pixels
 * @param   {string}      [props.color] - Fill/stroke colour (default CYAN `#109AA9`)
 * @returns {JSX.Element}               Filled star icon
 */
const StarIcon = ({
  size,
  color = '#109AA9',
}: {
  size: number;
  color?: string;
}): JSX.Element => {
  return <Star size={size} fill={color} stroke={color} />;
};

export default StarIcon;
