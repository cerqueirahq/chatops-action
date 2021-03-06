import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'

export interface Environment {
  id: string
  url?: string
  name: string
  description: string
  default: boolean
}

export interface Repository {
  owner: string
  repo: string
}

export class Context {
  issueNumber: number
  commentId?: number
  deploymentId?: number
  repository: Repository
  project: string
  message: string
  isPullRequest: boolean
  environments: Environment[]
  payload: typeof github.context

  private _octokit: InstanceType<typeof GitHub>

  constructor(octokit: InstanceType<typeof GitHub>) {
    this.payload = this.inputFromJSON('payload', github.context)
    this.environments = this.inputFromJSON('environments', [], {required: true})

    // @ts-expect-error FIXME: prop doesn't exist on GitHub context but will on event payload
    this.deploymentId = this.payload.deploymentId

    this.issueNumber = this.payload.issue.number
    this.commentId = this.payload.payload.comment?.id
    this.repository = this.payload.repo
    this.message = core.getInput('message')
    this.isPullRequest = 'pull_request' in this.payload.issue

    this.project =
      core.getInput('project') ||
      `${this.repository.owner}/${this.repository.repo}`

    this._octokit = octokit
  }

  get processor(): Repository {
    const [processorOwner, processorRepo] = core
      .getInput('processor')
      .split('/')

    if (!processorOwner || !processorRepo) {
      return this.repository
    }

    return {owner: processorOwner, repo: processorRepo}
  }

  async fetchRef(): Promise<string> {
    const input = core.getInput('ref')

    if (input) {
      return input
    }

    if (this.isPullRequest) {
      const pr = await this._octokit.pulls.get({
        ...this.repository,
        pull_number: this.issueNumber
      })

      return pr.data.head.ref
    }

    return github.context.ref
  }

  findEnvironment(idOrName: string): Environment | undefined {
    return this.environments.find(
      env => env.id === idOrName || env.name === idOrName
    )
  }

  findDefaultEnvironment(): Environment | undefined {
    return this.environments.find(env => env.default)
  }

  private inputFromJSON<T>(
    name: string,
    fallback: T,
    options?: core.InputOptions
  ): T {
    const input = core.getInput(name, options)

    if (!input) {
      return fallback
    }

    return JSON.parse(input) as T
  }
}
