export function parseAiJson<T>(raw: string): T {
  const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
  const match = clean.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[1]) as T;
}
