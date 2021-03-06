import * as actionSlasher from '../action-slasher'
import * as context from '../context'
import {octokit} from '../octokit'
import * as utils from '../utils'

export const deploymentError = actionSlasher.event('deployment-error', {
  description: 'An event triggered when a deployment has an error',
  async handler() {
    const comment = await octokit.issues.getComment({
      ...context.repository,
      comment_id: context.commentId
    })

    await octokit.repos.createDeploymentStatus({
      ...context.repository,
      deployment_id: context.deploymentId,
      state: 'error'
    })

    await octokit.issues.updateComment({
      ...context.repository,
      comment_id: context.commentId,
      body: utils.appendBody(
        comment.data.body || '',
        `${utils.Icon.Error} There was an error with the deployment... ${utils.Icon.Cry}`
      )
    })
  }
})
