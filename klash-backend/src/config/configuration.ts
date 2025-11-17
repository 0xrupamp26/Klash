interface TwitterConfig {
  apiKey: string;
  baseUrl: string;
  userId: string;
}

interface TwitterIOConfig {
  apiKey: string;
  userId: string;
}

export interface ConfigType {
  port: number;
  nodeEnv: string;
  twitter: TwitterConfig;
  twitterIO: TwitterIOConfig;
}

export default (): ConfigType => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    baseUrl: process.env.TWITTER_API_BASE_URL || 'https://api.twitterapi.io',
    userId: process.env.TWITTER_USER_ID || '375181867554050048',
  },
  twitterIO: {
    apiKey: process.env.TWITTER_IO_API_KEY || '',
    userId: process.env.TWITTER_IO_USER_ID || '375181867554050048',
  },
});
