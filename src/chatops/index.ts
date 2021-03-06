import * as core from '@actions/core'
import * as github from '@actions/github'
import {Context} from './context'
import {Log} from './Log'

export {Icon} from './log'

export const octokit = github.getOctokit(
  core.getInput('token', {required: true}),
  {previews: ['flash', 'ant-man']}
)

export const context = new Context(octokit)

const log = new Log(context, octokit)

export const debug = log.debug.bind(log)
export const error = log.error.bind(log)
export const info = log.info.bind(log)
export const warn = log.warning.bind(log)
export const setFailed = log.setFailed.bind(log)
