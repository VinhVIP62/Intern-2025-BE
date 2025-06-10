export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/sport-hub',
  },
}); 