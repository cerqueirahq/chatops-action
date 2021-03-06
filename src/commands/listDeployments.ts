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

    const envs = env
      ? [env]
      : chatops.context.environments.map(({name}) => name)

    const deployments = (
      await Promise.all(
        envs.map(
          async e =>
            await Promise.all(
              (
                await chatops.octokit.repos.listDeployments({
                  ...repository,
                  ref,
                  environment: e,
                  per_page: 100
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
                    ? statuses.find(status => status.state === state)
                    : statuses[0]
                }
              })
            )
        )
      )
    ).flat()

    if (deployments.length === 0) {
      chatops.info(`
      _No deployments found for ${
        env ? `environment ${env}` : 'any environment'
      }, reference ${ref} and ${state ? `state ${state}` : 'any state'}._
      
      You can trigger a new deployment with the command:

      \`\`\`
      /deploy --env <${chatops.context.environments
        .map(({name}) => name)
        .join(' | ')}>
      \`\`\`
      `)

      return
    }

    const table = `
    | ID | Environment | Ref | State | Created by |
    | -- | ----------- | --- | ----- | ---------- |
    ${deployments.map(
      ({deployment, status}) =>
        `| [${deployment.id}](${deployment.url}) | ${deployment.environment} | ${deployment.ref} | ${status?.state} | @${deployment.creator?.login} |`
    )}
    `

    chatops.info(table, {
      icon: undefined,
      shouldUpdateComment: true
    })
  }
})
