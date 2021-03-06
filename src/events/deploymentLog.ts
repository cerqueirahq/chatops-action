import * as actionSlasher from '../action-slasher'
import * as context from '../context'
import {octokit} from '../octokit'
import * as utils from '../utils'

export const deploymentLog = actionSlasher.event('deployment-log', {
  description: 'An event triggered when a deployment has emitted some log',
  async handler() {
    const comment = await octokit.issues.getComment({
      ...context.repository,
      comment_id: context.commentId
    })

    await octokit.issues.updateComment({
      ...context.repository,
      comment_id: context.commentId,
      body: utils.appendBody(
        comment.data.body || '',
        `${utils.Icon.Info} ${context.log}`
      )
    })
  }
})
