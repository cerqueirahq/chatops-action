import * as core from '@actions/core'
import * as actionSlasher from './action-slasher'
import * as commands from './commands'
import * as chatops from './chatops'
import * as events from './events'

const run = async (): Promise<void> => {
  core.debug(`Payload: ${JSON.stringify(chatops.context.payload, null, 2)}`)

  try {
    actionSlasher.run({commands, events})
  } catch (error) {
    core.setFailed(error.message || error)
  }
}

run()
