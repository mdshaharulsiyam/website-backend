import bcrypt from "bcrypt";

const hashText = async (text: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(text, salt);
};

export default hashText;
