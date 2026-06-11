export default function Card({
  children,
  className = '',
  variant = 'default',
  as: Tag = 'div',
  ...props
}) {
  const variantClass =
    variant === 'flat'
      ? 'card card--flat'
      : variant === 'stat'
        ? 'card card--stat'
        : 'card';

  return (
    <Tag className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
