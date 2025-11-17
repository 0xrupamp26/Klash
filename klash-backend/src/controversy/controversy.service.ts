import { Injectable, Logger } from '@nestjs/common';
import { Tweet } from '../twitterio/twitterio.service';

export interface ControversyResult {
  isControversy: boolean;
  title: string;
  sides: string[];
  confidence: number;
  category: string;
  extractedQuestion?: string;
}

@Injectable()
export class ControversyService {
  private readonly logger = new Logger(ControversyService.name);

  // Keywords that indicate controversy or debate
  private readonly controversyKeywords = [
    '?', 'vs', 'versus', 'better than', 'who would win', 'who is better',
    'should', 'right or wrong', 'debate', 'controversial', 'opinion',
    'which one', 'choose between', 'pick one', 'team', 'side',
    'agree or disagree', 'yes or no', 'true or false'
  ];

  // Polarizing words that indicate strong opinions
  private readonly polarizingWords = [
    'always', 'never', 'worst', 'best', 'terrible', 'amazing',
    'disgusting', 'perfect', 'horrible', 'excellent', 'awful',
    'overrated', 'underrated', 'garbage', 'masterpiece'
  ];

  /**
   * Detect if a tweet contains controversy worth creating a market for
   * @param tweet The tweet to analyze
   * @returns Controversy detection result
   */
  detectControversy(tweet: Tweet): ControversyResult {
    const text = tweet.text.toLowerCase();
    
    // Check for controversy indicators
    const hasQuestion = text.includes('?');
    const hasVs = text.includes('vs') || text.includes('versus');
    const hasComparison = text.includes('better than') || text.includes('who would win');
    const hasPolarizing = this.polarizingWords.some(word => text.includes(word));
    const hasControversyKeyword = this.controversyKeywords.some(keyword => text.includes(keyword));
    
    // Calculate confidence score
    let confidence = 0;
    if (hasQuestion) confidence += 0.3;
    if (hasVs || hasComparison) confidence += 0.4;
    if (hasPolarizing) confidence += 0.2;
    if (hasControversyKeyword) confidence += 0.3;
    
    // Check engagement threshold
    const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
    const hasGoodEngagement = totalEngagement > 1000;
    if (hasGoodEngagement) confidence += 0.2;
    
    const isControversy = confidence >= 0.5 && hasGoodEngagement;
    
    if (!isControversy) {
      return {
        isControversy: false,
        title: '',
        sides: [],
        confidence,
        category: 'culture'
      };
    }
    
    // Extract market title and sides
    const { title, sides, extractedQuestion } = this.extractMarketDetails(tweet.text);
    
    return {
      isControversy: true,
      title,
      sides,
      confidence,
      category: 'culture', // Default for LafdaSinghAI content
      extractedQuestion
    };
  }

  /**
   * Extract market title and opposing sides from tweet text
   * @param text The tweet text
   * @returns Extracted title and sides
   */
  private extractMarketDetails(text: string): { title: string; sides: string[]; extractedQuestion?: string } {
    // Try to extract a clear question
    const questionMatch = text.match(/[^?]*\?/);
    let extractedQuestion = questionMatch ? questionMatch[0].trim() : '';
    
    // Try to identify two opposing sides
    let sides: string[] = [];
    
    // Check for "vs" pattern
    const vsMatch = text.match(/(.+?)\s+(?:vs|versus)\s+(.+?)(?:\s|$|[.!?])/i);
    if (vsMatch) {
      sides = [vsMatch[1].trim(), vsMatch[2].trim()];
    }
    
    // Check for "better than" pattern
    const betterMatch = text.match(/(.+?)\s+better than\s+(.+?)(?:\s|$|[.!?])/i);
    if (betterMatch && sides.length === 0) {
      sides = [betterMatch[1].trim(), betterMatch[2].trim()];
    }
    
    // Check for "who would win" pattern
    const whoMatch = text.match(/who would win\s+(?:between\s+)?(.+?)\s+(?:and|or|vs)\s+(.+?)(?:\s|$|[.!?])/i);
    if (whoMatch && sides.length === 0) {
      sides = [whoMatch[1].trim(), whoMatch[2].trim()];
    }
    
    // Default to Yes/No if no sides found
    if (sides.length === 0) {
      sides = ['Yes', 'No'];
    }
    
    // Clean up sides (remove extra words, keep it simple)
    sides = sides.map(side => {
      // Remove common prefixes
      side = side.replace(/^(is|are|was|were|should|could|would)\s+/i, '');
      // Remove trailing punctuation
      side = side.replace(/[.!?]+$/, '');
      // Keep it concise
      return side.trim().substring(0, 30);
    }).filter(side => side.length > 0);
    
    // Ensure we have exactly 2 sides
    if (sides.length > 2) {
      sides = sides.slice(0, 2);
    } else if (sides.length === 1) {
      sides.push('No');
    }
    
    // Generate title if we couldn't extract a question
    let title = extractedQuestion;
    if (!title) {
      if (sides.length === 2) {
        title = `${sides[0]} vs ${sides[1]}?`;
      } else {
        title = text.substring(0, 100) + (text.length > 100 ? '...' : '');
      }
    }
    
    // Clean up title - make it a proper question
    title = title.trim();
    if (!title.endsWith('?') && !title.endsWith('.')) {
      title += '?';
    }
    
    return { title, sides, extractedQuestion };
  }

  /**
   * Batch process multiple tweets
   * @param tweets Array of tweets to analyze
   * @returns Array of controversy results
   */
  batchDetectControversy(tweets: Tweet[]): ControversyResult[] {
    this.logger.log(`Analyzing ${tweets.length} tweets for controversy`);
    
    const results = tweets.map(tweet => this.detectControversy(tweet));
    const controversies = results.filter(r => r.isControversy);
    
    this.logger.log(`Found ${controversies.length} controversial tweets out of ${tweets.length}`);
    
    return results;
  }

  /**
   * Test the controversy detection with sample tweets
   * @returns Test results
   */
  testControversyDetection(): {
    success: boolean;
    message: string;
    testResults: Array<{ tweet: string; result: ControversyResult }>;
  } {
    const testTweets = [
      "Who is better - Ronaldo or Messi? Let's settle this debate once and for all! #football",
      "This movie is absolutely terrible! The worst I've ever seen. #movieReview",
      "Should pineapple be allowed on pizza? Yes or No? #fooddebate",
      "Just had a great coffee this morning ☕",
      "Team A vs Team B - who would win in a fight? #battle",
    ];

    const testResults = testTweets.map(tweet => ({
      tweet,
      result: this.detectControversy({
        id: 'test',
        text: tweet,
        url: 'https://test.com',
        author: 'test',
        postedAt: new Date(),
        engagement: { likes: 500, retweets: 200, replies: 300 }
      })
    }));

    const controversiesFound = testResults.filter(t => t.result.isControversy).length;
    
    return {
      success: controversiesFound >= 2, // Should find at least 2 controversies
      message: `Controversy detection test completed. Found ${controversiesFound}/5 controversies.`,
      testResults
    };
  }
}
