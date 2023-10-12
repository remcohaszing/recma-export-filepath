import { relative } from 'node:path'

import { name as isIdentifierName } from 'estree-util-is-identifier-name'
import normalizePath from 'normalize-path'

/**
 * @typedef RecmaExportFilepathOptions
 * @property {boolean} [absolute=false]
 *   If true, use an absolute path. By default a relative path is used.
 * @property {string} [name='filepath']
 *   The name to export the file path as.
 */

/**
 * A recma plugin to expose the filepath as a named export
 *
 * @type {import('unified').Plugin<[RecmaExportFilepathOptions?], import('estree').Program>}
 */
export default function recmaExportFilepath({ absolute = false, name = 'filepath' } = {}) {
  if (!isIdentifierName(name)) {
    throw new Error(`Name this should be a valid identifier, got: ${JSON.stringify(name)}`)
  }

  return (ast, file) => {
    let value = file.path

    if (value) {
      const cwd = normalizePath(file.cwd)
      value = normalizePath(value)

      if (!absolute) {
        value = relative(cwd, value)
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
