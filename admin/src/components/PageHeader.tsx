interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 [&>*]:min-w-[120px] [&>*]:flex-1 [&>button]:min-h-[44px] md:flex-nowrap md:[&>*]:min-w-0 md:[&>*]:flex-initial md:[&>button]:min-h-0">
          {actions}
        </div>
      )}
    </div>
  );
}
