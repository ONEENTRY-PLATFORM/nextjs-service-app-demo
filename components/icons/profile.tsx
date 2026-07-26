import { UserCircle } from 'lucide-react';
import type { JSX } from 'react';

/**
 * Account icon — lucide `UserCircle`.
 * @param   {object}      [props]        - Component properties
 * @param   {boolean}     [props.active] - Whether the icon is in the active (pink) state
 * @returns {JSX.Element}                Profile icon
 */
const ProfileIcon = (props?: { active?: boolean }): JSX.Element => {
  return (
    <UserCircle
      strokeWidth={2}
      className={
        'size-full transition-colors duration-300 ' +
        (props?.active ? 'text-fuchsia-500' : 'text-neutral-300')
      }
    />
  );
};

export default ProfileIcon;
