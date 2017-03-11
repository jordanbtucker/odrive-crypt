'use strict'

const fs = require('fs')
const path = require('path')

const tap = require('tap')

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

tap.test('createReadStream', t => {
	t.test('should return a FileDecipher', t => {
		const reader = odriveCrypt.createReadStream(passphrase, inPath)
		t.ok(reader instanceof FileDecipher)
		t.end()
	})
	t.end()
})
tap.test('decryptFile', t => {
	t.test('should decrypt a file asynchronously', t => {
		odriveCrypt.decryptFile(passphrase, inPath, outPath, err => {
			if (err != null) {
				t.threw(err)
			}

			t.equal(fs.readFileSync(outPath, 'utf8'), fileContents)
			t.end()
		})
	})
	t.end()
})
tap.test('decryptFileSync', t => {
	t.test('should decrypt a file synchronously', t => {
		odriveCrypt.decryptFileSync(passphrase, inPath, outPath)
		t.equal(fs.readFileSync(outPath, 'utf8'), fileContents)
		t.end()
	})
	t.end()
})
tap.test('decryptFilename', t => {
	t.test('should decrypt a filename asynchronously', t => {
		odriveCrypt.decryptFilename(passphrase, inFilename, (err, decFilename) => {
			if (err != null) {
				t.threw(err)
			}

			t.equal(decFilename, outFilename)
			t.end()
		})
	})
	t.end()
})
tap.test('decryptFilenameSync', t => {
	t.test('should decrypt a filename synchronously', t => {
		t.equal(odriveCrypt.decryptFilenameSync(passphrase, inFilename), outFilename)
		t.end()
	})
	t.end()
})
