const assert = require('assert')

require('tap').mochaGlobals()

const FilenameDecipher = require('../src/filename-decipher')

describe('FilenameDecipher', () => {
	it('should decrypt a filename', () => {
		const encFilename = 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE='
		const passphrase = 'password123'
		const output = 'test.txt'
		const decipher = new FilenameDecipher(passphrase)
		let decFilename = decipher.update(encFilename, 'base64', 'utf8')
		decFilename += decipher.final('utf8')
		assert.strictEqual(decFilename, output)
	})
})
