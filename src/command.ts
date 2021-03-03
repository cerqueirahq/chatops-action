import * as core from '@actions/core'
import {Config} from './config'

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
}

export const getCommandContextFromString = (
  str: string
): CommandContext | undefined => {
  const firstLine = str.split(/\r?\n/)[0].trim()

  if (firstLine.length < 2 || firstLine.charAt(0) != '/') {
    console.debug('The first line of the comment is not a valid slash command.')

    return
  }

  const [command, ...args] = firstLine.split(' ')

  return {name: command.replace('/', ''), args}
}

export const handleCommand = (context: CommandContext, _config: Config) => {
  core.debug(`Handling ${context.name}`)
}
