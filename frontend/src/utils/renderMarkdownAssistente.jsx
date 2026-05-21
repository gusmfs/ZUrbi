/**
 * Markdown mínimo para respostas do assistente: parágrafos + tabelas.
 */

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const cells = trimmed.split('|').slice(1, -1).map((cell) => cell.trim());
  return cells.length > 0 ? cells : null;
}

function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function parseTableLines(lines) {
  const rawRows = lines.map(parseTableRow).filter(Boolean);
  if (rawRows.length < 2) return null;
  const header = rawRows[0];
  const bodyRows = rawRows.slice(1).filter((row) => !isSeparatorRow(row));
  if (bodyRows.length === 0 && rawRows.length >= 2 && isSeparatorRow(rawRows[1])) {
    return { header, rows: [] };
  }
  return { header, rows: bodyRows };
}

function parseBlocks(text) {
  const blocks = [];
  const lines = (text || '').split('\n');
  let textBuffer = [];
  let i = 0;

  const flushText = () => {
    const content = textBuffer.join('\n').trim();
    if (content) blocks.push({ type: 'text', content });
    textBuffer = [];
  };

  while (i < lines.length) {
    if (lines[i].trim().startsWith('|')) {
      flushText();
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const table = parseTableLines(tableLines);
      if (table) blocks.push({ type: 'table', ...table });
      else textBuffer.push(...tableLines);
    } else {
      textBuffer.push(lines[i]);
      i += 1;
    }
  }

  flushText();
  return blocks;
}

export function ConteudoMensagemAssistente({ content, role }) {
  if (role === 'user') {
    return <p>{content}</p>;
  }

  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return <p>{content}</p>;
  }

  return (
    <div className="cia-assistente-conteudo">
      {blocks.map((block, i) => {
        if (block.type === 'table') {
          return (
            <div key={`tbl-${i}`} className="cia-assistente-table-wrap">
              <table className="cia-assistente-table">
                <thead>
                  <tr>
                    {block.header.map((cell, j) => (
                      <th key={j}>{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p
            key={`txt-${i}`}
            dangerouslySetInnerHTML={{
              __html: escapeHtml(block.content).replace(/\n/g, '<br />'),
            }}
          />
        );
      })}
    </div>
  );
}
