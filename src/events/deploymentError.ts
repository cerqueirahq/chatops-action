import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentError = actionSlasher.event('deployment-error', {
  description: 'An event triggered when a deployment has an error',
  async handler() {
    const {repository, deploymentId} = chatops.context

    if (!deploymentId) {
      chatops.setFailed('No deployment ID available...')
      return
    }

    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deploymentId,
      state: 'error'
    })

    chatops.error(
      `There was an error with the deployment... ${chatops.Icon.Cry}`
    )
  }
})
