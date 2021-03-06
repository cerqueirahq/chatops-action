import {ghPolls} from 'gh-polls'
import * as actionSlasher from '../action-slasher'
import * as chatops from '../chatops'

export const poll = actionSlasher.command('poll', {
  description: 'Creates a poll using [GitHub Polls](https://gh-polls.com/)',
  definition(c) {
    c.arg('question', {
      type: String,
      description: 'Subject of the poll'
    })

    c.arg('option', {
      type: [String],
      description: 'The options available'
    })
  },
  async handler(args) {
    if (!chatops.context.commentId) {
      return
    }

    // @ts-expect-error FIXME
    if (args.option.length === 0) {
      chatops.error('You did not specified any options for the poll')
      return
    }

    // @ts-expect-error FIXME
    const ghPoll = await ghPolls(args.option.map(o => o.replace(/^"|"$/g, '')))

    chatops.info(
      `
        ${
          // @ts-expect-error FIXME
          args.question ? `#### ${args.question.replace(/^"|"$/g, '')}` : ''
        }

        ${ghPoll.map(o => `[![](${o.image})](${o.vote})`).join('\n')}
      `,
      {icon: undefined, shouldUpdateComment: true}
    )
  }
})
