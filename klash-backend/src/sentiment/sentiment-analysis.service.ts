import { Injectable, Logger } from '@nestjs/common';
import { Tweet } from '../twitterio/twitterio.service';

export interface SentimentAnalysis {
    overall: 'positive' | 'negative' | 'neutral' | 'controversial';
    score: number; // -1 to 1 (negative to positive)
    confidence: number; // 0 to 1
    emotions: {
        anger: number;
        joy: number;
        sadness: number;
        fear: number;
        surprise: number;
    };
    polarization: number; // 0 to 1 (how divisive the content is)
    marketability: number; // 0 to 1 (how suitable for a prediction market)
}

export interface MarketSuggestion {
    question: string;
    outcomes: string[];
    category: string;
    sentiment: SentimentAnalysis;
    reasoning: string;
}

@Injectable()
export class SentimentAnalysisService {
    private readonly logger = new Logger(SentimentAnalysisService.name);

    // Keywords for different emotions
    private readonly emotionKeywords = {
        anger: ['angry', 'furious', 'outraged', 'mad', 'hate', 'disgusting', 'terrible', 'worst', 'awful', 'pathetic'],
        joy: ['happy', 'excited', 'love', 'amazing', 'great', 'best', 'wonderful', 'fantastic', 'awesome', 'brilliant'],
        sadness: ['sad', 'depressed', 'disappointed', 'unfortunate', 'tragic', 'heartbreaking', 'sorry', 'regret'],
        fear: ['scared', 'afraid', 'worried', 'concerned', 'dangerous', 'risky', 'threat', 'warning'],
        surprise: ['shocked', 'surprised', 'unexpected', 'unbelievable', 'wow', 'omg', 'wtf', 'incredible'],
    };

    // Polarizing/controversial indicators
    private readonly controversyIndicators = [
        'vs', 'versus', 'better than', 'worse than',
        'should', 'shouldn\'t', 'must', 'mustn\'t',
        'right or wrong', 'agree or disagree',
        'who would win', 'which is better',
        'team', 'side', 'debate', 'controversial',
        'overrated', 'underrated', 'overhyped',
    ];

    /**
     * Analyze sentiment of a tweet
     */
    analyzeSentiment(tweet: Tweet): SentimentAnalysis {
        const text = tweet.text.toLowerCase();

        // Calculate emotion scores
        const emotions = {
            anger: this.calculateEmotionScore(text, this.emotionKeywords.anger),
            joy: this.calculateEmotionScore(text, this.emotionKeywords.joy),
            sadness: this.calculateEmotionScore(text, this.emotionKeywords.sadness),
            fear: this.calculateEmotionScore(text, this.emotionKeywords.fear),
            surprise: this.calculateEmotionScore(text, this.emotionKeywords.surprise),
        };

        // Calculate overall sentiment score
        const positiveScore = emotions.joy;
        const negativeScore = emotions.anger + emotions.sadness + emotions.fear;
        const sentimentScore = (positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1);

        // Calculate polarization (how divisive/controversial)
        const polarization = this.calculatePolarization(text, tweet);

        // Determine overall sentiment
        let overall: 'positive' | 'negative' | 'neutral' | 'controversial';
        if (polarization > 0.6) {
            overall = 'controversial';
        } else if (sentimentScore > 0.3) {
            overall = 'positive';
        } else if (sentimentScore < -0.3) {
            overall = 'negative';
        } else {
            overall = 'neutral';
        }

        // Calculate confidence based on clarity of signals
        const confidence = this.calculateConfidence(emotions, polarization);

        // Calculate marketability (how good for a prediction market)
        const marketability = this.calculateMarketability(tweet, polarization, overall);

        return {
            overall,
            score: sentimentScore,
            confidence,
            emotions,
            polarization,
            marketability,
        };
    }

    /**
     * Generate market suggestion based on sentiment analysis
     */
    generateMarketSuggestion(tweet: Tweet, sentiment: SentimentAnalysis): MarketSuggestion | null {
        // Only create markets for controversial or highly polarized content
        if (sentiment.marketability < 0.5) {
            return null;
        }

        const text = tweet.text;

        // Extract question and outcomes
        const { question, outcomes, category } = this.extractMarketDetails(text, sentiment);

        // Generate reasoning
        const reasoning = this.generateReasoning(tweet, sentiment);

        return {
            question,
            outcomes,
            category,
            sentiment,
            reasoning,
        };
    }

