import { Facebook } from 'lucide-react';
import type { JSX } from 'react';

/**
 * Facebook icon — lucide.
 * @param   {object}      [props]        - Component properties
 * @param   {boolean}     [props.active] - Whether the icon is in the active (pink) state
 * @param   {number}      [props.size]   - Icon size in pixels (default 22)
 * @returns {JSX.Element}                Facebook icon
 */
const FacebookIcon = (props?: {
  active?: boolean;
  size?: number;
}): JSX.Element => {
  return (
    <Facebook
      size={props?.size ?? 22}
      strokeWidth={2}
      className={
        'transition-colors duration-300 group-hover:text-fuchsia-500 ' +
        (props?.active ? 'text-fuchsia-500' : 'text-black')
      }
    />
  );
};

export default FacebookIcon;
