export function Table({ children, className = '', ...props }) {
  return (
    <div className="table-scroll">
      <table className={`data-table ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, ...props }) {
  return <tr {...props}>{children}</tr>;
}

export function TableHeaderCell({ children, ...props }) {
  return <th scope="col" {...props}>{children}</th>;
}

export function TableCell({ children, emphasis = false, ...props }) {
  return (
    <td className={emphasis ? 'cell-emphasis' : undefined} {...props}>
      {children}
    </td>
  );
}

export function TableContainer({ title, children, className = '' }) {
  return (
    <div className={`table-container ${className}`.trim()}>
      {title && <h2 className="table-container__title">{title}</h2>}
      {children}
    </div>
  );
}
