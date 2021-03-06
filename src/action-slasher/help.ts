import * as github from '@actions/github'
import * as octokit from './octokit'
import {Command, command} from './command'

const getArgumentsList = (cmd: Command): string =>
  Object.keys(cmd.args)
    .map(argName => {
      const arg = cmd.args[argName]

      return `* \`--${arg.name}\` -- ${arg.description}`
    })
    .join('\n')

const getCommandUsageText = (cmd: Command): string => {
  return `
  #### Name

  _${cmd.name}_ -- ${cmd.description}

  #### Arguments

  ${getArgumentsList(cmd)}
  `
}

const getCommandNotFoundText = (
  name: string,
  availableCommands: Command[]
): string => {
  return `
  The command \`${name}\` doesn't exist. Here's a list of commands available:
  
  ${availableCommands
    .map(cmd => `* \`${cmd.name}\` -- ${cmd.description}`)
    .join('\n')}

  Comment \`/help [command]\` to get help for a particular command or \`/help\` for general usage.
  `
}

const getGeneralUsageText = (availableCommands: Command[]): string => {
  return `
  Comment an issue or Pull Request with a command prefixed with a slash (i.e. \`/help\`) to run it.

  #### Commands available:

  ${availableCommands
    .map(cmd => `* \`${cmd.name}\` -- ${cmd.description}`)
    .join('\n')}
  `
}

export const buildHelpCommand = (commands: Command[]): Command =>
  command('help', {
    description: 'Displays usage information and commands available',
    definition(c) {
      c.arg('cmd', {
        type: String,
        description: 'A command to get information about'
      })
    },
    async handler(args) {
      if (!github.context.payload.comment?.id) {
        return
      }

      const updateCommentOptions = {
        ...github.context.repo,
        comment_id: github.context.payload.comment.id,
        body: ''
      }

      // @ts-expect-error FIXME
      if (args.cmd) {
        // @ts-expect-error FIXME
        const cmd = commands.find(c => c.name === args.cmd)

        updateCommentOptions.body = cmd
          ? getCommandUsageText(cmd)
          : // @ts-expect-error FIXME
            getCommandNotFoundText(args.cmd, commands)
      } else {
        updateCommentOptions.body = getGeneralUsageText(commands)
      }

      await octokit.octokit.issues.updateComment(updateCommentOptions)
    }
  })
