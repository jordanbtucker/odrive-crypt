#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const yargs = require('yargs')
const read = require('read')

const odriveCrypt = require('./')

let argv
let inStat

if (validateArgs()) {
	getPassphrase(err => {
		if (err == null) {
			decrypt()
		}
	})
}

function validateArgs () {
	argv = yargs
	.usage('Usage: $0 <options>')
	.example('$0 -i ~/odrive/Encryptor/my-vault -o ~/my-vault')
	.options({
		passphrase: {
			alias: 'pass',
			describe: `The passphrase used to encrypt
			the files`,
			type: 'string',
		},
		in: {
			alias: 'i',
			demandOption: true,
			describe: `The file or folder to decrypt
			If a folder, only subfolders and
			files will be decrypted`,
			type: 'string',
		},
		out: {
			alias: 'o',
			demandOption: true,
			describe: `The destination folder of the
			decrypted file or folder`,
			type: 'string',
		},
		verbose: {
			alias: 'v',
			describe: `List items as they are decrypted`,
			type: 'boolean',
		},
		quiet: {
			alias: 'q',
			describe: `Don't report errors`,
			type: 'boolean',
		},
	})
	.help().alias('help', 'h')
	.argv

	// Ensure that --in is an existing file or folder.
	try {
		inStat = fs.statSync(argv.in)
	} catch (err) {
		if (err.code === 'ENOENT') {
			handleError(new Error(`${argv.in} does not exist`))
		} else {
			handleError(err)
		}

		return false
	}

	// Ensure that --out is an existing folder.
	try {
		const outStat = fs.statSync(argv.out)
		if (!outStat.isDirectory()) {
			handleError(new Error(`${argv.out} is not a folder`))
			return false
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			handleError(new Error(`${argv.out} does not exist`))
		} else {
			handleError(err)
		}

		return false
	}

	return true
}

/**
 * Gets the passphrase from the arguments or prompts the user for the
 * passphrase. The passphrase is set to argv.passphrase, not returned in the
 * callback.
 * @param {function} callback Accepts an error parameter.
 */
function getPassphrase (callback) {
	// If the passphrase wasn't supplied as an argument, prompt the user for it.
	if (argv.passphrase == null) {
		read({
			prompt: 'Passphrase: ',
			silent: true,
		}, (err, passphrase) => {
			if (err) {
				// If the user presses CTRL+C, it shouldn't output an error.
				if (!err.message === 'canceled') {
					handleError(err)
					callback(err)
				}
			} else {
				argv.passphrase = passphrase
				callback()
			}
		})
	} else {
		callback()
	}
}

/**
 * Begin the decryption process.
 */
function decrypt () {
	if (inStat.isFile()) {
		decryptFile(argv.in, argv.out)
	} else if (inStat.isDirectory()) {
		decryptDirectoryItems(argv.in, argv.out)
	} else {
		handlePathError(argv.in, new Error('Unsupported folder item'))
	}
}

/**
 * Decrypts a file asynchronously.
 * @param {string} inPath The path of the file to decrypt.
 * @param {string} outDir The path of the destination folder.
 * @param {function} callback
 */
function decryptFile (inPath, outDir, callback) {
	// Decrypt the filename.
	const inName = path.basename(inPath)

	let outName
	try {
		outName = odriveCrypt.decryptFilenameSync(argv.passphrase, inName)
	} catch (err) {
		handlePathError(inPath, err)
		callback()
	}

	// Append the decrypted filename to the output folder.
	const outPath = path.join(outDir, outName)

	// Decrypt the file and save it to the output folder.
	odriveCrypt.decryptFile(argv.passphrase, inPath, outPath, err => {
		if (err != null) {
			handlePathError(inPath, err)
			callback()
		}

		if (argv.verbose) {
			console.log(outPath)
		}

		callback()
	})
}

/**
 * Decrypts a folder name asynchronously.
 * @param {string} inPath The path of the folder name to decrypt.
 * @param {string} outDir The path of the destination folder.
 * @param {function} callback
 */
function decryptDirectoryName (inPath, outDir, callback) {
	// Decrypt the folder name.
	const inName = path.basename(inPath)

	let outName
	try {
		outName = odriveCrypt.decryptFilenameSync(argv.passphrase, inName)
	} catch (err) {
		handlePathError(inPath, err)
		callback(err)
	}

	// Append the decrypted folder name to the output folder.
	const outPath = path.join(outDir, outName)

	// Create the decrypted folder, but don't throw if it already exists.
	try {
		fs.mkdirSync(outPath)
	} catch (err) {
		if (err.code !== 'EEXIST') {
			handlePathError(outPath, err)
		}
	}

	callback(null, outName)
}

/**
 * Recursively decrypt the items in a folder.
 * @param {string} inPath The path of the folder to decrypt.
 * @param {string} outDir The path of the destination folder.
 * @param {function} callback
 */
function decryptDirectoryItems (inPath, outDir, callback) {
	if (typeof callback !== 'function') {
		callback = noop
	}

	// Get the names of the items in the folder.
	let items
	try {
		items = fs.readdirSync(inPath)
	} catch (err) {
		handlePathError(err)
		callback()
	}

	// Asynchronously iterate through each item and decrypt it. If it's a
	// folder, decrypt the items inside it, too.
	let index = 0
	let parentPath = inPath
	function decryptNextItem () {
		const item = items[index++]
		const subPath = path.join(parentPath, item)
		decryptDirectoryItem(subPath, outDir, () => {
			// If we've decrypted all of the items in the folder, call the
			// callback, otherwise, decrypt the next item.
			if (index >= items.length) {
				callback()
			} else {
				decryptNextItem()
			}
		})
	}

	// If the folder is not empty, decrypt the first item, otherwise, call the
	// callback.
	if (index < items.length) {
		decryptNextItem()
	} else {
		callback()
	}
}

/**
 * Decrypt an item in a folder.
 * @param {string} inPath The path of the item to decrypt.
 * @param {string} outDir The path of the destination folder.
 * @param {function} callback
 */
function decryptDirectoryItem (inPath, outDir, callback) {
	let stat
	try {
		stat = fs.statSync(inPath)
	} catch (err) {
		handlePathError(inPath, err)
	}

	if (stat.isFile()) {
		decryptFile(inPath, outDir, callback)
	} else if (stat.isDirectory()) {
		decryptDirectoryName(inPath, outDir, (err, outName) => {
			if (err == null) {
				decryptDirectoryItems(inPath, path.join(outDir, outName), callback)
			}
		})
	} else {
		handlePathError(inPath, new Error('Unsupported folder item'))
		callback()
	}
}

/**
 * Handle an error related to a path to decrypt.
 * @param {string} inPath The path related to the error.
 * @param {Error} err The error to handle.
 */
function handlePathError (inPath, err) {
	// If --quiet was set, don't output the error.
	if (!argv.quiet) {
		console.error(`Error: ${err.message} : ${inPath}`)
	}
}

/**
 * Handle an error.
 * @param {Error} err The error to handle.
 */
function handleError (err) {
	console.error(`Error: ${err.message}`)
}

/**
 * A function that does nothing. Used when a null callback is supplied.
 */
function noop () {}
