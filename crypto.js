// Source: https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
const crypto = require('crypto')

// 32-character secret, used to encrypt and decrypt messages.
// This string is IMPORTANT and should always be ambigious.
const secretKey = 'ThisKeyIsNotThatSecureButItWorks'

// aes-256-ctr is a strong two-way encryption algorithm
const algorithm = 'aes-256-ctr'


// Turns plaintext to gibberish!
const encrypt = (text) => {
    // Initalization Vector, an ambigious 16-character key
    // used in conjunction when encryption and decryption.
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    // Return an array: iv, content - both are required for decryption
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

// Turns gibberish to plaintext! (When the secretKey is correct)
const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
    return decrpyted.toString()
}

// sha512(val) function, hashes it's input. (1-way encryption)
const sha512 = x => crypto.createHash('sha512').update(x, 'utf8').digest('hex')

module.exports = {
    encrypt,
    decrypt,
    sha512
}
