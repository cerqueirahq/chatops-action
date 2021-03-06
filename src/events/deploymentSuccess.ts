import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentSuccess = actionSlasher.event('deployment-success', {
  description: 'An event triggered when a deployment is successful',
  async handler() {
    const {repository, deploymentId} = chatops.context

    if (!deploymentId) {
      chatops.setFailed('No deployment ID available...')
      return
    }

    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deploymentId,
      state: 'success'
    })

    chatops.info('Deployment finished with success!', {
      icon: chatops.Icon.Check,
      shouldUpdateComment: true
    })
  }
})
