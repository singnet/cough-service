import { customAlphabet } from "nanoid";

export const generateId = () => {
  const nanoid = customAlphabet("1234567890", 8);
  return nanoid();
};
