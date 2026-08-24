export async function renderAstroComponent(
  componentPath: string,
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {}
) {
  const url =
    `/__astro-render?component=${encodeURIComponent(componentPath)}` +
    `&props=${encodeURIComponent(JSON.stringify(props))}` +
    `&slots=${encodeURIComponent(JSON.stringify(slots))}`;
  const response = await fetch(url);
  const html = await response.text();
  if (!response.ok) throw new Error(html);
  return html;
}
