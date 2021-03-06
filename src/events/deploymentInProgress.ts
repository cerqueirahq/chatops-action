import * as actionSlasher from '../action-slasher'
import * as context from '../context'
import {octokit} from '../octokit'
import * as utils from '../utils'

export const deploymentInProgress = actionSlasher.event(
  'deployment-in-progress',
  {
    description: 'An event triggered when a deployment is in progress',
    async handler() {
      const comment = await octokit.issues.getComment({
        ...context.repository,
        comment_id: context.commentId
      })

      await octokit.repos.createDeploymentStatus({
        ...context.repository,
        deployment_id: context.deploymentId,
        state: 'in_progress'
      })

      await octokit.issues.updateComment({
        ...context.repository,
        comment_id: context.commentId,
        body: utils.appendBody(
          comment.data.body || '',
          `${utils.Icon.Rocket} Deployment in progress...`
        )
      })
    }
  }
)
