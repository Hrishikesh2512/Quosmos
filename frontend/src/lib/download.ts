/** Trigger a browser download of a text blob. */
export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Capture a DOM element / canvas region as a PNG screenshot. */
export async function downloadScreenshot(node: HTMLElement, filename = 'quosmos.png'): Promise<void> {
  const canvas = node.querySelector('canvas');
  if (canvas) {
    const url = (canvas as HTMLCanvasElement).toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    return;
  }
  // Fallback: serialise the element via SVG foreignObject.
  const rect = node.getBoundingClientRect();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${node.outerHTML}</div>
    </foreignObject></svg>`;
  downloadText(filename.replace('.png', '.svg'), svg, 'image/svg+xml');
}
