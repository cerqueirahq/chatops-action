import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const listDeployments = actionSlasher.command('list-deployments', {
  description: 'Lists all deployments for a specific reference',
  definition(c) {
    c.arg('ref', {
      type: String,
      description: 'The reference of the deployment'
    })

    c.arg('env', {
      type: String,
      description: 'Only list deployments for this environment'
    })

    c.arg('state', {
      type: String,
      description: 'Only list deployments in this state'
    })
  },
  async handler(args) {
    // @ts-expect-error FIXME
    const ref = args.ref || (await chatops.context.fetchRef())

    // @ts-expect-error FIXME
    const {env, state} = args

    const {repository} = chatops.context

    const deployments = await Promise.all(
      (
        await chatops.octokit.repos.listDeployments({
          ...repository,
          ref,
          environment: env
        })
      ).data.map(async deployment => {
        const statuses = (
          await chatops.octokit.repos.listDeploymentStatuses({
            ...repository,
            deployment_id: deployment.id
          })
        ).data

        return {
          deployment,
          status: state
            ? statuses[0]
            : statuses.find(status => status.state === state)
        }
      })
    )

    const table = `
    | ID | Environment | State | URL |
    | -- | ----------- | ----- | --- |
    ${deployments.map(
      ({deployment, status}) =>
        `| ${deployment.id} | ${deployment.environment} | ${status?.state} | ${deployment.url} |`
    )}
    `

    chatops.info(table, {
      icon: undefined,
      shouldUpdateComment: true
    })
  }
})