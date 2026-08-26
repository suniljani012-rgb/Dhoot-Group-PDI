import React from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ Panel */
export const Panel: React.FC<{
  title?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, action, footer, bodyClassName = '', className = '', children }) => (
  <div className={`bg-surface border border-line rounded-panel shadow-xs ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-line gap-3">
        {typeof title === 'string' ? (
          <h2 className="text-xs font-semibold tracking-[-0.01em] text-ink uppercase tracking-[0.04em]">
            {title}
          </h2>
        ) : (
          title
        )}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
    {footer && <div className="px-4 py-2.5 border-t border-line text-xs bg-canvas/40">{footer}</div>}
  </div>
);

/* ------------------------------------------------------------------- Stat */
export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  note?: string;
  tone?: 'default' | 'warn' | 'danger' | 'ok' | 'accent' | 'neutral';
  to?: string;
}> = ({ label, value, note, tone = 'default', to }) => {
  const valueColor =
    tone === 'danger'
      ? 'text-danger'
      : tone === 'warn'
      ? 'text-warn'
      : tone === 'ok'
      ? 'text-ok'
      : tone === 'accent'
      ? 'text-accent'
      : 'text-ink';

  const Content = (
    <div className="bg-surface border border-line rounded p-3 shadow-xs hover:border-line-strong transition-colors h-full flex flex-col justify-between">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        {to && <span className="text-xs text-ink-3">→</span>}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={`text-2xl font-semibold tracking-[-0.02em] tnum ${valueColor}`}>
          {value}
        </span>
      </div>
      {note && <span className="text-[11px] text-ink-3 mt-1 block truncate">{note}</span>}
    </div>
  );

  return to ? (
    <Link to={to} className="block group">
      {Content}
    </Link>
  ) : (
    Content
  );
};

/* ------------------------------------------------------------------ Badge */
export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

export const Badge: React.FC<{
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}> = ({ tone = 'neutral', children, className = '' }) => {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-canvas text-ink-2 border-line',
    accent: 'bg-accent-soft text-accent border-accent/20',
    ok: 'bg-ok/10 text-ok border-ok/20',
    warn: 'bg-warn/10 text-warn border-warn/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-chip text-[11px] font-medium border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

/* -------------------------------------------------------------------- Bar */
export const Bar: React.FC<{
  pct: number;
  tone?: 'accent' | 'ok' | 'warn' | 'danger';
  className?: string;
}> = ({ pct, tone = 'accent', className = '' }) => {
  const tones = {
    accent: 'bg-accent',
    ok: 'bg-ok',
    warn: 'bg-warn',
    danger: 'bg-danger',
  };
  return (
    <div className={`h-1.5 w-full bg-line rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${tones[tone]} transition-all duration-300`}
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
  <div className="p-8 text-center">
    <p className="text-xs font-medium text-ink-2">{title}</p>
    {hint && <p className="text-[11px] text-ink-3 mt-1 max-w-sm mx-auto">{hint}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
