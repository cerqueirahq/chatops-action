import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const deploymentLog = actionSlasher.event('deployment-log', {
  description: 'An event triggered when a deployment has emitted some log',
  async handler() {
    chatops.info(chatops.context.message)
  }
})
