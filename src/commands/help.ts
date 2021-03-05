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

const getUsageTextForCommand = (cmd: Command): string => {
  return `
  #### Name

  _${cmd.name}_ -- ${cmd.description}

  #### Arguments

  ${cmd.args.map(arg => `* \`${arg.name}\` -- ${arg.description}`).join('\n')}

  #### Usage

  \`/${cmd.name} ${cmd.args.map(arg => `[${arg.name}]`).join(' ')}\`
  `
}

export const handler: CommandHandler = async ({args, commentId}) => {
  if (args.length > 0) {
    // @ts-expect-error FIXME
    const cmd = commands[args[0]].command

    await updateComment(commentId, getUsageTextForCommand(cmd))
  }

  // TODO: general usage
}
