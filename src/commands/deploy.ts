import * as core from '@actions/core'
import {Command, CommandHandler} from '../command'

export const command: Command = {
  name: 'deploy',
  description: 'Deploys the project to the specified environment',
  args: [
    {
      name: 'env',
      description: 'The environment to deploy the project to'
    }
  ]
}

export const handler: CommandHandler = () => {
  core.debug(`Handling /deploy command`)
}
