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
import type { JSX } from 'react';

import { contactInfoData, socialData } from '@/components/data';

/** Lucide icon per the `icon` key of `contactInfoData` */
const INFO_ICONS = {
  phone: Phone,
  mail: Mail,
  'map-pin': MapPin,
  clock: Clock,
} as const;

/** Lucide icon and accent color per the `icon` key of `socialData` */
const SOCIAL_ICONS = {
  instagram: { Icon: Instagram, color: '#ed21f1' },
  facebook: { Icon: Facebook, color: '#109aa9' },
  twitter: { Icon: Twitter, color: '#109aa9' },
} as const;

/**
 * ContactInfoCard component — the "Reach out" info sidebar of the contacts
 * page as in the static-html mock (`ContactsPage.tsx` → ContactInfo): tinted
 * contact rows (phone, e-mail, head office, hours) and the "Follow us"
 * social card. Data comes from `components/data.js` until it moves to the
 * CMS.
 * @returns {JSX.Element} Info sidebar with contact rows and social links
 */
const ContactInfoCard = (): JSX.Element => {
  return (
    <div className="flex h-full flex-col gap-5">
      {/* Info cards */}
      <div
        className="flex flex-1 flex-col rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
        style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
      >
        <p className="mb-6 ml-2 text-sm font-black tracking-[0.25em] text-accent-cyan uppercase md:ml-0">
          Reach out
        </p>
        <div className="flex flex-1 flex-col justify-center space-y-4">
          {contactInfoData.map(({ icon, label, value, color, href }) => {
            const iconKey = icon as keyof typeof INFO_ICONS;
            const Icon = INFO_ICONS[iconKey] ?? Phone;
            return (
              <a
                key={label}
                href={href}
                className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01]"
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
          Follow us
        </p>
        <div className="flex gap-3">
          {socialData.map(({ title, icon, link }) => {
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
