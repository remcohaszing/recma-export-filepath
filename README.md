# recma-export-filepath

[![github actions](https://github.com/remcohaszing/recma-export-filepath/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/recma-export-filepath/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/remcohaszing/recma-export-filepath/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/recma-export-filepath)
[![npm version](https://img.shields.io/npm/v/recma-export-filepath)](https://www.npmjs.com/package/recma-export-filepath)
[![npm downloads](https://img.shields.io/npm/dm/recma-export-filepath)](https://www.npmjs.com/package/recma-export-filepath)

A recma plugin to expose the filepath as a named export.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Options](#options)
- [Compatibility](#compatibility)
- [License](#license)

## Installation

```sh
npm install recma-export-filepath
```

## Usage

This recma plugin exposes the filepath of the current file as a named export.

For example, given a file named `example.mdx` with the following contents:

```mdx
Hello 👋
```

The following script:

```js
import { compile } from '@mdx-js/mdx'
import recmaExportFilepath from 'recma-export-filepath'
import { read } from 'to-vfile'

const { contents } = await compile(await read('example.mdx'), {
  jsx: true,
  recmaPlugins: [recmaExportFilepath]
})

console.log(contents)
```

Roughly yields:

```jsx
export const filepath = 'example.mdx'

export default function MDXContent() {
  return <p>Hello 👋</p>
}
```

## API

The default export is a recma plugin.

### Options

- `absolute` (`boolean`, default: `false`) — If true, use an absolute path. By default a relative
  path is used.
- `cwd` (`string`) The current working directory to use when generating a relative file path.
- `name` (`string`, default: `'filepath'`) — The name to export the file path as.

## Compatibility

This project is compatible with Node.js 16 or greater.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
