import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const cancelDeployment = actionSlasher.command('cancel-deployment', {
  description: 'Cancels an active deployment',
  definition(c) {
    c.arg('id', {
      type: String,
      description: 'The ID of the deployment'
    })
  },
  async handler(args) {
    // @ts-expect-error FIXME
    const deploymentId = args.id

    if (!deploymentId) {
      chatops.setFailed('You did not provide any deployment ID...')
      return
    }

    const {repository} = chatops.context

    const deployment = await chatops.octokit.repos.getDeployment({
      ...repository,
      deployment_id: deploymentId
    })

    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deploymentId,
      state: 'error',
      description: 'Deployment cancelled'
    })

    chatops.info(
      `
        ${chatops.Icon.BlackCircle} Deployment with ID ${deploymentId} to ${deployment.data.environment} was cancelled...

        If you also want do delete the deployment, use the command:

        \`\`\`
        /delete-deployment --id ${deploymentId}
        \`\`\`
      `,
      {icon: undefined, shouldUpdateComment: true}
    )
  }
})
