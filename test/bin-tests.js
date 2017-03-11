const fs = require('fs')
const path = require('path')

const fixturesDir = path.join(__dirname, 'fixtures')
const rootDir = path.join(fixturesDir, 'root')
const outputDir = path.join(fixturesDir, 'output')
const outputRootDir = path.join(outputDir, 'root')

try {
	fs.mkdirSync(outputDir)
	fs.mkdirSync(outputRootDir)
} catch (err) {}

require('tap').mochaGlobals()

process.argv = [
	'node', 'bin.js',
	'--passphrase', 'password123',
	'-i', rootDir,
	'-o', outputRootDir,
]

describe('cli', () => {
	it('should decrypt a folder', () => {
		require('../src/bin')
	})
})
