import * as core from '@actions/core'
import * as github from '@actions/github'
import * as command from './command'
import * as event from './event'
import * as help from './help'

export function run({
  commands,
  events
}: {
  commands: command.Command[] | {[key: string]: command.Command}
  events?: event.Event[] | {[key: string]: event.Event}
}): Promise<void> | void {
  if (github.context.eventName === 'repository_dispatch') {
    if (!events) {
      return
    }

    const eventsList = ('length' in events
      ? events
      : Object.keys(events).map(key => events[key])) as event.Event[]

    for (const evt of eventsList) {
      if (evt.match(core.getInput('event', {required: true}))) {
        evt.handler()

        return
      }
    }

    return
  }

  let commandsList = ('length' in commands
    ? commands
    : Object.keys(commands).map(key => commands[key])) as command.Command[]

  const helpCommand = help.buildHelpCommand(commandsList)

  // Inject help command to the list
  commandsList.push(helpCommand)

  // Inject help arg in all commands
  commandsList = commandsList.map(cmd => {
    cmd.arg('help', {
      type: Boolean,
      description: `Shows usage information for \`${cmd.name}\` command`
    })

    return cmd
  })

  const commentBody = github.context.payload.comment?.body

  if (!commentBody) {
    return
  }

  const commentFirstLine = commentBody.split(/\r?\n/)[0].trim()

  if (commentFirstLine.length < 2 || commentFirstLine.charAt(0) !== '/') {
    return
  }

  for (const cmd of commandsList) {
    const args = cmd.match(commentFirstLine.replace('/', ''))

    if (!args) {
      continue
    }

    // @ts-expect-error FIXME
    if (args.help) {
      helpCommand.handler({cmd: cmd.name})

      return
    }

    try {
      cmd.handler(args)
    } catch (err) {
      core.error(`Error caught in ActionSlasher: ${err.message}`)
      core.setFailed(err.message)
    }

    return
  }

  // If no command has matched, display help information
  helpCommand.handler({cmd: commentFirstLine.split(' ')[0]})
}
