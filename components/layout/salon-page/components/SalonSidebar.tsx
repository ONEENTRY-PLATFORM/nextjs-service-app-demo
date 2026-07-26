import { Clock, MapPin, Phone } from 'lucide-react';
import type { ComponentType, JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { useDict } from '@/app/store/providers/useDict';

import type { SalonDetail } from '../types';

/**
 * A single info row inside the sidebar card: a tinted icon tile plus a label
 * over a value. When `href` is set the whole row is a link (e.g. `tel:`).
 * Private helper — used only by {@link SalonSidebar}.
 * @param   {object}                                      props        - Component properties
 * @param   {ComponentType<{size?:number;color?:string}>} props.icon   - Lucide icon component
 * @param   {string}                                      props.color  - Accent color (hex)
 * @param   {string}                                      props.label  - Uppercase label
 * @param   {string}                                      props.value  - Row value
 * @param   {string}                                      [props.href] - Optional link target
 * @returns {JSX.Element}                                              Info row
 */
const Row = ({
  icon: Icon,
  color,
  label,
  value,
  href,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  label: string;
  value: string;
  href?: string | undefined;
}): JSX.Element => {
  const content = (
    <>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}15` }}
      >
        <Icon size={14} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wider text-neutral-300 uppercase">
          {label}
        </p>
        <p className="text-base font-semibold text-slate-400">{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 transition-opacity hover:opacity-70"
      >
        {content}
      </a>
    );
  }
  return <div className="flex items-center gap-3">{content}</div>;
};

/**
 * SalonSidebar — the info card (Address / Phone / Hours rows) plus the map iframe.
 * @param   {object}      props       - Component properties
 * @param   {SalonDetail} props.salon - Salon to render
 * @returns {JSX.Element}             Sidebar with the info card and map
 */
const SalonSidebar = ({ salon }: { salon: SalonDetail }): JSX.Element => {
  const dict = useDict();
  const c = salon.color;
  return (
    <aside className="flex flex-col gap-4">
      <RevealAnimations
        className="rounded-2xl bg-white p-5"
        style={{ border: `1.5px solid ${c}22`, boxShadow: `0 4px 24px ${c}10` }}
        distance={30}
        delay={0.05}
      >
        <div className="flex flex-col gap-3">
          <Row
            icon={MapPin}
            color={c}
            label={
              (dict?.salon_address_label?.value as string | undefined) ||
              'Address'
            }
            value={salon.address}
          />
          {salon.phone && (
            <Row
              icon={Phone}
              color={c}
              label={
                (dict?.salon_phone_label?.value as string | undefined) ||
                'Phone'
              }
              value={salon.phone}
              href={`tel:${salon.tel}`}
            />
          )}
          <Row
            icon={Clock}
            color={c}
            label={
              (dict?.salon_hours_label?.value as string | undefined) || 'Hours'
            }
            value={
              (dict?.salon_hours_value?.value as string | undefined) ||
              'Daily 10:00–22:00'
            }
          />
        </div>
      </RevealAnimations>

      {/* Map — fade-only reveal: a lingering wrapper transform would become the
          iframe's containing block and shift the embedded map */}
      <RevealAnimations
        fade
        delay={0.15}
        className="h-60 overflow-hidden rounded-2xl"
        style={{ border: `1.5px solid ${c}33` }}
      >
        <iframe
          title={salon.name}
          src={salon.mapSrc}
          className="size-full border-0"
          style={{ filter: 'saturate(0.9) contrast(0.95)' }}
          loading="lazy"
        />
      </RevealAnimations>
    </aside>
  );
};

export default SalonSidebar;
