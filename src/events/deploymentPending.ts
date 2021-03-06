import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentPending = actionSlasher.event('deployment-pending', {
  description: 'An event triggered when a deployment is pending',
  async handler() {
    const {repository, deploymentId} = chatops.context

    if (!deploymentId) {
      chatops.setFailed('No deployment ID available...')
      return
    }

    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deploymentId,
      state: 'pending'
    })

    chatops.info('Deployment starting soon...', {
      icon: chatops.Icon.HourGlass,
      shouldUpdateComment: true
    })
  }
})
