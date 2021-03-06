export interface EventOptions {
  description?: string
  handler(): Promise<void> | void
}

export class Event implements Event {
  name: string
  description?: string
  handler: EventOptions['handler']

  constructor(name: string, options: EventOptions) {
    this.name = name
    this.description = options.description

    // FIXME
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.handler = options.handler
  }

  match(str: string): boolean {
    return this.name === str
  }
}

export function event(name: string, options: EventOptions): Event {
  return new Event(name, options)
}
