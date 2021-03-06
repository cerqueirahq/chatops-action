import * as core from '@actions/core'
import * as github from '@actions/github'
import * as actionSlasher from './action-slasher'
import * as commands from './commands'
import * as context from './context'
import * as events from './events'

const run = async (): Promise<void> => {
  core.debug(`Payload: ${JSON.stringify(context.payload, null, 2)}`)
  core.debug(`GitHub Context: ${JSON.stringify(github.context, null, 2)}`)

  actionSlasher.run({commands, events})
}

run()
