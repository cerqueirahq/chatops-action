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

  const deployment = await createDeployment(
    environment.name,
    github.context.ref,
    ''
  )

  const [processorOwner, processorRepository] = processor.split('/')

  await dispatchRepositoryEvent(
    processorOwner,
    processorRepository,
    'chatops-deploy'
  )

  // @ts-expect-error FIXME: figure out why `id` is not on data type
  await setDeploymentState(deployment.data.id, 'queued', '', environment.url!)

  await updateComment(
    commentId,
    `:clock1 Deployment of \`${github.context.ref}\` to \`${environment.name}\` has been queued...`
  )
}
