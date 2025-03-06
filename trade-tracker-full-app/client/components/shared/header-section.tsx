interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ label, title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {label ? (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text font-semibold text-transparent">
          {label}
        </div>
      ) : null}
      <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-6 text-balance text-lg text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
