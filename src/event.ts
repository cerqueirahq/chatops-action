import * as core from '@actions/core'
import {Context} from './context'

export interface Event {
  name: EventName
  context: Context
}

export enum EventName {
  DeploymentError = 'deployment-error',
  DeploymentFailure = 'deployment-failure',
  DeploymentPending = 'deployment-pending',
  DeploymentInProgress = 'deployment-in-progress',
  DeploymentQueued = 'deployment-queued',
  DeploymentSuccess = 'deployment-success'
}

export const getEventFromInputs = (): Event | undefined => {
  const name = core.getInput('event', {required: false}) as EventName
  const context = JSON.parse(
    core.getInput('context', {required: false}) || '{}'
  )

  if (!name) {
    return
  }

  if (!Object.values(EventName).includes(name)) {
    throw new Error(`Unknown event provided ${name}`)
  }

  return {name, context}
}
