import { Injectable } from '@nestjs/common';
import { TwitterService } from '../twitter/twitter.service';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TwitterDataCollector {
  private readonly TEST_DATA_DIR = join(__dirname, '../../testdata');
  
  constructor(private readonly twitterService: TwitterService) {
    if (!existsSync(this.TEST_DATA_DIR)) {
      mkdirSync(this.TEST_DATA_DIR, { recursive: true });
    }
  }

  async collectTestData(queries: string[], samplesPerQuery = 10): Promise<void> {
    const allResults = [];
    
    for (const query of queries) {
      try {
        this.log(`Searching for tweets with query: ${query}`);
        const tweets = await this.twitterService.searchTweets(query, samplesPerQuery);
        
        for (const tweet of tweets) {
          try {
            const replies = await this.twitterService.getTweetReplies(tweet.id_str, 100);
            const controversyScore = this.calculateControversyScore(tweet, replies);
            
            if (controversyScore > 0.4) {
              allResults.push({
                tweetId: tweet.id_str,
                text: tweet.full_text || tweet.text,
                author: tweet.user.screen_name,
                createdAt: tweet.created_at,
                replies: replies.map(r => ({
                  id: r.id_str,
                  text: r.full_text || r.text,
                  author: r.user.screen_name,
                  createdAt: r.created_at,
                  metrics: {
                    likes: r.favorite_count,
                    retweets: r.retweet_count,
                    replies: r.reply_count
                  }
                })),
                metrics: {
                  likes: tweet.favorite_count,
                  retweets: tweet.retweet_count,
                  replies: tweet.reply_count,
                  controversyScore
                },
                searchQuery: query,
                collectedAt: new Date().toISOString()
              });
              this.log(`Collected data for tweet: ${tweet.id_str} (Score: ${controversyScore.toFixed(2)})`);
            }
          } catch (error) {
            this.error(`Error processing tweet ${tweet.id_str}: ${error.message}`);
          }
        }
      } catch (error) {
        this.error(`Error with query '${query}': ${error.message}`);
      }
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `twitter_testdata_${timestamp}.json`;
    const filepath = join(this.TEST_DATA_DIR, filename);
    
    writeFileSync(filepath, JSON.stringify(allResults, null, 2));
    this.log(`Test data saved to ${filepath}`);
    
    return allResults;
  }

  private calculateControversyScore(tweet: any, replies: any[]): number {
    if (replies.length < 10) return 0;
    
    // Engagement metrics
    const totalEngagement = tweet.favorite_count + tweet.retweet_count + tweet.reply_count;
    const replyEngagement = replies.reduce((sum, r) => sum + r.favorite_count + r.retweet_count, 0);
    
    // Author diversity
    const uniqueAuthors = new Set(replies.map(r => r.user.id_str));
    const authorDiversity = uniqueAuthors.size / replies.length;
    
    // Sentiment variance (simplified)
    const sentimentVariance = Math.random() * 0.5 + 0.1; // Placeholder
    
    // Calculate final score (0-1)
    const score = Math.min(1, 
      (totalEngagement * 0.3) / 1000 + 
      (replyEngagement * 0.4) / (replies.length * 10) + 
      (authorDiversity * 0.2) + 
      (sentimentVariance * 0.1)
    );
    
    return Math.round(score * 100) / 100;
  }

  private log(message: string): void {
    console.log(`[TwitterDataCollector] ${new Date().toISOString()} - ${message}`);
  }

  private error(message: string): void {
    console.error(`[TwitterDataCollector] ${new Date().toISOString()} - ERROR: ${message}`);
  }
}
