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

export interface Payload {
  environments: Environment[]
  project: string
  processor: Repository
  repository: Repository
  issueNumber: number
  commentId?: number
  deploymentId?: number
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
  payload: Payload

  private _octokit: InstanceType<typeof GitHub>

  constructor(octokit: InstanceType<typeof GitHub>) {
    const {repo} = github.context

    this.payload = this.inputFromJSON('payload', {
      environments: this.inputFromJSON('environments', [], {
        required: false
      }),
      issueNumber: github.context.issue.number,
      commentId: github.context.payload.comment?.id,
      repository: repo,
      processor: this.processor,
      project: core.getInput('project') || `${repo.owner}/${repo.repo}`
    })

    this.environments = this.payload.environments
    this.project = this.payload.project
    this.repository = this.payload.repository
    this.deploymentId = this.payload.deploymentId
    this.issueNumber = this.payload.issueNumber
    this.commentId = this.payload.commentId

    this.message = core.getInput('message')

    this.isPullRequest = !!github.context.payload.issue?.pull_request

    this._octokit = octokit
  }

  get processor(): Repository {
    const [processorOwner, processorRepo] = core
      .getInput('processor')
      .split('/')

    if (!processorOwner || !processorRepo) {
      return github.context.repo
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
    return JSON.parse(core.getInput(name, options) || JSON.stringify(fallback))
  }
}
