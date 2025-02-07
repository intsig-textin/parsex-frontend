export function isHtmlTable(html: string) {
  return /<table[\s\S]*?<\/table>/i.test(html);
}

export function extractTableFromHTML(html: string) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const table = tempDiv.querySelector('table');
  return table ? table.outerHTML : '';
}

export function markdownToHtmlTable(markdown: string) {
  const lines = markdown.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('Invalid Markdown table format');
  }

  const headers = lines[0]
    .trim()
    .split('|')
    .map((header) => header.trim())
    .filter((header) => header !== '');
  const separator = lines[1].trim();

  if (!/^(\|\s*-+\s*)+\|?$/.test(separator)) {
    throw new Error('Invalid Markdown table separator');
  }

  const rows = lines.slice(2).map((line) =>
    line
      .trim()
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell !== ''),
  );

  const columnCount = headers.length;
  const normalizeRow = (row: string[]) => {
    while (row.length < columnCount) {
      row.push('');
    }
    return row;
  };
  const normalizedHeaders = normalizeRow(headers);
  const normalizedRows = rows.map(normalizeRow);

  let html = '<table>\n<thead>\n<tr>';

  // Process headers to handle merging
  let lastHeader: string | null = null;
  let colspan = 0;
  normalizedHeaders.forEach((header, index) => {
    if (header === lastHeader) {
      colspan++;
    } else {
      if (colspan > 1) {
        html += `<th colspan="${colspan}">${lastHeader}</th>`;
      } else if (colspan === 1) {
        html += `<th>${lastHeader}</th>`;
      }
      lastHeader = header;
      colspan = 1;
    }
  });
  // Append the last header
  if (colspan > 1) {
    html += `<th colspan="${colspan}">${lastHeader}</th>`;
  } else {
    html += `<th>${lastHeader}</th>`;
  }

  html += '</tr>\n</thead>\n<tbody>\n';

  normalizedRows.forEach((row) => {
    html += '<tr>';
    row.forEach((cell) => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>\n';
  });

  html += '</tbody>\n</table>';

  return html;
}

const NL = '\n';

export function htmlTableToMarkdown(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const table = container.querySelector('table');
  if (!table) {
    return html;
  }
  const rows: string[] = [];
  const trEls = table.getElementsByTagName('tr');
  for (let i = 0; i < trEls.length; i++) {
    const tableRow = trEls[i];
    const markdownRow = convertTableRowElementToMarkdown(tableRow, i);
    rows.push(markdownRow);
  }
  return rows.join(NL);
}

function convertTableRowElementToMarkdown(tableRowEl: HTMLTableRowElement, rowNumber: number) {
  const cells: string[] = [];
  const cellEls = tableRowEl.children;
  for (let i = 0; i < cellEls.length; i++) {
    const cell = cellEls[i] as HTMLElement;
    cells.push(cell.innerText + ' |');
  }
  let row = '| ' + cells.join(' ');

  if (rowNumber === 0) {
    row = row + NL + createMarkdownDividerRow(cellEls.length);
  }

  return row;
}

function createMarkdownDividerRow(cellCount: number) {
  const dividerCells: string[] = [];
  for (let i = 0; i < cellCount; i++) {
    dividerCells.push('---' + ' |');
  }
  return '| ' + dividerCells.join(' ');
}
