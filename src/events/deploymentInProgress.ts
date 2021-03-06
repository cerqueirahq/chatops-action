import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentInProgress = actionSlasher.event(
  'deployment-in-progress',
  {
    description: 'An event triggered when a deployment is in progress',
    async handler() {
      const {repository, deploymentId} = chatops.context

      if (!deploymentId) {
        chatops.setFailed('No deployment ID available...')
        return
      }

      await chatops.octokit.repos.createDeploymentStatus({
        ...repository,
        deployment_id: deploymentId,
        state: 'in_progress'
      })

      chatops.info('Deployment in progress...', {
        icon: chatops.Icon.Rocket,
        shouldUpdateComment: true
      })
    }
  }
)
