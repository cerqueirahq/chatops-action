import * as core from '@actions/core'
import {Config} from './config'
import * as commands from './commands'

export interface Command {
  name: string
  description: string
  args: CommandArg[]
}

export interface CommandArg {
  name: string
  description: string
}

export interface CommandContext {
  name: string
  args: string[]
  commentId: number
}

export interface CommandHandler {
  (commandContext: CommandContext, config: Config): void
}

export const getCommandContextFromString = (
  commentId: number,
  str: string
): CommandContext | undefined => {
  const firstLine = str.split(/\r?\n/)[0].trim()

  if (firstLine.length < 2 || firstLine.charAt(0) != '/') {
    core.debug('The first line of the comment is not a valid slash command.')

    return
  }

  const [command, ...args] = firstLine.split(' ')

  if (args[0] === 'help') {
    return {name: 'help', args: [command.replace('/', '')], commentId}
  }

  return {name: command.replace('/', ''), args, commentId}
}

export const handleCommand: CommandHandler = (context, config) => {
  core.debug(
    `Handling command ${context.name} with arguments: ${JSON.stringify(
      context.args
    )}`
  )

  // FIXME: avoid having type errors
  // @ts-expect-error
  commands[context.name].handler(context, config)
}
