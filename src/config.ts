import {Environment, getDefaultEnvironments} from './environment'
import * as core from '@actions/core'
import * as github from '@actions/github'

export interface Config {
  token: string
  project: string
  processor: string
  environments: Environment[]
}

export const getConfigFromInputs = (): Config => {
  const config: Config = {
    token: core.getInput('token', {required: true}),
    project: core.getInput('project', {required: false}),
    processor: core.getInput('processor', {required: false}),
    environments: JSON.parse(core.getInput('environments', {required: false}))
  }

  if (!config.project) {
    config.project = github.context.repo.repo

    core.info(`Config.project not set, using "${config.project}"`)
  }

  if (!config.processor) {
    config.processor = github.context.repo.repo

    core.info(`Config.processor not set, using "${config.processor}"`)
  }

  if (!config.environments || config.environments.length === 0) {
    config.environments = getDefaultEnvironments()

    core.info(
      `Config.environments not set, using "${config.environments
        .map(env => env.name)
        .join(', ')}"`
    )
  }

  return config
}
