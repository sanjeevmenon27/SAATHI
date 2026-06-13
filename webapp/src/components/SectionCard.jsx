export const SectionCard = ({ title, subtitle, actions, children, className = "" }) => (
  <section className={`rounded-[28px] bg-white p-4 shadow-card sm:p-6 ${className}`}>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-cocoa-900 sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-7 text-cocoa-700 sm:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
    </div>
    {children}
  </section>
);
