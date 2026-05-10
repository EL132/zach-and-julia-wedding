type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="max-w-4xl">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#35452C] sm:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#2D2923]/85">
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
