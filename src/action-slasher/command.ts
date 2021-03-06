import arg from 'arg'

export interface CommandOptions {
  description?: string
  definition?(c: Command): void
  handler(args: unknown): Promise<void> | void
}

export interface CommandArg {
  name: string
  type: CommandArgType
  description?: string
}

export interface CommandArgOptions {
  type: CommandArgType
  description?: string
}

export type CommandArgType = string | arg.Handler | [arg.Handler]

export class Command implements Command {
  name: string
  description?: string
  args: {[key: string]: CommandArg}
  handler: CommandOptions['handler']

  constructor(name: string, options: CommandOptions) {
    this.name = name
    this.description = options.description
    this.args = {}

    // FIXME
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.handler = options.handler
  }

  arg(name: string, options: CommandArgOptions): void {
    this.args[name] = {
      name,
      type: options.type,
      description: options.description
    }
  }

  match(str: string): unknown | undefined {
    const argv = str.match(/(?:[^\s"]+|"[^"]*")+/g) || []

    if (argv[0] !== this.name) {
      return
    }

    const args = arg(this.argSpec, {argv})

    return Object.keys(args)
      .filter(a => a !== '_')
      .reduce(
        (normalizedArgs, argFlag) => ({
          ...normalizedArgs,
          [`${argFlag.replace('--', '')}`]: args[argFlag]
        }),
        {}
      )
  }

  private get argSpec(): arg.Spec {
    return Object.keys(this.args).reduce(
      (spec, argName) => ({...spec, [`--${argName}`]: this.args[argName].type}),
      {}
    )
  }
}

export function command(name: string, options: CommandOptions): Command {
  const cmd = new Command(name, options)

  if (options.definition) {
    options.definition(cmd)
  }

  return cmd
}
