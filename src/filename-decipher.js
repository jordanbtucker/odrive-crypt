const Decipher = require('./decipher')

const FILENAME_PREFIX_SIZE = 4
const FILENAME_PREFIX = Buffer.alloc(FILENAME_PREFIX_SIZE)

/**
 * Decrypts a filename.
 */
class FilenameDecipher extends Decipher {
	/**
	 * Creates a new FilenameDecipher.
	 * @param {string|Buffer} passphrase The passphrase used to encrypted the
	 * data.
	 */
	constructor (passphrase) {
		super(passphrase)

		this._prefixBytesRead = 0
	}

	/**
	 * Ensures the first four bytes of data are zero-value bytes.
	 * @param {Buffer} data The decrypted data.
	 * @param {boolean} [isFinal] True if this is the final decrypted data.
	 * @returns {Buffer}
	 */
	_processData (data, isFinal) {
		// If we haven't verified the prefix, then verify the prefix and strip
		// it from data.
		if (this._prefixBytesRead < FILENAME_PREFIX_SIZE) {
			const prefix = Buffer.alloc(FILENAME_PREFIX_SIZE, 0)
			const prefixBytes = data.copy(prefix, this._prefixBytesRead)
			this._prefixBytesRead += prefixBytes

			if (prefix.compare(FILENAME_PREFIX) !== 0) {
				throw new Error('Invalid filename prefix')
			}

			if (data.length > prefixBytes) {
				data = data.slice(prefixBytes)
			}
		}

		return data
	}
}

module.exports = FilenameDecipher
