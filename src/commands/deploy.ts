import * as core from '@actions/core'
import {CommandHandler} from '../command'

export const handleDeployCommand: CommandHandler = () => {
  core.debug(`Handling /deploy command`)
}
