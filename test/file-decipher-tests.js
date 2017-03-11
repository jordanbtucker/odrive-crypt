const fs = require('fs')
const path = require('path')

const tap = require('tap')

const FileDecipher = require('../src/file-decipher')

const filename = path.join(__dirname, 'fixtures', 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE=')
const passphrase = 'password123'
const output = 'test'

tap.test('FileDecipher', t => {
	t.test('should decrypt a file synchronously', t => {
		const decipher = new FileDecipher(passphrase)
		const encData = fs.readFileSync(filename)
		let decData = decipher.update(encData, null, 'utf8')
		decData += decipher.final('utf8')
		t.equal(decData, output)
		t.end()
	})
	t.test('should decrypt a file asynchronously', t => {
		const decipher = new FileDecipher(passphrase)
		decipher.setEncoding('utf8')
		let data = ''
		decipher.on('data', chunk => {
			data += chunk
		}).on('end', () => {
			t.equal(data, output)
			t.end()
		})

		const reader = fs.createReadStream(filename)
		reader.pipe(decipher)
	})
	t.end()
})
