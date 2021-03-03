import * as core from '@actions/core'
import {Config} from './config'
import {Context} from './context'

export class EventHandlingError extends Error {
  constructor(event: EventName, message: string) {
    super(`Error handling event ${event}: ${message}`)
  }
}

export interface EventHandler {
  (event: Event, config: Config): void
}

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

export const handleEvent = (config: Config) => {
  const {event} = config

  if (!event) {
    return
  }

  core.debug(
    `Handling event "${event.name} with context: ${JSON.stringify(
      event.context,
      null,
      2
    )}"`
  )

  switch (event.name) {
    case EventName.DeploymentError:
      handleDeploymentError(event, config)
      break

    case EventName.DeploymentFailure:
      handleDeploymentFailure(event, config)
      break

    case EventName.DeploymentPending:
      handleDeploymentPending(event, config)
      break

    case EventName.DeploymentInProgress:
      handleDeploymentInProgress(event, config)
      break

    case EventName.DeploymentQueued:
      handleDeploymentQueued(event, config)
      break

    case EventName.DeploymentSuccess:
      handleDeploymentSuccess(event, config)
      break
  }

  throw new Error(`Unhandled event ${event.name}`)
}

export const handleDeploymentError: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentError}`)
}

export const handleDeploymentFailure: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentFailure}`)
}

export const handleDeploymentPending: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentPending}`)
}

export const handleDeploymentInProgress: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentInProgress}`)
}

export const handleDeploymentQueued: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentQueued}`)
}

export const handleDeploymentSuccess: EventHandler = event => {
  if (!event.context.deploymentId) {
    throw new EventHandlingError(event.name, 'no deployment ID in context')
  }

  core.debug(`Handling ${EventName.DeploymentSuccess}`)
}
