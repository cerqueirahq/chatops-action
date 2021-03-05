import * as core from '@actions/core'
import * as github from '@actions/github'
import {getCommandContextFromString, handleCommand} from './command'
import {getConfigFromInputs} from './config'
import {handleEvent} from './event'
import {updateComment} from './github'

async function run(): Promise<void> {
  const config = getConfigFromInputs()
  const commentId = github.context?.payload.comment?.id!

  core.debug(`Using configuration: ${JSON.stringify(config, null, 2)}`)

  try {
    if (config.event) {
      handleEvent(config)

      return
    }

    const commentBody: string = github.context.payload.comment?.body!

    core.debug(`Comment ${commentId}: ${commentBody}`)

    const commandContext = getCommandContextFromString(commentId, commentBody)

    if (!commandContext) {
      core.debug('Neither a command or an event was detected... Skipping')
      return
    }

    handleCommand(commandContext, config)

    core.debug('Hello, ChatOps!')
  } catch (error) {
    if (commentId) {
      await updateComment(commentId, error.message)
    }

    core.setFailed(error.message)
  }
}

run()
