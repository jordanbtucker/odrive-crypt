const assert = require('assert')
const fs = require('fs')
const path = require('path')

require('tap').mochaGlobals()

const odriveCrypt = require('../src/index')
const FileDecipher = require('../src/file-decipher')

const passphrase = 'password123'
const inFilename = 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE='
const outFilename = 'test.txt'
const fixturesDir = path.join(__dirname, 'fixtures')
const outputDir = path.join(fixturesDir, 'output')
const inPath = path.join(fixturesDir, inFilename)
const outPath = path.join(fixturesDir, 'output', outFilename)
const fileContents = 'test'

try { fs.mkdirSync(outputDir) } catch (err) {}

describe('createReadStream', () => {
	it('should return a FileDecipher', () => {
		const reader = odriveCrypt.createReadStream(passphrase, inPath)
		assert.ok(reader instanceof FileDecipher)
	})
})
describe('decryptFile', () => {
	it('should decrypt a file asynchronously', done => {
		odriveCrypt.decryptFile(passphrase, inPath, outPath, err => {
			if (err != null) {
				assert.fail(err)
				done()
			}

			assert.strictEqual(fs.readFileSync(outPath, 'utf8'), fileContents)
			done()
		})
	})
})
describe('decryptFileSync', () => {
	it('should decrypt a file synchronously', () => {
		odriveCrypt.decryptFileSync(passphrase, inPath, outPath)
		assert.strictEqual(fs.readFileSync(outPath, 'utf8'), fileContents)
	})
})
describe('decryptFilename', () => {
	it('should decrypt a filename asynchronously', done => {
		odriveCrypt.decryptFilename(passphrase, inFilename, (err, decFilename) => {
			if (err != null) {
				assert.fail(err)
				done()
			}

			assert.strictEqual(decFilename, outFilename)
			done()
		})
	})
})
describe('decryptFilenameSync', () => {
	it('should decrypt a filename synchronously', () => {
		assert.strictEqual(odriveCrypt.decryptFilenameSync(passphrase, inFilename), outFilename)
	})
})
