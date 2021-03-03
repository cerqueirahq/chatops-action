import * as core from '@actions/core'
import {getConfigFromInputs} from './config'

async function run(): Promise<void> {
  try {
    const config = getConfigFromInputs()

    core.debug(`Using configuration: ${JSON.stringify(config, null, 2)}`)

    core.debug('Hello, ChatOps!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
