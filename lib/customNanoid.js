const { customAlphabet } = require('nanoid');

const customNanoid = customAlphabet('1234567890qwertyuiopsdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM', 4);

const nanoid = () => `${customNanoid()}-${customNanoid()}-${customNanoid()}`;

module.exports = nanoid;
