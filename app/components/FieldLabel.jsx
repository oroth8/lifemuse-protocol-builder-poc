/** Matches ProtocolBuilder metadata labels (e.g. contraindications). */
export const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E6980]";

export function FieldLabel({ children, htmlFor, className = "" }) {
  const cls = `${fieldLabelClass} block ${className}`.trim();
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={cls}>
        {children}
      </label>
    );
  }
  return <span className={cls}>{children}</span>;
}
