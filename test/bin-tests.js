const fs = require('fs')
const path = require('path')

const tap = require('tap')

const fixturesDir = path.join(__dirname, 'fixtures')
const rootDir = path.join(fixturesDir, 'root')
const outputDir = path.join(fixturesDir, 'output')
const outputRootDir = path.join(outputDir, 'root')

try {
	fs.mkdirSync(outputDir)
	fs.mkdirSync(outputRootDir)
} catch (err) {}

process.argv = [
	'node', 'bin.js',
	'--passphrase', 'password123',
	'-i', rootDir,
	'-o', outputRootDir,
]

tap.test('cli', t => {
	t.test('should decrypt a folder', t => {
		require('../src/bin')
		t.end()
	})
	t.end()
})
