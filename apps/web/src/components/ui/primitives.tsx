import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared primitives.
 *
 * Rule for this file: a page never hand-rolls a card, a badge or a stat again.
 * If a page needs a variant that doesn't exist here, add it here.
 */

/* ------------------------------------------------------------- PageHeader */

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.011em] text-ink">{title}</h1>
      {subtitle && <p className="text-xs text-ink-3 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
  </div>
);

/* ------------------------------------------------------------------ Panel */

export const Panel: React.FC<{
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}> = ({ title, action, className = '', bodyClassName = '', children }) => (
  <section className={`panel ${className}`}>
    {(title || action) && (
      <header className="panel-head">
        {typeof title === 'string' ? <h2 className="panel-title">{title}</h2> : title}
        {action}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
);

/* ------------------------------------------------------------------- Stat */

export const Stat: React.FC<{
  label: string;
  value: number | string;
  note?: string;
  tone?: 'default' | 'warn' | 'danger' | 'ok' | 'accent';
  to?: string;
}> = ({ label, value, note, tone = 'default', to }) => {
  const valueTone =
    tone === 'danger'
      ? 'text-danger'
      : tone === 'warn'
      ? 'text-warn'
      : tone === 'ok'
      ? 'text-ok'
      : tone === 'accent'
      ? 'text-accent'
      : 'text-ink';

  const body = (
    <>
      <span className="eyebrow">{label}</span>
      <span className={`block text-num font-semibold tnum mt-2 ${valueTone}`}>{value}</span>
      {note && <span className="block text-xs text-ink-3 mt-1">{note}</span>}
    </>
  );

  const base = 'panel px-4 py-3.5 block';

  return to ? (
    <Link to={to} className={`${base} transition-colors hover:border-line-strong hover:bg-[#FCFCFD]`}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
};

/* ------------------------------------------------------------------ Badge */

export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-ink-2 border-line',
  accent: 'bg-accent-soft text-accent border-accent-line',
  ok: 'bg-[#EDF7F3] text-ok border-[#C6E4DA]',
  warn: 'bg-[#FCF4E9] text-warn border-[#EBD8BC]',
  danger: 'bg-[#FBEEF0] text-danger border-[#EFCBD2]',
};

export const Badge: React.FC<{
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}> = ({ tone = 'neutral', children, className = '' }) => (
  <span
    className={`inline-flex items-center h-5 px-1.5 rounded-chip border text-xs font-medium tnum ${badgeTones[tone]} ${className}`}
  >
    {children}
  </span>
);

/* -------------------------------------------------------------------- Bar */

/** Thin progress rule. Monochrome by design — colour here would mean nothing. */
export const Bar: React.FC<{
  pct: number;
  tone?: 'accent' | 'warn' | 'ok' | 'danger';
  className?: string;
}> = ({ pct, tone = 'accent', className = '' }) => {
  const barColors = {
    accent: 'bg-accent',
    warn: 'bg-warn',
    ok: 'bg-ok',
    danger: 'bg-danger',
  };
  return (
    <div className={`h-1 w-full bg-line rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${barColors[tone] || 'bg-accent'}`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ Empty */

export const Empty: React.FC<{
  title: string;
  hint?: string;
  action?: React.ReactNode;
}> = ({ title, hint, action }) => (
  <div className="px-4 py-10 text-center">
    <p className="text-sm font-medium text-ink">{title}</p>
    {hint && <p className="text-xs text-ink-3 mt-1">{hint}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
