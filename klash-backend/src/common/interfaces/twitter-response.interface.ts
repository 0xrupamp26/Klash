export interface Tweet {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  referenced_tweets?: Array<{
    type: string;
    id: string;
  }>;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  description?: string;
  profile_image_url?: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified: boolean;
  created_at: string;
}

export interface TrendingTopic {
  name: string;
  url: string;
  tweet_volume?: number;
  promoted_content?: string | null;
  query: string;
}

export interface TwitterApiResponse<T> {
  data: T;
  meta?: {
    newest_id?: string;
    oldest_id?: string;
    result_count: number;
    next_token?: string;
  };
  errors?: Array<{
    value: string;
    detail: string;
    title: string;
    resource_type: string;
    parameter: string;
    resource_id: string;
    type: string;
  }>;
}
