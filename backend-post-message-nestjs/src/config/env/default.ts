export default {
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.DB_URI || 'mongodb://mongo_db:27017/nest-lab',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
