import { webcrypto } from "crypto";

export const createRandToken = (length) => {
  const array = webcrypto.getRandomValues(new Uint16Array(length));
  let authenticode = "";
  for (let i = 0; i < length; ++i) {
    const number = array[i] % 36;
    authenticode += number.toString(36);
  }
  return authenticode.toUpperCase();
};
