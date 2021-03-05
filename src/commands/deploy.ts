import * as github from '@actions/github'
import {Command, CommandHandler} from '../command'
import {
  createDeployment,
  dispatchRepositoryEvent,
  setDeploymentState,
  updateComment
} from '../github'

export const command: Command = {
  name: 'deploy',
  description: 'Deploys the project to the specified environment',
  args: [
    {
      name: 'env',
      description: 'The environment to deploy the project to'
    }
  ]
}

export const handler: CommandHandler = async (
  {args, commentId},
  {environments, processor}
) => {
  const environment = environments.find(
    env => env.id === args[0] || env.name === args[0]
  )

  if (!environment) {
    throw new Error(`The target environment "${args[0]}" is not configured.`)
  }

  const ref = github.context.payload.pull_request?.head.ref

  const deployment = await createDeployment(
    environment.name,
    ref,
    `Triggered in PR #${github.context.payload.pull_request?.number}`
  )

  // @ts-expect-error FIXME: figure out why `id` is not on data type
  const deploymentId = deployment.data.id

  const [processorOwner, processorRepository] = processor.split('/')

  await dispatchRepositoryEvent(
    processorOwner,
    processorRepository,
    'chatops-deploy',
    {issueId: github.context.issue.number, commentId, deploymentId}
  )

  await setDeploymentState(deploymentId, 'pending', '', environment.url!)

  await updateComment(
    commentId,
    `:clock1 Deployment of \`${ref}\` to \`${environment.name}\` has been queued...`
  )
}
