import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploy = actionSlasher.command('deploy', {
  description: 'Deploys the project to the specified environment',
  definition(c) {
    c.arg('env', {
      type: String,
      description: 'The target environment for the deployment'
    })
  },
  async handler(args) {
    if (!chatops.context.isPullRequest) {
      chatops.setFailed(`ChatOps doesn't support deploying from issues yet`)
      return
    }

    let environment = chatops.context.findDefaultEnvironment()

    // @ts-expect-error FIXME
    if (args.env) {
      // @ts-expect-error FIXME
      environment = chatops.context.findEnvironment(args.env)
    }

    if (!environment) {
      chatops.setFailed(
        // @ts-expect-error FIXME
        `The target environment "${args.env}" is not configured.`
      )
      return
    }

    const {repository} = chatops.context

    const activeDeployment = (
      await Promise.all(
        (
          await chatops.octokit.repos.listDeployments({
            ...repository,
            environment: environment.name
          })
        ).data.map(async deployment => {
          const status = (
            await chatops.octokit.repos.listDeploymentStatuses({
              ...repository,
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
      chatops.setFailed(
        `\n${chatops.Icon.Error} A deployment for ${environment.name} environment is already ${activeDeployment.status.state}.

        Wait for its completion before triggering a new deployment to this environment.

        If you want to cancel the active deployment, use the command:

        \`\`\`
        /cancel-deployment --id ${activeDeployment.deployment.id}
        \`\`\`
        `,
        {icon: undefined, shouldUpdateComment: true}
      )

      return
    }

    const deploymentOptions = {
      ...repository,
      ref: await chatops.context.fetchRef(),
      environment: environment.name,
      environment_url: environment.url,
      description: `Triggered in PR #${chatops.context.issueNumber}`
    }

    chatops.debug(`Ref: ${deploymentOptions.ref}`)

    let deployment = await chatops.octokit.repos.createDeployment(
      deploymentOptions
    )

    // Status code === 202 means GitHub performed an auto-merge
    // and we have to attempt creating the deployment again
    if (deployment.status === 202) {
      chatops.info(deployment.data.message || '')

      deployment = await chatops.octokit.repos.createDeployment(
        deploymentOptions
      )
    }

    // When status code is something else than 201, even if it's an
    // auto-merge again, we stop execution
    if (deployment.status !== 201) {
      chatops.setFailed(
        `Could not start a deployment... Endpoint returned ${
          deployment.status
        }: ${JSON.stringify(deployment.data, null, 2)}`
      )

      return
    }

    // Set the status of the deployment to queued as it'll be triggered
    // by another workflow which will start in the same state
    await chatops.octokit.repos.createDeploymentStatus({
      ...repository,
      deployment_id: deployment.data.id,
      state: 'queued'
    })

    await chatops.octokit.repos.createDispatchEvent({
      ...chatops.context.processor,
      event_type: 'chatops-deploy',
      client_payload: {
        ...chatops.context.payload,
        deploymentId: deployment.data.id
      }
    })

    chatops.info(
      `\n${chatops.Icon.Clock} Deployment of \`${deploymentOptions.ref}\` to \`${environment.name}\` has been queued (ID: ${deployment.data.id})...`,
      {icon: undefined, shouldUpdateComment: true}
    )
  }
})
