export default function Input({
  id,
  label,
  error,
  hint,
  className = '',
  required,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <input id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} required={required} {...props} />
      {error && (
        <div id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${inputId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}
