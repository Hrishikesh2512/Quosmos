import { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/lib/cn';

interface MathProps {
  tex: string;
  display?: boolean;
  className?: string;
}

/** Render a LaTeX string with KaTeX. Falls back to raw text on error. */
export function Math({ tex, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return tex;
    }
  }, [tex, display]);

  return (
    <span
      className={cn(display ? 'block my-2 text-center' : 'inline', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
