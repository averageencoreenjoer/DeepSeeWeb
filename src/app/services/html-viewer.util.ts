export function isHtmlViewerType(type?: string): boolean {
  const normalized = (type || '').toLowerCase();
  return normalized === 'htmlviewer' || normalized === 'dsw.addons.htmlviewer';
}

export function buildHtmlViewerMarkup(data?: string, filters = ''): string {
  const source = (data || '').replace(/\$\$\$FILTERS/g, encodeURIComponent(filters));
  const trimmed = source.trim();
  if (!trimmed) {
    return '';
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return source;
  }
  return `<iframe src="${escapeHtmlAttribute(source)}" style="border:none;width:100%;height:100%;flex:1 1 100%"></iframe>`;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
