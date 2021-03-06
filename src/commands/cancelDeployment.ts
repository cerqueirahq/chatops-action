import * as utils from '../utils'
import * as context from '../context'
import * as actionSlasher from '../action-slasher'
import {octokit} from '../octokit'

export const cancelDeployment = actionSlasher.command('cancel-deployment', {
  description: 'Cancels an active deployment',
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

    const deployment = await octokit.repos.getDeployment({
      ...context.repository,
      deployment_id: deploymentId
    })

    await octokit.repos.createDeploymentStatus({
      ...context.repository,
      deployment_id: deploymentId,
      state: 'error',
      description: 'Deployment cancelled'
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
          `
          ${utils.Icon.BlackCircle} Deployment with ID ${deploymentId} to ${deployment.data.environment} was cancelled...

          If you also want do delete the deployment, use the command:

          \`\`\`
          /delete-deployment --id ${deploymentId}
          \`\`\`
          `
        )
      })
    }
  }
})
