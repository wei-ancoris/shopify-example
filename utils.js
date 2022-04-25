export const base64Encode = (_str) => Buffer.from(_str).toString('base64');
export const base64Decode = (_str) => Buffer.from(_str, 'base64').toString('utf-8');