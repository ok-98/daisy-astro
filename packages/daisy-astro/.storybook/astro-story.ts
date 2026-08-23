export async function renderAstroComponent(componentPath: string, props: Record<string, unknown> = {}) {
  const url = `/__astro-render?component=${encodeURIComponent(componentPath)}&props=${encodeURIComponent(JSON.stringify(props))}`;
  const response = await fetch(url);
  const html = await response.text();
  if (!response.ok) throw new Error(html);
  return html;
}
