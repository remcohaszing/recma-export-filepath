/**
 * @import { Plugin } from 'unified'
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Parser } from 'acorn'
import { generate } from 'astring'
import recmaExportFilepath from 'recma-export-filepath'
import { unified } from 'unified'

/**
 * @type {Plugin}
 */
function recmaParse() {
  this.parser = (doc) => {
    const program = Parser.parse(doc, { ecmaVersion: 'latest', sourceType: 'module' })
    // @ts-expect-error unified requires the root to be a plain object.
    program.__proto__ = Object.prototype
    return program
  }
}

/**
 * @type {Plugin}
 */
function recmaStringify() {
  this.compiler = (ast) => generate(ast)
}

const recma = unified().use(recmaParse).use(recmaStringify).freeze()

test('no options', () => {
  const result = recma().use(recmaExportFilepath).processSync({
    cwd: '/home/user',
    path: '/home/user/example.js',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "example.js";\n')
})

test('custom name', () => {
  const result = recma().use(recmaExportFilepath, { name: 'custom' }).processSync({
    cwd: '/home/user',
    path: '/home/user/example.js',
    value: ''
  })

  assert.equal(String(result), 'export const custom = "example.js";\n')
})

test('normalize path', () => {
  const result = recma().use(recmaExportFilepath).processSync({
    cwd: 'C:\\Users\\user',
    path: 'C:\\Users\\user\\Downloads\\example.js',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "Downloads/example.js";\n')
})

test('absolute path', () => {
  const result = recma().use(recmaExportFilepath, { absolute: true }).processSync({
    cwd: '/home/user',
    path: '/home/user/example.js',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "/home/user/example.js";\n')
})

test('cwd (absolute)', () => {
  const result = recma().use(recmaExportFilepath, { cwd: '/home/user/docs/' }).processSync({
    cwd: '/home/user',
    path: '/home/user/docs/example.md',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "example.md";\n')
})

test('cwd (relative)', () => {
  const result = recma().use(recmaExportFilepath, { cwd: 'docs' }).processSync({
    cwd: '/home/user',
    path: '/home/user/docs/example.md',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "example.md";\n')
})

test('cwd (relative with parent dir)', () => {
  const result = recma().use(recmaExportFilepath, { cwd: '..' }).processSync({
    cwd: '/home/user',
    path: '/home/user/docs/example.md',
    value: ''
  })

  assert.equal(String(result), 'export const filepath = "user/docs/example.md";\n')
})

test('insert as first statement', () => {
  const result = recma().use(recmaExportFilepath).processSync({
    cwd: '/home/user',
    path: '/home/user/example.js',
    value: 'let anotherStatement;\n'
  })

  assert.equal(String(result), 'export const filepath = "example.js";\nlet anotherStatement;\n')
})

test('missing path', () => {
  const result = recma().use(recmaExportFilepath).processSync('')

  assert.equal(String(result), 'export const filepath = "";\n')
  assert.equal(result.messages.length, 1)
  assert.equal(result.messages[0].reason, 'Missing file.path')
  assert.equal(result.messages[0].ruleId, 'missing-filepath')
  assert.equal(result.messages[0].source, 'recma-export-filepath')
  assert.equal(result.messages[0].url, 'https://github.com/remcohaszing/recma-export-filepath')
})

test('throw on invalid name', () => {
  assert.throws(() => recma().use(recmaExportFilepath, { name: 'invalid name' }).freeze())
})
