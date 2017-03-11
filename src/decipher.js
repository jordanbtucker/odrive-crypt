/* eslint camelcase: off */

'use strict'

const crypto = require('crypto')
const stream = require('stream')

const VERSION_SIZE = 8 / 8
const SALT_SIZE = 64 / 8
const IV_SIZE = 128 / 8
const HEADER_SIZE = VERSION_SIZE + SALT_SIZE + IV_SIZE
const VERSION = '1'
const KDF_ITER = 5000
const KEY_SIZE = 128 / 8
const KDF_DIGEST = 'sha256'
const ENC_ALG = 'aes-128-cbc'

/**
 * Reads the header from the encrypted data and outputs the decrypted data.
 */
class Decipher extends stream.Transform {
	/**
	 * Creates a new Decipher.
	 * @param {string|Buffer} passphrase The passphrase used to encrypted the
	 * data.
	 */
	constructor (passphrase) {
		if (typeof passphrase !== 'string' && !(passphrase instanceof Buffer)) {
			throw new Error('Passphrase must be a string or a buffer')
		}

		// Since Decipher extends Transform, we must define methods for
		// transform and flush, which call update and final, respectively and
		// push the decrypted data.
		super({
			transform (chunk, encoding, callback) {
				try {
					this.push(this.update(chunk, encoding), encoding)
					callback()
				} catch (err) {
					callback(err)
				}
			},

			flush (callback) {
				try {
					this.push(this.final())
					callback()
				} catch (err) {
					callback(err)
				}
			},
		})

		this._passphrase = passphrase

		this._headerBuffer = Buffer.alloc(HEADER_SIZE)
		this._headerBytesRead = 0
	}

	/**
	 * Updates the decipher with encrypted data to decrypt. If only header
	 * information is given, this may return an empty Buffer or string.
	 * @param {Buffer|string} data The encrypted data to decrypt.
	 * @param {string} [input_encoding] The encoding of the encrypted data.
	 * @param {string} [output_encoding] The desired encoding of the decrypted
	 * data.
	 * @returns {Buffer|string}
	 */
	update (data, input_encoding, output_encoding) {
		if (data instanceof Buffer) {
			input_encoding = null
		}

		if (typeof data === 'string') {
			data = Buffer.from(data, input_encoding)
		}

		// If _decipher is null, then we haven't got enough header information.
		if (this._decipher == null) {
			// Copy as much header information into _headerBuffer as possible.
			let bytesRead
			let dataBytes
			if (this._headerBytesRead < HEADER_SIZE) {
				bytesRead = data.copy(this._headerBuffer, this._headerBytesRead, 0)
				this._headerBytesRead += bytesRead
				dataBytes = data.length - bytesRead
			}

			// If we have enough header information, we can create the internal
			// _decipher.
			if (this._headerBytesRead === HEADER_SIZE) {
				// Ensure the encryption version is supported.
				const version = this._headerBuffer.slice(0, VERSION_SIZE)
				if (version.toString() !== VERSION) {
					throw new Error('Unsupported version')
				}

				const salt = this._headerBuffer.slice(VERSION_SIZE, VERSION_SIZE + SALT_SIZE)
				const iv = this._headerBuffer.slice(VERSION_SIZE + SALT_SIZE)
				const key = crypto.pbkdf2Sync(this._passphrase, salt, KDF_ITER, KEY_SIZE, KDF_DIGEST)

				// The _passphrase to null since we don't need it anymore, and
				// let the garbage collector handle it.
				this._passphrase = null

				this._decipher = crypto.createDecipheriv(ENC_ALG, key, iv)

				// If we received data after the header information, decrypt it.
				if (dataBytes > 0) {
					let output = this._decipher.update(data.slice(bytesRead))

					// Call _processData if it's been implemented by a subclass.
					if (typeof this._processData === 'function') {
						output = this._processData(output)
					}

					return encode(output, output_encoding)
				}
			}

			return encode(Buffer.alloc(0), output_encoding)
		} else {
			let output = this._decipher.update(data)

			// Call _processData if it's been implemented by a subclass.
			if (typeof this._processData === 'function') {
				output = this._processData(output)
			}

			return encode(output, output_encoding)
		}
	}

	/**
	 * Returns any remaining decrypted data.
	 * @param {string} [output_encoding] The desired encoding of the decrypted
	 * data.
	 * @returns {Buffer|string}
	 */
	final (output_encoding) {
		// If _decipher is null, then we never got enough header information to
		// derive the encryption key, and the encrypted data is invalid.
		if (this._decipher == null) {
			throw new Error('Unsupported state')
		}

		let output = this._decipher.final()

		// Call _processData if it's been implemented by a subclass.
		if (typeof this._processData === 'function') {
			output = this._processData(output, true)
		}

		return encode(output, output_encoding)
	}
}

/**
 * Encode the return data with the desired encoding.
 * @param {Buffer} data The data to encode.
 * @param {string} encoding The desired encoding.
 * @returns {Buffer|string}
 */
function encode (data, encoding) {
	if (typeof encoding === 'string') {
		return data.toString(encoding)
	}

	return data
}

module.exports = Decipher
