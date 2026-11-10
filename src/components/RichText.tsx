import React from 'react';

export interface RichTextProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  strongClassName?: string;
  /** Optional transform for each run of text (e.g. underlining glossary terms). */
  linkText?: (text: string) => React.ReactNode;
}

/**
 * Strips all double asterisks (**) from text for clean usage in HTML attributes
 * such as aria-label, title, tooltip, and alt.
 */
export function stripMarkers(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '');
}

const SUBSCRIPT = /([A-Za-zα-ωΑ-Ω][̄̂²³]*)_(α\/2|[A-Za-zα-ω0-9]+̄?)/g;

/**
 * Converts text containing pairs of **text** into bold React nodes without dangerouslySetInnerHTML.
 * Unpaired trailing ** markers are dropped cleanly. Normal punctuation, newlines, and single * remain intact.
 */
export function renderRichText(
  text?: string | null,
  strongClassName = 'font-semibold text-on-surface',
  linkText?: (text: string) => React.ReactNode
): React.ReactNode {
  if (!text) return null;
  const plain = (part: string, key: string) =>
    linkText ? <React.Fragment key={key}>{linkText(part)}</React.Fragment> : part;
  // "Z_α/2", "σ_x̄", "λ_baru" in running text → real subscripts instead of an underscore.
  const run = (part: string, key: string): React.ReactNode => {
    if (!part.includes('_')) return plain(part, key);
    const nodes: React.ReactNode[] = [];
    let last = 0;
    for (const m of part.matchAll(SUBSCRIPT)) {
      const at = m.index ?? 0;
      if (at > last) nodes.push(plain(part.slice(last, at), `${key}-t${at}`));
      nodes.push(
        <span key={`${key}-s${at}`} className="whitespace-nowrap">
          {m[1]}
          <sub className="text-[0.75em]">{m[2]}</sub>
        </span>,
      );
      last = at + m[0].length;
    }
    if (last === 0) return plain(part, key);
    if (last < part.length) nodes.push(plain(part.slice(last), `${key}-end`));
    return <React.Fragment key={key}>{nodes}</React.Fragment>;
  };
  if (!text.includes('**')) return run(text, 'text');

  const parts = text.split('**');

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i].length > 0) {
        nodes.push(run(parts[i], `text-${i}`));
      }
    } else {
      // Odd index: inside ** ... ** if paired
      if (i + 1 < parts.length) {
        // Paired match
        nodes.push(
          <strong key={`bold-${i}`} className={strongClassName}>
            {run(parts[i], 'text')}
          </strong>
        );
      } else {
        // Unpaired trailing ** - drop marker, keep text as plain
        if (parts[i].length > 0) {
          nodes.push(run(parts[i], `text-${i}`));
        }
      }
    }
  }

  return nodes;
}

/**
 * RichText component to render text with markdown-style double asterisks as bold strong tags.
 * Usage: <RichText text="... **bold** ..." /> or <RichText>... **bold** ...</RichText>
 */
export const RichText: React.FC<RichTextProps> = ({
  text,
  children,
  className,
  strongClassName = 'font-semibold text-on-surface',
  linkText,
}) => {
  const rawText = typeof children === 'string' ? children : (text ?? '');
  const rendered = renderRichText(rawText, strongClassName, linkText);

  if (className) {
    return <span className={className}>{rendered}</span>;
  }
  return <>{rendered}</>;
};

export default RichText;