    /**
     * Batch analyze multiple tweets
     */
    batchAnalyze(tweets: Tweet[]): Array<{ tweet: Tweet; sentiment: SentimentAnalysis; market?: MarketSuggestion }> {
        this.logger.log(`Analyzing sentiment for ${tweets.length} tweets`);

        const results = tweets.map(tweet => {
            const sentiment = this.analyzeSentiment(tweet);
            const market = this.generateMarketSuggestion(tweet, sentiment);

            return { tweet, sentiment, market };
        });

        const marketableCount = results.filter(r => r.market !== null).length;
        this.logger.log(`Found ${marketableCount} marketable tweets out of ${tweets.length}`);

        return results;
    }

    // Private helper methods

    private calculateEmotionScore(text: string, keywords: string[]): number {
        let score = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 1;
            }
        });
        return Math.min(score / keywords.length, 1);
    }

    private calculatePolarization(text: string, tweet: Tweet): number {
        let score = 0;

        // Check for controversy indicators
        this.controversyIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                score += 0.2;
            }
        });

        // Check for question marks (indicates debate)
        if (text.includes('?')) {
            score += 0.3;
        }

        // Check engagement ratio (high engagement = more polarizing)
        const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
        if (totalEngagement > 5000) score += 0.2;
        if (totalEngagement > 10000) score += 0.2;

        // Check for opposing viewpoints in text
        if (text.match(/\b(yes|no)\b.*\b(yes|no)\b/i)) {
            score += 0.3;
        }

        return Math.min(score, 1);
    }

    private calculateConfidence(emotions: any, polarization: number): number {
        // Higher confidence if emotions are clear or polarization is high
        const emotionSum = Object.values(emotions).reduce((a: number, b: number) => a + b, 0) as number;
        const emotionConfidence = Math.min(emotionSum / 2, 1);
        const polarizationConfidence = polarization;

        return (emotionConfidence + polarizationConfidence) / 2;
    }

    private calculateMarketability(tweet: Tweet, polarization: number, overall: string): number {
        let score = 0;

        // Controversial content is highly marketable
        if (overall === 'controversial') {
            score += 0.5;
        }

        // High polarization is good
        score += polarization * 0.3;

        // High engagement is good
        const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
        if (totalEngagement > 1000) score += 0.2;

        // Questions are good for markets
        if (tweet.text.includes('?')) {
            score += 0.2;
        }

        return Math.min(score, 1);
    }

    private extractMarketDetails(text: string, sentiment: SentimentAnalysis): { question: string; outcomes: string[]; category: string } {
        let question = '';
        let outcomes: string[] = [];
        let category = 'culture';

        // Try to extract question
        const questionMatch = text.match(/[^?]*\?/);
        if (questionMatch) {
            question = questionMatch[0].trim();
        }

        // Try to extract opposing sides
        const vsMatch = text.match(/(.+?)\s+(?:vs|versus)\s+(.+?)(?:\s|$|[.!?])/i);
        if (vsMatch) {
            outcomes = [vsMatch[1].trim(), vsMatch[2].trim()];
            question = question || `${outcomes[0]} vs ${outcomes[1]}?`;
        }

        // Default outcomes if none found
        if (outcomes.length === 0) {
            if (sentiment.overall === 'controversial') {
                outcomes = ['Agree', 'Disagree'];
            } else {
                outcomes = ['Yes', 'No'];
            }
        }

        // Generate question if none found
        if (!question) {
            question = text.substring(0, 100) + (text.length > 100 ? '...' : '') + '?';
        }

        // Determine category based on content
        if (text.match(/crypto|bitcoin|eth|blockchain/i)) {
            category = 'crypto';
        } else if (text.match(/tech|ai|software|code/i)) {
            category = 'technology';
        } else if (text.match(/politics|election|government/i)) {
            category = 'politics';
        } else if (text.match(/sports|game|match/i)) {
            category = 'sports';
        }

        return { question, outcomes, category };
    }

    private generateReasoning(tweet: Tweet, sentiment: SentimentAnalysis): string {
        const reasons: string[] = [];

        if (sentiment.overall === 'controversial') {
            reasons.push('Highly controversial content detected');
        }

        if (sentiment.polarization > 0.7) {
            reasons.push('Strong polarization in the discussion');
        }

        const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
        if (totalEngagement > 5000) {
            reasons.push(`High engagement (${totalEngagement.toLocaleString()} interactions)`);
        }

        if (sentiment.emotions.anger > 0.5) {
            reasons.push('Strong emotional reactions detected');
        }

        if (tweet.text.includes('?')) {
            reasons.push('Question format suitable for prediction');
        }

        return reasons.join('. ') + '.';
    }
}
