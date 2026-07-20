import { Edit3 } from 'lucide-react';
import type { JSX } from 'react';

/**
 * ProfileEditButton — the outlined "Edit" button that switches the profile
 * card from its read-only rows into the editable form (static-html mock
 * `AccountPage.tsx`, view state).
 * @param   {object}      props         - Component props
 * @param   {string}      props.title   - Button label from the dictionary
 * @param   {() => void}  props.onClick - Enters the edit mode
 * @returns {JSX.Element}               Edit button
 */
const ProfileEditButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}): JSX.Element => {
  return (
    <button
      type="button"
      data-testid="profile-edit"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border-2 border-accent-pink px-5 py-3.5 text-base font-bold text-accent-pink transition-transform duration-150 hover:scale-102 focus-visible:outline-fuchsia-600 active:scale-97"
    >
      <Edit3 size={14} aria-hidden="true" />
      {title}
    </button>
  );
};

export default ProfileEditButton;
