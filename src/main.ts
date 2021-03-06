import * as core from '@actions/core'
import * as actionSlasher from './action-slasher'
import * as commands from './commands'
import * as chatops from './chatops'
import * as events from './events'

const run = async (): Promise<void> => {
  core.debug(`Payload: ${JSON.stringify(chatops.context.payload, null, 2)}`)
  core.debug(`Project: ${chatops.context.project}`)
  core.debug(
    `Repository: ${JSON.stringify(chatops.context.repository, null, 2)}`
  )
  core.debug(`Comment ID: ${chatops.context.commentId}`)
  core.debug(`Deployment ID: ${chatops.context.deploymentId}`)
  core.debug(
    `Issue Number: ${chatops.context.issueNumber} (pr? ${chatops.context.isPullRequest})`
  )

  try {
    await actionSlasher.run({commands, events})
  } catch (error) {
    core.setFailed(error.message || error)
  }
}

run()
