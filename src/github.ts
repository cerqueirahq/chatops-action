import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/core'

export type GitHubDeploymentState =
  | 'queued'
  | 'in_progress'
  | 'error'
  | 'failure'
  | 'inactive'
  | 'pending'
  | 'success'

const octokit = new Octokit({
  auth: core.getInput('token', {required: true})
})

export const updateComment = (commentId: number, body: string) => {
  const {owner, repo} = github.context.repo

  return octokit.request(
    'PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}',
    {
      owner,
      repo,
      body,
      comment_id: commentId
    }
  )
}

export const dispatchRepositoryEvent = (
  owner: string,
  repo: string,
  event: string
) => {
  return octokit.request('POST /repos/{owner}/{repo}/dispatches', {
    owner,
    repo,
    event_type: event
  })
}

export const createDeployment = (
  environment: string,
  ref: string,
  description?: string
) => {
  const {owner, repo} = github.context.repo

  return octokit.request('POST /repos/{owner}/{repo}/deployments', {
    owner,
    repo,
    ref,
    environment,
    description
  })
}

export const setDeploymentState = (
  deploymentId: number,
  state: GitHubDeploymentState,
  targetURL: string,
  environmentURL: string
) => {
  const {owner, repo} = github.context.repo

  return octokit.request(
    'POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses',
    {
      owner,
      repo,
      state,
      target_url: targetURL,
      environment_url: environmentURL,
      deployment_id: deploymentId
    }
  )
}
