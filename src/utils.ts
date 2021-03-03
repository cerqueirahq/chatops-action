import * as core from '@actions/core'

// Credits to @peter-evans
// https://github.com/peter-evans/slash-command-dispatch/blob/master/src/utils.ts

export function getInputAsArray(
  name: string,
  options?: core.InputOptions
): string[] {
  return getStringAsArray(core.getInput(name, options))
}

export function getStringAsArray(str: string): string[] {
  return str
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(x => x !== '')
}
