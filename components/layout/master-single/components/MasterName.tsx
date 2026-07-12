import type { JSX } from 'react';

/**
 * MasterName component — the specialist's name and role line.
 *
 * Displays the master name in DARK and, beneath it, the role line in PINK
 * (typically the master's short description, falling back to the service
 * category upstream). The role line is omitted when empty.
 * @param   {object}      props      - Component properties.
 * @param   {string}      props.name - Master name.
 * @param   {string}      props.role - Role line (short description / category).
 * @returns {JSX.Element}            JSX.Element representing the name block.
 */
const MasterName = ({
  name,
  role,
}: {
  name: string;
  role: string;
}): JSX.Element => {
  return (
    <div>
      <h1
        className="leading-tight font-semibold text-slate-400"
        style={{ fontSize: '1.6rem' }}
      >
        {name}
      </h1>
      {role ? (
        <p className="mt-0.5 text-sm font-bold text-fuchsia-500">{role}</p>
      ) : null}
    </div>
  );
};

export default MasterName;
