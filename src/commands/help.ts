import * as core from '@actions/core'
import {Command, CommandHandler} from '../command'
import {updateComment} from '../github'
import * as commands from './'

export const command: Command = {
  name: 'help',
  description: 'Displays usage information and commands',
  args: [
    {
      name: 'command',
      description: 'A command to get information about'
    }
  ]
}

const getUsageTextForCommand = (cmd: Command) => {
  return `
  #### Name

    ${cmd.name} -- ${cmd.description}

  ### Arguments

    ${cmd.args.map(arg => `* ${arg.name} -- ${arg.description}`).join('\n')}

  #### Usage

    \`/${cmd.name} ${cmd.args.map(arg => `[${arg.name}]`).join(' ')}\`
  `
}

export const handleHelpCommand: CommandHandler = async ({args, commentId}) => {
  if (args.length > 0) {
    // @ts-expect-error
    const cmd = commands[args[0]]

    await updateComment(commentId, getUsageTextForCommand(cmd))
  }

  // TODO: general usage
}
