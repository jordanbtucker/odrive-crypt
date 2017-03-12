# odrive-crypt

[![Build Status](https://travis-ci.org/jordanbtucker/odrive-crypt.svg?branch=master)](https://travis-ci.org/jordanbtucker/odrive-crypt)

Decrypts files encrypted by odrive.

## Installation

Install [Node.js].

Open a terminal/command prompt and type:

```bash
npm install -g odrive-crypt
```

## Usage

To decrypt all of the files at `~/odrive/Encrpytor/my-vault` and save them to `~/my-vault`, use the following command.

```bash
odrive-crypt -i ~/odrive/Encryptor/my-vault -o ~/my-vault
```

To learn more about the available options, use

```bash
odrive-crypt -h
```

## API

odrive-crypt also has a rich API.

### Usage

```bash
npm install --save odrive-crypt
```

```js
const odriveCrypt = require('odrive-crypt')
```

### odriveCrypt.createReadStream(passphrase, path)

Returns a readable stream of decrypted data.

- `passphrase` (`string`|`Buffer`): The passphrase used to encrypted the data.
- `path` (`string`|`Buffer`): The path to the file to decrypt.

### odriveCrypt.decryptFile(passphrase, inFilename, outFilename, callback)

Decrypts a file asynchronously.

- `passphrase` (`string`|`Buffer`): The passphrase used to encrypted the data.
- `inFilename` (`string`|`Buffer`): The name of the file to decrypt.
- `outFilename` (`string`|`Buffer`): The destination of the decrypted file.
- `callback` (`(err) => void`)

### odriveCrypt.decryptFileSync(passphrase, inFilename, outFilename)

Synchronous version of `decryptFile`. Not recommended for large files since the entire file is loaded into memory.

### odriveCrypt.decryptFilename(passphrase, filename, callback)

Decrypts a filename asynchronously.

- `passphrase` (`string`|`Buffer`): The passphrase used to encrypted the data.
- `filename` (`string`|`Buffer`): The filename to decrypt.
- `callback` (`(err, filename) => void`)
  - `filename` (`string`): The decrypted filename.

### odriveCrypt.decryptFilenameSync(passphrase, filename)

Synchronous version of `decryptFilename`.

### new odriveCrypt.FileDecipher(passphrase)

Creates a decipher like `crypto.Decipher` for decrypting files.

### new odriveCrypt.FilenameDecipher(passphrase)

Creates a decipher like `crypto.Decipher` for decrypting filenames.

[Node.js]: https://nodejs.org/
