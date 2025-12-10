export function parseMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
}