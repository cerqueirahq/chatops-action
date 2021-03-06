import * as core from '@actions/core'
import * as github from '@actions/github'

export interface Environment {
  id: string
  url?: string
  name: string
  description: string
  default: boolean
}

const [processorOwner, processorRepo] = (
  core.getInput('processor') ||
  `${github.context.repo.owner}/${github.context.repo.repo}`
).split('/')

const eventPayload = JSON.parse(core.getInput('payload') || '{}')

const environmentsInput = JSON.parse(core.getInput('environments') || '[]')

export const environments: Environment[] =
  environmentsInput.length > 0
    ? environmentsInput
    : [
        {
          id: 'prd',
          name: 'production',
          default: false,
          description: 'The live, production environment'
        },
        {
          id: 'stg',
          name: 'staging',
          default: false,
          description: 'The staging environment'
        },
        {
          id: 'tst',
          name: 'test',
          default: false,
          description: 'The testing environment'
        },
        {
          id: 'dev',
          name: 'development',
          default: true,
          description: 'The development environment'
        }
      ]

export const findEnvironment = (idOrName: string): Environment | undefined =>
  environments.find(env => env.id === idOrName || env.name === idOrName)

export const findDefaultEnvironment = (): Environment | undefined =>
  environments.find(env => env.default)

export const payload = eventPayload
  ? {...github.context.payload, ...eventPayload}
  : github.context.payload

export const isPullRequest = !!payload.pull_request

export const issueNumber = payload.issue?.number

export const commentId = payload.comment?.id

export const commentBody = payload.comment?.body

export const ref = payload.pull_request?.head.ref

export const repository = payload.repo || github.context.repo

export const processor = {owner: processorOwner, repo: processorRepo}

export const deploymentId = payload.deploymentId

export const log = core.getInput('log')
