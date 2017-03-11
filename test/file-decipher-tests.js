const assert = require('assert')
const fs = require('fs')
const path = require('path')

require('tap').mochaGlobals()

const FileDecipher = require('../src/file-decipher')

const filename = path.join(__dirname, 'fixtures', 'MaUi8C8YFNhN5dzbjNtqgXx3Cm-PwyUYxR1Rl4JauHHrjrTMo0k9poE=')
const passphrase = 'password123'
const output = 'test'

describe('FileDecipher', () => {
	it('should decrypt a file synchronously', () => {
		const decipher = new FileDecipher(passphrase)
		const encData = fs.readFileSync(filename)
		let decData = decipher.update(encData, null, 'utf8')
		decData += decipher.final('utf8')
		assert.strictEqual(decData, output)
	})
	it('should decrypt a file asynchronously', done => {
		const decipher = new FileDecipher(passphrase)
		decipher.setEncoding('utf8')
		let data = ''
		decipher.on('data', chunk => {
			data += chunk
		}).on('end', () => {
			assert.strictEqual(data, output)
			done()
		})

		const reader = fs.createReadStream(filename)
		reader.pipe(decipher)
	})
})
