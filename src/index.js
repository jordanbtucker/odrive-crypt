'use strict'

const fs = require('fs')

const FileDecipher = require('./file-decipher')
const FilenameDecipher = require('./filename-decipher')

/**
 * Creates a readable stream of decrypted data.
 * @param {string|Buffer} passphrase The passphrase used to encrypted the data.
 * @param {string|Buffer} path The path to the file to decrypt.
 * @returns {FileDecipher}
 */
function createReadStream (passphrase, path) {
	const decipher = new FileDecipher(passphrase)
	const reader = fs.createReadStream(path)
	return reader.pipe(decipher)
}

/**
 * Decrypts a file asynchronously.
 * @param {string|Buffer} passphrase The passphrase used to encrypted the data.
 * @param {string|Buffer} inFilename The name of the file to decrypt.
 * @param {string|Buffer} outFilename The destination of the decrypted file.
 * @param {function} callback Accepts an error parameter.
 */
function decryptFile (passphrase, inFilename, outFilename, callback) {
	let writer
	try {
		const reader = createReadStream(passphrase, inFilename)
		writer = fs.createWriteStream(outFilename)

		reader
		.on('error', handleError)
		.on('end', callback)
		.pipe(writer)
		.on('error', handleError)
	} catch (err) {
		handleError(err)
	}

	function handleError (err) {
		try {
			writer.close()
			fs.unlinkSync(outFilename)
		} finally {
			callback(err)
		}
	}
}

/**
 * Decrypts a file synchronously. Not recommended for large files since the
 * entire file is loaded into memory.
 * @param {string|Buffer} passphrase The passphrase used to encrypted the data.
 * @param {string|Buffer} inFilename The name of the file to decrypt.
 * @param {string|Buffer} outFilename The destination of the decrypted file.
 */
function decryptFileSync (passphrase, inFilename, outFilename) {
	const decipher = new FileDecipher(passphrase)
	const data = fs.readFileSync(inFilename)
	const output1 = decipher.update(data)
	const output2 = decipher.final()
	const output = Buffer.concat([output1, output2])
	fs.writeFileSync(outFilename, output)
}

/**
 * Decrypts a filename asynchronously.
 * @param {string|Buffer} passphrase The passphrase used to encrypted the data.
 * @param {string|Buffer} filename The filename to decrypt.
 * @param {function} callback Accepts an error parameter.
 */
function decryptFilename (passphrase, filename, callback) {
	try {
		const output = decryptFilenameSync(passphrase, filename)
		callback(null, output)
	} catch (err) {
		callback(err)
	}
}

/**
 * Decrypts a filename synchronously.
 * @param {string|Buffer} passphrase The passphrase used to encrypted the data.
 * @param {string|Buffer} filename The filename to decrypt.
 * @returns {string}
 */
function decryptFilenameSync (passphrase, filename) {
	const decipher = new FilenameDecipher(passphrase)
	let output = decipher.update(filename, 'base64', 'utf8')
	output += decipher.final('utf8')
	return output
}

module.exports = {
	createReadStream,
	decryptFile,
	decryptFileSync,
	decryptFilename,
	decryptFilenameSync,
	FileDecipher,
	FilenameDecipher,
}
