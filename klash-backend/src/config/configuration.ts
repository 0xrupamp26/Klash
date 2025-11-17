interface TwitterConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ConfigType {
  port: number;
  nodeEnv: string;
  twitter: TwitterConfig;
}

export default (): ConfigType => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    baseUrl: process.env.TWITTER_API_BASE_URL || 'https://api.twitterapi.io',
  },
});
