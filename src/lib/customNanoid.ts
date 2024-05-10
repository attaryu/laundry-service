import { customAlphabet } from 'nanoid';

const customNanoid = customAlphabet('1234567890qwertyuiopsdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM', 4);

const nanoid = () => `${customNanoid()}-${customNanoid()}-${customNanoid()}`;

export default nanoid;