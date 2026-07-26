import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';

/**
 * MasterExperience component — the specialist's working experience line.
 *
 * Renders "Working experience: <b>{experience}</b>" in the DARK tone. Returns
 * `null` when no experience value is available so the layout degrades cleanly.
 * @param   {object}             props            - Component properties.
 * @param   {string}             props.experience - Working experience text (e.g. "10 years").
 * @returns {JSX.Element | null}                  JSX.Element representing the experience line, or null.
 */
const MasterExperience = ({
  experience,
}: {
  experience: string;
}): JSX.Element | null => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  if (!experience) {
    return null;
  }

  return (
    <p className="item mt-2 text-sm text-slate-400">
      {dictText(dict, 'working_experience_label', 'Working experience:')}{' '}
      <span className="font-bold">{experience}</span>
    </p>
  );
};

export default MasterExperience;
