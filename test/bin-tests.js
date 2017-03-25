'use strict'

const fs = require('fs')
const path = require('path')

const tap = require('tap')

const fixturesDir = path.join(__dirname, 'fixtures')
const rootDir = path.join(fixturesDir, 'root')
const rootFile = path.join(fixturesDir, 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE=')
const outputDir = path.join(fixturesDir, 'output')
const outputRootDir = path.join(outputDir, 'root')

try { fs.mkdirSync(outputDir) } catch (err) {}
try { fs.mkdirSync(outputRootDir) } catch (err) {}

tap.test('cli', t => {
	t.test('should decrypt a folder', t => {
		delete require.cache[require.resolve('../src/bin')]

		process.argv = [
			'node', 'bin.js',
			'--passphrase', 'password123',
			'-i', rootDir,
			'-o', outputRootDir,
		]

		require('../src/bin')
		t.end()
	})

	t.test('should decrypt a file', t => {
		delete require.cache[require.resolve('../src/bin')]

		process.argv = [
			'node', 'bin.js',
			'--passphrase', 'password123',
			'-i', rootFile,
			'-o', outputDir,
		]

		require('../src/bin')
		t.end()
	})
	t.end()
})
