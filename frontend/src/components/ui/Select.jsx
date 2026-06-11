export default function Select({
  id,
  label,
  error,
  hint,
  className = '',
  required,
  children,
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        required={required}
        {...props}
      >
        {children}
      </select>
      {error && (
        <div id={`${selectId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${selectId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}
