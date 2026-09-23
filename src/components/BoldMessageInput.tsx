import React, { useState } from 'react';
import { Text, TextInput, TextInputProps } from 'react-native';

interface Character { text: string; bold: boolean }

// Mantiene los estilos al insertar o borrar texto en cualquier posición.
export const updateBoldText = (previous: Character[], next: string) => {
  const old = previous.map(char => char.text).join('');
  let start = 0;
  while (start < old.length && start < next.length && old[start] === next[start]) start++;
  let end = 0;
  while (end < old.length - start && end < next.length - start && old[old.length - end - 1] === next[next.length - end - 1]) end++;
  const inserted = next.slice(start, next.length - end).split('').map(text => ({ text, bold: false }));
  let chars = [...previous.slice(0, start), ...inserted, ...previous.slice(old.length - end)];
  let cursor = next.length - end;
  let transformed = false;
  const pattern = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  const matches = [...next.matchAll(pattern)];
  for (const match of matches.reverse()) {
    const index = match.index!;
    const width = match[1] !== undefined ? 2 : 1;
    const content = match[1] ?? match[2];
    chars.splice(index, match[0].length, ...content.split('').map(text => ({ text, bold: true })));
    if (cursor >= index + match[0].length) cursor -= width * 2;
    else if (cursor > index) cursor = Math.max(index, cursor - width);
    transformed = true;
  }
  return { chars, cursor, transformed };
};

const runsFor = (chars: Character[]) => {
  const runs: Character[] = [];
  chars.forEach(char => {
    const last = runs[runs.length - 1];
    if (last && last.bold === char.bold) last.text += char.text;
    else runs.push({ ...char });
  });
  return runs;
};

export const BoldMessageInput = ({ onMessageChange, ...props }: Omit<TextInputProps, 'value' | 'onChangeText' | 'children'> & { onMessageChange: (message: string) => void }) => {
  const [chars, setChars] = useState<Character[]>([]);
  const [selection, setSelection] = useState<{ start: number; end: number }>();
  return (
    <TextInput {...props}
      selection={selection}
      onSelectionChange={() => setSelection(undefined)}
      onChangeText={text => {
        const result = updateBoldText(chars, text);
        setChars(result.chars);
        if (result.transformed) setSelection({ start: result.cursor, end: result.cursor });
        onMessageChange(runsFor(result.chars).map(run => run.bold ? `**${run.text}**` : run.text).join(''));
      }}>
      <Text>{runsFor(chars).map((run, index) => <Text key={index} style={{ fontWeight: run.bold ? '700' : '400' }}>{run.text}</Text>)}</Text>
    </TextInput>
  );
};
