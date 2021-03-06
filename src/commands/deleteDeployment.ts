import * as utils from '../utils'
import * as context from '../context'
import * as actionSlasher from '../action-slasher'
import {octokit} from '../octokit'

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
    if (!args.id) {
      throw new Error('No deployment ID specified')
    }

    // @ts-expect-error FIXME
    const deploymentId = args.id

    await octokit.repos.deleteDeployment({
      ...context.repository,
      deployment_id: deploymentId
    })

    if (context.commentId) {
      const comment = await octokit.issues.getComment({
        ...context.repository,
        comment_id: context.commentId
      })

      await octokit.issues.updateComment({
        ...context.repository,
        comment_id: context.commentId,
        body: utils.appendBody(
          comment.data.body || '',
          `${utils.Icon.BlackCircle} Deployment with ID ${deploymentId} has been deleted...`
        )
      })
    }
  }
})
