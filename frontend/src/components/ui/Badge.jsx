const VARIANTS = ['primary', 'success', 'warning', 'error'];

export default function Badge({ children, variant = 'primary', className = '' }) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';

  return (
    <span className={`badge badge-${safeVariant} ${className}`.trim()}>
      {children}
    </span>
  );
}
