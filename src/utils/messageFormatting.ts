export const parseMessage = (text: string): { text: string; bold: boolean }[] => {
  const parts: { text: string; bold: boolean }[] = [];
  const pattern = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  let offset = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index), bold: false });
    parts.push({ text: match[1] ?? match[2], bold: true });
    offset = pattern.lastIndex;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset), bold: false });
  return parts;
};
