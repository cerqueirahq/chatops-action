import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentFailure = actionSlasher.event('deployment-failure', {
  description: 'An event triggered when a deployment has failed',
  async handler() {
    const {repository, deploymentId} = chatops.context

    if (!deploymentId) {
      chatops.setFailed('No deployment ID available...')
      return
    }

    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deploymentId,
      state: 'failure'
    })

    chatops.error(`Deployment failed... ${chatops.Icon.Cry}`, {
      icon: chatops.Icon.Rocket,
      shouldUpdateComment: true
    })
  }
})
