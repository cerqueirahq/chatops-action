export enum Icon {
  Clock = '🕐',
  Rocket = '🚀',
  ArrowRight = '➡️',
  Check = '✅',
  HourGlass = '⏳',
  FastForward = '⏩',
  Cry = '😢',
  Error = '❌',
  BlackCircle = '⚫',
  Info = 'ℹ️'
}

export const trimBody = (body: string): string =>
  body
    .split('\n')
    .map(l => l.trimStart())
    .join('\n')

export const appendBody = (original: string, body: string): string =>
  trimBody(`${original}\n${body}`)
