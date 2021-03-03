import * as core from '@actions/core'
import * as github from '@actions/github'
import {getCommandContextFromString, handleCommand} from './command'
import {getConfigFromInputs} from './config'
import {handleEvent} from './event'

async function run(): Promise<void> {
  try {
    const config = getConfigFromInputs()

    core.debug(`Using configuration: ${JSON.stringify(config, null, 2)}`)

    if (config.event) {
      handleEvent(config)

      return
    }

    const commentId = github.context?.payload.comment?.id
    const commentBody: string = github.context.payload.comment?.body

    core.debug(`Comment ${commentId}: ${commentBody}`)

    const commandContext = getCommandContextFromString(commentBody)

    if (!commandContext) {
      core.debug('Neither a command or an event was detected... Skipping')
      return
    }

    handleCommand(commandContext, config)

    core.debug('Hello, ChatOps!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
