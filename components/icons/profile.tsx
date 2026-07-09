import { UserCircle } from 'lucide-react';

/**
 * Account icon — lucide `UserCircle`, same as the static-html mock header.
 * @param   {object}  [props]        - Component properties
 * @param   {boolean} [props.active] - Whether the icon is in the active (pink) state
 * @returns {JSX.Element}            Profile icon
 */
const ProfileIcon = (props?: { active?: boolean }) => {
  return (
    <UserCircle
      strokeWidth={2}
      className={
        'size-full transition-colors duration-300 group-hover:text-fuchsia-500 ' +
        (props?.active ? 'text-fuchsia-500' : 'text-slate-400')
      }
    />
  );
};

export default ProfileIcon;
