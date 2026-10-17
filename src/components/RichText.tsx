import React from 'react';

export interface RichTextProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  strongClassName?: string;
}

/**
 * Strips all double asterisks (**) from text for clean usage in HTML attributes
 * such as aria-label, title, tooltip, and alt.
 */
export function stripMarkers(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '');
}

/**
 * Converts text containing pairs of **text** into bold React nodes without dangerouslySetInnerHTML.
 * Unpaired trailing ** markers are dropped cleanly. Normal punctuation, newlines, and single * remain intact.
 */
export function renderRichText(
  text?: string | null,
  strongClassName = 'font-semibold text-on-surface'
): React.ReactNode {
  if (!text) return null;
  if (!text.includes('**')) return text;

  const parts = text.split('**');
  if (parts.length === 1) return text;

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i].length > 0) {
        nodes.push(parts[i]);
      }
    } else {
      // Odd index: inside ** ... ** if paired
      if (i + 1 < parts.length) {
        // Paired match
        nodes.push(
          <strong key={`bold-${i}`} className={strongClassName}>
            {parts[i]}
          </strong>
        );
      } else {
        // Unpaired trailing ** - drop marker, keep text as plain
        if (parts[i].length > 0) {
          nodes.push(parts[i]);
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
}) => {
  const rawText = typeof children === 'string' ? children : (text ?? '');
  const rendered = renderRichText(rawText, strongClassName);

  if (className) {
    return <span className={className}>{rendered}</span>;
  }
  return <>{rendered}</>;
};

export default RichText;
