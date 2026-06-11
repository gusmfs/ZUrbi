export default function PageHeader({ title, description, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
