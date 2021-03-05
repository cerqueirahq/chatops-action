import * as core from '@actions/core'
import {CommandHandler} from '../command'

export const handleHelpCommand: CommandHandler = () => {
  core.debug(`Handling /help command`)
}
