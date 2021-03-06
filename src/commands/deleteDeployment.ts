import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deleteDeployment = actionSlasher.command('delete-deployment', {
  description: 'Deletes a deployment',
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

    await chatops.octokit.repos.deleteDeployment({
      ...repository,
      deployment_id: deploymentId
    })

    chatops.info(`Deployment with ID ${deploymentId} has been deleted...`, {
      icon: chatops.Icon.BlackCircle,
      shouldUpdateComment: true
    })
  }
})
