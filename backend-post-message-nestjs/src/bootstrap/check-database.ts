import mongoose from 'mongoose';

export const checkDatabase = async (uri: string): Promise<boolean> => {
  const conn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 3000,
  });

  try {
    await conn.asPromise();
    await conn.db?.admin().ping();
    return true;
  } catch {
    return false;
  } finally {
    await conn.close();
  }
};
