import { relative, resolve } from 'node:path'

import { type Program } from 'estree'
import normalizePath from 'normalize-path'
import { type Plugin } from 'unified'
import { define } from 'unist-util-mdx-define'

interface RecmaExportFilepathOptions extends define.Options {
  /**
   * If true, use an absolute path. By default a relative path is used.
   *
   * @default false
   */
  absolute?: boolean

  /**
   * The current working directory to use when generating a relative file path.
   */
  cwd?: string

  /**
   * The name to export the file path as.
   *
   * @default 'filepath'
   */
  name?: string
}

/**
 * A recma plugin to expose the filepath as a named export
 */
const recmaExportFilepath: Plugin<[RecmaExportFilepathOptions?], Program> =
  ({ absolute = false, cwd, name = 'filepath', ...options } = {}) =>
  (ast, file) => {
    let value = file.path

    if (value) {
      value = normalizePath(value)
      if (!absolute) {
        value = relative(cwd ? resolve(file.cwd, cwd) : normalizePath(file.cwd), value)
      }
    } else {
      const message = file.message('Missing file.path', {
        source: 'recma-export-filepath',
        ruleId: 'missing-filepath'
      })
      message.url = 'https://github.com/remcohaszing/recma-export-filepath'
      value = ''
    }

    define(ast, file, { [name]: { type: 'Literal', value } }, options)
  }

export default recmaExportFilepath
