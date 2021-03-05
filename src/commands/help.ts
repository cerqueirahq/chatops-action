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

const getCommandNotFoundText = (name: string) => {
  return `
  The command \`${name}\` doesn't exist. Here's a list of commands available:
  
  ${Object.keys(commands).map(key => {
    // @ts-expect-error FIXME
    const cmd = commands[key].command

    return `* \`${cmd.name}\` -- ${cmd.description}`
  })}

  Comment \`/help [command]\` to get help for a particular command or \`/help\` for general usage.
  `
}

const getGeneralUsageText = () => {
  return `
  Comment an issue or Pull Request with a command prefixed with a slash (i.e. \`/help\`) to run it.

  Commands available:

  ${Object.keys(commands).map(key => {
    // @ts-expect-error FIXME
    const cmd = commands[key].command

    return `* \`${cmd.name}\` -- ${cmd.description}`
  })}
  `
}

export const handler: CommandHandler = async ({args, commentId}) => {
  if (args.length > 0) {
    // @ts-expect-error FIXME
    const cmd = commands[args[0]]?.command

    if (!cmd) {
      await updateComment(commentId, getCommandNotFoundText(args[0]))
      return
    }

    await updateComment(commentId, getUsageTextForCommand(cmd))
  }

  await updateComment(commentId, getGeneralUsageText())
}
