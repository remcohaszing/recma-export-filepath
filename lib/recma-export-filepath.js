/**
 * @import { Program } from 'estree'
 * @import { Plugin } from 'unified'
 */

import { relative, resolve } from 'node:path'

import { name as isIdentifierName } from 'estree-util-is-identifier-name'
import normalizePath from 'normalize-path'

/**
 * @typedef RecmaExportFilepathOptions
 * @property {boolean} [absolute=false]
 *   If true, use an absolute path. By default a relative path is used.
 * @property {string} [cwd]
 *   The current working directory to use when generating a relative file path.
 * @property {string} [name='filepath']
 *   The name to export the file path as.
 */

/**
 * A recma plugin to expose the filepath as a named export
 *
 * @type {Plugin<[RecmaExportFilepathOptions?], Program>}
 */
const recmaExportFilepath = (options = {}) => {
  const { absolute = false, cwd, name = 'filepath' } = options
  if (!isIdentifierName(name)) {
    throw new Error(`Name this should be a valid identifier, got: ${JSON.stringify(name)}`)
  }

  return (ast, file) => {
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

    ast.body.unshift({
      type: 'ExportNamedDeclaration',
      specifiers: [],
      declaration: {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name },
            init: { type: 'Literal', value }
          }
        ]
      }
    })
  }
}

export default recmaExportFilepath
