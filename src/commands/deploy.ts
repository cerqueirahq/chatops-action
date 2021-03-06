import * as utils from '../utils'
import * as context from '../context'
import * as actionSlasher from '../action-slasher'
import {octokit} from '../octokit'

export const deploy = actionSlasher.command('deploy', {
  description: 'Deploys the project to the specified environment',
  definition(c) {
    c.arg('env', {
      type: String,
      description: 'The target environment for the deployment'
    })
  },
  async handler(args) {
    if (!context.isPullRequest) {
      throw new Error(`ChatOps doesn't support deploying from issues yet`)
    }

    let environment = context.findDefaultEnvironment()

    // @ts-expect-error FIXME
    if (args.env) {
      // @ts-expect-error FIXME
      environment = context.findEnvironment(args.env)
    }

    if (!environment) {
      // @ts-expect-error FIXME
      throw new Error(`The target environment "${args.env}" is not configured.`)
    }

    const activeDeployment = (
      await Promise.all(
        (
          await octokit.repos.listDeployments({
            ...context.repository,
            environment: environment.name
          })
        ).data.map(async deployment => {
          const status = (
            await octokit.repos.listDeploymentStatuses({
              ...context.repository,
              deployment_id: deployment.id
            })
          ).data[0]

          return {
            deployment,
            status,
            active: ['queued', 'pending', 'in_progress'].includes(status.state)
          }
        })
      )
    ).find(({active}) => active)

    if (activeDeployment) {
      const errorMessage = utils.appendBody(
        context.commentBody,
        `\n${utils.Icon.Error} A deployment for ${environment.name} environment is already ${activeDeployment.status.state}.
        
        Wait for its completion before triggering a new deployment to this environment.

        If you want to cancel the active deployment, use the command:

        \`\`\`
        /cancel-deployment --id ${activeDeployment.deployment.id}
        \`\`\`
        `
      )

      await octokit.issues.updateComment({
        ...context.repository,
        comment_id: context.commentId,
        body: errorMessage
      })

      throw new Error(errorMessage)
    }

    const deploymentOptions = {
      ...context.repository,
      ref: context.ref,
      environment: environment.name,
      environment_url: environment.url,
      description: `Triggered in PR #${context.issueNumber}`
    }

    let deployment = await octokit.repos.createDeployment(deploymentOptions)

    // Status code === 202 means GitHub performed an auto-merge
    // and we have to attempt creating the deployment again
    if (deployment.status === 202) {
      deployment = await octokit.repos.createDeployment(deploymentOptions)
    }

    // When status code is something else than 201, even if it's an
    // auto-merge again, we stop execution
    if (deployment.status !== 201) {
      throw new Error(
        `Could not start a deployment... Endpoint returned ${
          deployment.status
        }: ${JSON.stringify(deployment.data, null, 2)}`
      )
    }

    // Set the status of the deployment to queued as it'll be triggered
    // by another workflow which will start in the same state
    await octokit.repos.createDeploymentStatus({
      ...context.repository,
      deployment_id: deployment.data.id,
      state: 'queued'
    })

    const eventPayload = {
      ...context.payload,
      deploymentId: deployment.data.id
    }

    await octokit.repos.createDispatchEvent({
      ...context.processor,
      event_type: 'chatops-deploy',
      client_payload: eventPayload
    })

    if (context.commentId) {
      await octokit.issues.updateComment({
        ...context.repository,
        comment_id: context.commentId,
        body: utils.appendBody(
          context.commentBody,
          `\n${utils.Icon.Clock} Deployment of \`${context.ref}\` to \`${environment.name}\` has been queued (ID: ${deployment.data.id})...`
        )
      })
    }
  }
})
