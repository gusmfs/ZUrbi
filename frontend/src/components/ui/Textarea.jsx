export default function Textarea({
  id,
  label,
  error,
  hint,
  className = '',
  required,
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={textareaId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        required={required}
        {...props}
      />
      {error && (
        <div id={`${textareaId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${textareaId}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
}
