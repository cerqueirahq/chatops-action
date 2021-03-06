import * as core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'
import {Context} from './context'

export interface LogOptions {
  icon?: string
  shouldUpdateComment: boolean
}

export interface Comment {
  id: number
  body?: string
}

export enum Icon {
  Clock = '🕐',
  Rocket = '🚀',
  ArrowRight = '➡️',
  Check = '✅',
  HourGlass = '⏳',
  FastForward = '⏩',
  Cry = '😢',
  Error = '❌',
  BlackCircle = '⚫',
  Info = 'ℹ️',
  Warning = '⚠️',
  Magnifier = '🔍'
}

const defaultOptions = {shouldUpdateComment: true}

export class Log {
  private _context: Context
  private _octokit: InstanceType<typeof GitHub>

  constructor(context: Context, octokit: InstanceType<typeof GitHub>) {
    this._context = context
    this._octokit = octokit
  }

  debug(
    message: string,
    options: LogOptions = {...defaultOptions, icon: Icon.Magnifier}
  ): void {
    if (options.shouldUpdateComment) {
      this.updateComment(message, options)
    }

    core.debug(message)
  }

  info(
    message: string,
    options: LogOptions = {...defaultOptions, icon: Icon.Info}
  ): void {
    if (options.shouldUpdateComment) {
      this.updateComment(message, options)
    }

    core.info(message)
  }

  warning(
    message: string,
    options: LogOptions = {...defaultOptions, icon: Icon.Warning}
  ): void {
    if (options.shouldUpdateComment) {
      this.updateComment(message, options)
    }

    core.warning(message)
  }

  error(
    message: string,
    options: LogOptions = {...defaultOptions, icon: Icon.Error}
  ): void {
    if (options.shouldUpdateComment) {
      this.updateComment(message, options)
    }

    core.error(message)
  }

  setFailed(
    message: string,
    options: LogOptions = {...defaultOptions, icon: Icon.Error}
  ): void {
    if (options.shouldUpdateComment) {
      this.updateComment(message, options)
    }

    core.setFailed(message)
  }

  private async updateComment(
    message: string,
    options?: LogOptions
  ): Promise<Comment | undefined> {
    if (!this._context.commentId) {
      return
    }

    const reqOptions = {
      ...this._context.repository,
      comment_id: this._context.commentId
    }

    const getResp = await this._octokit.issues.getComment(reqOptions)

    if (getResp.status !== 200) {
      return
    }

    const body = this.appendBody(
      getResp.data.body || '',
      `${options?.icon ? `${options.icon} ` : ''} ${message}`
    )

    const updateResp = await this._octokit.issues.updateComment({
      ...reqOptions,
      body
    })

    return {
      id: updateResp.data.id,
      body: updateResp.data.body
    }
  }

  private trimBody(body: string): string {
    return body
      .split('\n')
      .map(l => l.trimStart())
      .join('\n')
  }

  private appendBody(original: string, body: string): string {
    return this.trimBody(`${original}\n${body}`)
  }
}
