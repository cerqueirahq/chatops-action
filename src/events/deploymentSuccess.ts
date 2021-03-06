import * as actionSlasher from '../action-slasher'
import * as context from '../context'
import {octokit} from '../octokit'
import * as utils from '../utils'

export const deploymentSuccess = actionSlasher.event('deployment-success', {
  description: 'An event triggered when a deployment is successful',
  async handler() {
    const comment = await octokit.issues.getComment({
      ...context.repository,
      comment_id: context.commentId
    })

    await octokit.repos.createDeploymentStatus({
      ...context.repository,
      deployment_id: context.deploymentId,
      state: 'success'
    })

    await octokit.issues.updateComment({
      ...context.repository,
      comment_id: context.commentId,
      body: utils.appendBody(
        comment.data.body || '',
        `${utils.Icon.Check} Deployment finished with success!`
      )
    })
  }
})
