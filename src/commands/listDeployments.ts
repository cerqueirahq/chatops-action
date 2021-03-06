import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

const query = `
query ListRepositoryDeployments($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    deployments(last: 100) {
      nodes {
        id
        ref {
            name
        }
        environment
        state
        creator {
          login
        }
      }
    }
  }
}
`

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

    // const envs = env
    //  ? [env]
    //  : chatops.context.environments.map(({name}) => name)

    const {
      repository: {
        deployments: {nodes: deployments}
      }
    } = await chatops.octokit.graphql(query, {...repository})

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
    ${deployments
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (deployment: any) =>
          `| ${deployment.id} | ${deployment.environment} | ${deployment.ref.name} | ${deployment.state} | @${deployment.creator?.login} |`
      )
      .join('\n')}
    `

    chatops.info(table, {
      icon: undefined,
      shouldUpdateComment: true
    })
  }
})
