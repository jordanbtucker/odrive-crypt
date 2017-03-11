const tap = require('tap')

const FilenameDecipher = require('../src/filename-decipher')

tap.test('FilenameDecipher', t => {
	t.test('should decrypt a filename', t => {
		const encFilename = 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE='
		const passphrase = 'password123'
		const output = 'test.txt'
		const decipher = new FilenameDecipher(passphrase)
		let decFilename = decipher.update(encFilename, 'base64', 'utf8')
		decFilename += decipher.final('utf8')
		t.equal(decFilename, output)
		t.end()
	})
	t.end()
})
