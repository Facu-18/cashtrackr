import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword; 
};

export const checkPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
}