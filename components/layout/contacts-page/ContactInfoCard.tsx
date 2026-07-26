import {
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { buildContactRows } from '@/components/layout/contacts-page/utils/buildContactRows';
import { buildSocialLinks } from '@/components/utils/buildSocialLinks';
import type { CmsSalon } from '@/components/utils/salonFromPage';

/** Lucide icon and accent color per the `icon` key of a contact row */
const INFO_ICONS = {
  phone: { Icon: Phone, color: '#ed21f1' },
  mail: { Icon: Mail, color: '#109aa9' },
  'map-pin': { Icon: MapPin, color: '#9b4fb2' },
  clock: { Icon: Clock, color: '#9b4fb2' },
} as const;

/** Lucide icon and accent color per the `icon` key of a social entry */
const SOCIAL_ICONS = {
  instagram: { Icon: Instagram, color: '#ed21f1' },
  facebook: { Icon: Facebook, color: '#109aa9' },
  twitter: { Icon: Twitter, color: '#109aa9' },
} as const;

/** Props for {@link ContactInfoCard} */
interface ContactInfoCardProps {
  /** Primary (head-office) salon — source of the phone and address rows */
  salon: CmsSalon | undefined;
  /** Collapsed week hours (`"10:00 – 22:00"`), or `null` when days differ */
  hours: string | null;
}

/**
 * ContactInfoCard component — the "Reach out" info sidebar of the contacts
 * page as in the static-html mock (`ContactsPage.tsx` → ContactInfo): tinted
 * contact rows (phone, e-mail, head office, hours) and the "Follow us"
 * social card. Everything comes from the CMS: the rows from the head-office
 * salon page plus the `opening_time` block, the social URLs from the
 * `system_content` dictionary.
 * @param   {ContactInfoCardProps} props - Primary salon and collapsed week hours
 * @returns {JSX.Element}                Info sidebar with contact rows and social links
 */
const ContactInfoCard = ({
  salon,
  hours,
}: ContactInfoCardProps): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');
  const rows = buildContactRows({ salon, hours, dict });
  const socials = buildSocialLinks(dict);

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Info cards */}
      <div
        className="flex flex-1 flex-col rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
        style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
      >
        <p className="mb-6 ml-2 text-sm font-black tracking-[0.25em] text-accent-cyan uppercase md:ml-0">
          {(dict?.reach_out_text?.value as string | undefined) || 'Reach out'}
        </p>
        <div className="flex flex-1 flex-col justify-center space-y-4">
          {rows.map(({ icon, label, value, href }) => {
            const { Icon, color } = INFO_ICONS[icon];
            return (
              <a
                key={label}
                href={href}
                className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-101"
                style={{
                  background: `${color}08`,
                  border: `1.5px solid ${color}20`,
                }}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p className="mb-0.5 text-xs tracking-wide text-neutral-300 uppercase">
                    {label}
                  </p>
                  <p className="text-base font-semibold text-slate-400">
                    {value}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="ml-auto shrink-0 text-neutral-300"
                />
              </a>
            );
          })}
        </div>
      </div>

      {/* Social */}
      <div
        className="rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
        style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
      >
        <p className="mb-4 ml-2 text-sm font-black tracking-[0.2em] text-slate-400 uppercase md:ml-0">
          {(dict?.follow_us_text?.value as string | undefined) || 'Follow us'}
        </p>
        <div className="flex gap-3">
          {socials.map(({ title, icon, link }) => {
            const social =
              SOCIAL_ICONS[icon as keyof typeof SOCIAL_ICONS] ??
              SOCIAL_ICONS.instagram;
            const { Icon, color } = social;
            return (
              <a
                key={title}
                href={link}
                className="flex flex-1 flex-col items-center gap-2 rounded-2xl py-4 transition-transform duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95"
                style={{
                  background: `${color}10`,
                  border: `1.5px solid ${color}25`,
                }}
              >
                <Icon size={22} color={color} />
                <span className="text-xs font-medium" style={{ color }}>
                  {title}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
