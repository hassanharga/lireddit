import argon from 'argon2';

export const encryptData = async (value: string): Promise<string> => {
  return await argon.hash(value);
};

export const decryptData = async (hash: string, value: string): Promise<boolean> => {
  return await argon.verify(hash, value);
};
