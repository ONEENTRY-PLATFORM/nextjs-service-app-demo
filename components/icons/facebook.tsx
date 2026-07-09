import { Facebook } from 'lucide-react';

/**
 * Facebook icon — lucide, same as the static-html mock footer.
 * @param   {object}      [props]        - Component properties
 * @param   {boolean}     [props.active] - Whether the icon is in the active (pink) state
 * @param   {number}      [props.size]   - Icon size in pixels (default 22)
 * @returns {JSX.Element}                Facebook icon
 */
const FacebookIcon = (props?: { active?: boolean; size?: number }) => {
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
