const VARIANTS = ['primary', 'success', 'warning', 'error'];

export default function Alert({
  children,
  variant = 'primary',
  className = '',
  role = 'status',
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';

  return (
    <div
      className={`alert alert-${safeVariant} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : role}
    >
      {children}
    </div>
  );
}
