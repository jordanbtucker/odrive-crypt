const crypto = require('crypto')

const Decipher = require('./decipher')

const HASH_ALG = 'sha256'
const HASH_SIZE = 256 / 8

/**
 * Decrypts a file.
 */
class FileDecipher extends Decipher {
	/**
	 * Creates a new FileDecipher.
	 * @param {string|Buffer} passphrase The passphrase used to encrypted the
	 * data.
	 */
	constructor (passphrase) {
		super(passphrase)

		this._hash = crypto.createHash(HASH_ALG)
	}

	/**
	 * Stores the last HASH_SIZE bytes of decrypted data into _hashBuffer and
	 * updates _hash with the rest. If isFinal is true, ensures the digest
	 * computed by _hash matches _hashBuffer.
	 * @param {Buffer} data The decrypted data.
	 * @param {boolean} [isFinal] True if this is the final decrypted data.
	 * @returns {Buffer}
	 */
	_processData (data, isFinal) {
		// If _hashBuffer is not null, prepend data with _hashBuffer.
		if (this._hashBuffer != null) {
			data = Buffer.concat([this._hashBuffer, data])
			this._hashBuffer = null
		}

		// Store the last HASH_SIZE bytes into _hashBuffer and store the rest of
		// the bytes in data.
		if (data.length >= HASH_SIZE) {
			this._hashBuffer = data.slice(data.length - HASH_SIZE)
			data = data.slice(0, data.length - HASH_SIZE)
		} else {
			this._hashBuffer = data
			data = Buffer.alloc(0)
		}

		// If data is not empty, update _hash.
		if (data.length > 0) {
			this._hash.update(data)
		}

		// If this is the last chunk of data, compute the hash and ensure it
		// matches.
		if (isFinal) {
			if (this._hash.digest().compare(this._hashBuffer) !== 0) {
				throw new Error('Invalid file hash')
			}
		}

		return data
	}
}

module.exports = FileDecipher
