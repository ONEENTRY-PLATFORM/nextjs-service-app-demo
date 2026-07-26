import type { JSX } from 'react';

/**
 * ProfileCancelButton — the bordered "Cancel" button shown next to Save while
 * the profile card is in edit mode.
 * Leaving the edit mode unmounts the inputs, so the typed-but-unsaved values
 * are dropped and the rows fall back to the stored user data.
 * @param   {object}      props         - Component props
 * @param   {string}      props.title   - Button label from the dictionary
 * @param   {() => void}  props.onClick - Leaves the edit mode
 * @returns {JSX.Element}               Cancel button
 */
const ProfileCancelButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}): JSX.Element => {
  return (
    <button
      type="button"
      data-testid="profile-cancel"
      onClick={onClick}
      className="min-h-14 shrink-0 rounded-xl border border-slate-240 px-4 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-slate-50 focus-visible:outline-fuchsia-600"
    >
      {title}
    </button>
  );
};

export default ProfileCancelButton;
