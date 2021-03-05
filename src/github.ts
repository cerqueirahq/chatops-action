import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/core'

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
