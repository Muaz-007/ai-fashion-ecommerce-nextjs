interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ eyebrow, title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <header className="flex justify-between items-start mb-10 flex-wrap gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-widest text-accent font-medium mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl md:text-4xl mb-1">{title}</h1>
        {subtitle && <p className="text-muted text-sm md:text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
