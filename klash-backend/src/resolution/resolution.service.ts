import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { TwitterService } from '../twitter/twitter.service';
import { AllocationService } from '../allocation/allocation.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ResolutionService implements OnModuleInit {
  private readonly logger = new Logger(ResolutionService.name);
  private readonly PYTHON_PATH = path.join(__dirname, '../../python');

  constructor(
    @InjectModel('Market') private marketModel: any,
    @InjectModel('Bet') private betModel: any,
    @InjectModel('TweetAnalysis') private tweetAnalysisModel: any,
    private readonly twitterService: TwitterService,
    private readonly allocationService: AllocationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Resolution service initialized');
  }

  async resolveMarket(marketId: string): Promise<ResolutionResult> {
    const startTime = Date.now();
    this.logger.log(`Starting resolution for market ${marketId}`);

    try {
      // 1. Verify market exists and is ready for resolution
      const market = await this.marketModel.findOne({
        marketId,
        status: 'OPEN',
        closingTime: { $lt: new Date() },
      });

      if (!market) {
        throw new Error('Market not found or not ready for resolution');
      }

      // 2. Fetch and analyze replies
      const analysis = await this.analyzeReplies(
        market.originalTweetId,
        market.question,
        market.outcomes,
      );

      // 3. Determine winner
      const { outcome, confidence, method } = this.determineWinner(
        analysis.sentimentResults,
        analysis.teamResults,
        market,
      );

      // 4. Update market status
      const resolutionTime = new Date();
      const updateData = {
        status: 'RESOLVED',
        winningOutcome: outcome,
        resolutionTime,
        resolutionData: {
          method,
          confidence,
          sentimentScore: analysis.sentimentResults.avgPolarity,
          teamASupport: analysis.teamResults.teamASupport,
          teamBSupport: analysis.teamResults.teamBSupport,
          sampleSize: analysis.qualityMetrics.validReplies,
          aiModel: 'FinBERT + Zero-Shot',
          processingTime: Date.now() - startTime,
        },
      };

      await this.marketModel.updateOne({ marketId }, updateData);

      // 5. Trigger allocation
      await this.allocationService.resolveMarket(
        marketId,
        outcome,
        resolutionTime.getTime(),
      );

      return {
        marketId,
        winningOutcome: outcome,
        confidence,
        method,
        sentimentData: {
          avgPolarity: analysis.sentimentResults.avgPolarity,
          avgConfidence: analysis.sentimentResults.avgConfidence,
          sampleSize: analysis.qualityMetrics.validReplies,
        },
        teamData: {
          teamASupport: analysis.teamResults.teamASupport,
          teamBSupport: analysis.teamResults.teamBSupport,
          totalClassified: analysis.qualityMetrics.validReplies,
        },
        timestamp: new Date(),
        resolutionTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Failed to resolve market ${marketId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private determineWinner(
    sentimentData: any,
    teamData: any,
    market: any,
  ): { outcome: number; confidence: number; method: string } {
    // Method 1: Team Classification
    const teamASupport = teamData.teamASupport || 0;
    const teamBSupport = teamData.teamBSupport || 0;
    const total = teamASupport + teamBSupport;
    
    if (total > 0) {
      const teamARatio = teamASupport / total;
      const teamBRatio = teamBSupport / total;

      if (teamARatio > 0.65) {
        return {
          outcome: 0,
          confidence: teamARatio,
          method: 'TEAM_CLASSIFICATION',
        };
      }

      if (teamBRatio > 0.65) {
        return {
          outcome: 1,
          confidence: teamBRatio,
          method: 'TEAM_CLASSIFICATION',
        };
      }
    }

    // Method 2: Sentiment Analysis
    const polarity = sentimentData.avgPolarity || 0;
    if (Math.abs(polarity) > 0.3) {
      return {
        outcome: polarity > 0 ? 0 : 1,
        confidence: Math.min(0.8, Math.abs(polarity) * 2), // Scale to 0-0.8 range
        method: 'SENTIMENT',
      };
    }

    // Method 3: Hybrid Score
    const teamScore = (teamASupport - teamBSupport) / (teamASupport + teamBSupport + 1);
    const sentimentScore = polarity * 2; // Scale to -2 to 2
    const combinedScore = teamScore * 0.6 + sentimentScore * 0.4;

    if (Math.abs(combinedScore) > 0.55) {
      return {
        outcome: combinedScore > 0 ? 0 : 1,
        confidence: Math.min(0.7, Math.abs(combinedScore)),
        method: 'HYBRID',
      };
    }

    // Fallback: Manual resolution needed
    return {
      outcome: -1,
      confidence: 0,
      method: 'MANUAL',
    };
  }

  private async analyzeReplies(
    tweetId: string,
    question: string,
    outcomes: string[],
  ): Promise<AnalysisData> {
    // 1. Fetch replies
    const replies = await this.twitterService.getTweetReplies(tweetId, 200);
    
    // 2. Filter and prepare data
    const validReplies = replies
      .filter(reply => 
        reply.text.length >= 10 && // Minimum length
        !reply.isRetweet && // No retweets
        reply.user.followersCount > 10 // Minimum followers
      )
      .map(reply => ({
        id: reply.id,
        text: reply.text,
        author: reply.user.screenName,
        followers: reply.user.followersCount,
        createdAt: reply.createdAt,
      }));

    if (validReplies.length < 50) {
      throw new Error(`Insufficient data: Only ${validReplies.length} valid replies found`);
    }

    // 3. Run sentiment analysis
    const sentimentResults = await this.runSentimentAnalysis(validReplies);
    
    // 4. Run team classification
    const teamResults = await this.runTeamClassification(
      validReplies.map(r => r.text),
      question,
      outcomes,
    );

    // 5. Store analysis
    const analysisDocs = validReplies.map((reply, i) => ({
      tweetId: reply.id,
      marketId: tweetId, // Using tweetId as marketId for simplicity
      text: reply.text,
      author: reply.author,
      sentiment: {
        label: sentimentResults.labels[i],
        polarity: sentimentResults.scores[i],
        confidence: sentimentResults.confidences[i],
      },
      teamClassification: teamResults.labels[i],
      classificationConfidence: teamResults.confidences[i],
      authorMetrics: {
        followers: reply.followers,
        verified: false, // Add verification status if available
      },
      analyzedAt: new Date(),
    }));

    await this.tweetAnalysisModel.insertMany(analysisDocs);

    return {
      sentimentResults: {
        avgPolarity: sentimentResults.avgPolarity,
        avgConfidence: sentimentResults.avgConfidence,
        sampleSize: validReplies.length,
      },
      teamResults: {
        teamASupport: teamResults.teamASupport,
        teamBSupport: teamResults.teamBSupport,
      },
      qualityMetrics: {
        totalReplies: replies.length,
        validReplies: validReplies.length,
        filteredSpam: replies.length - validReplies.length,
        avgConfidence: (sentimentResults.avgConfidence + teamResults.avgConfidence) / 2,
      },
    };
  }

  private async runSentimentAnalysis(replies: any[]): Promise<{
    labels: string[];
    scores: number[];
    confidences: number[];
    avgPolarity: number;
    avgConfidence: number;
  }> {
    return new Promise((resolve, reject) => {
      const pyshell = new PythonShell(
        path.join(this.PYTHON_PATH, 'sentiment_hf.py'),
        { mode: 'json' }
      );

      pyshell.send(JSON.stringify({
        texts: replies.map(r => r.text)
      }));

      let result = '';
      pyshell.on('message', (message) => {
        result += message;
      });

      pyshell.end((err) => {
        if (err) {
          reject(new Error(`Sentiment analysis failed: ${err.message}`));
          return;
        }

        try {
          const data = JSON.parse(result);
          const scores = data.predictions.map((p: any) => p.score * (p.label === 'positive' ? 1 : -1));
          const confidences = data.predictions.map((p: any) => p.confidence);
          
          resolve({
            labels: data.predictions.map((p: any) => p.label),
            scores,
            confidences,
            avgPolarity: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
            avgConfidence: confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length,
          });
        } catch (e) {
          reject(new Error(`Failed to parse sentiment results: ${e.message}`));
        }
      });
    });
  }

  private async runTeamClassification(
    texts: string[],
    question: string,
    outcomes: string[],
  ): Promise<{
    labels: string[];
    confidences: number[];
    teamASupport: number;
    teamBSupport: number;
    avgConfidence: number;
  }> {
    return new Promise((resolve, reject) => {
      const pyshell = new PythonShell(
        path.join(this.PYTHON_PATH, 'team_classifier.py'),
        { mode: 'json' }
      );

      pyshell.send(JSON.stringify({
        texts,
        question,
        candidate_labels: outcomes,
      }));

      let result = '';
      pyshell.on('message', (message) => {
        result += message;
      });

      pyshell.end((err) => {
        if (err) {
          reject(new Error(`Team classification failed: ${err.message}`));
          return;
        }

        try {
          const data = JSON.parse(result);
          const teamACount = data.labels.filter((l: string) => l === outcomes[0]).length;
          const teamBCount = data.labels.filter((l: string) => l === outcomes[1]).length;
          const total = teamACount + teamBCount;
          
          resolve({
            labels: data.labels,
            confidences: data.confidences,
            teamASupport: teamACount / total,
            teamBSupport: teamBCount / total,
            avgConfidence: data.confidences.reduce((a: number, b: number) => a + b, 0) / data.confidences.length,
          });
        } catch (e) {
          reject(new Error(`Failed to parse classification results: ${e.message}`));
        }
      });
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleAutoResolution() {
    this.logger.log('Running scheduled market resolution check');
    
    const markets = await this.marketModel.find({
      status: 'OPEN',
      closingTime: { $lt: new Date() },
      $or: [
        { resolutionAttempts: { $exists: false } },
        { resolutionAttempts: { $lt: 3 } },
      ],
    }).limit(50);

    for (const market of markets) {
      try {
        await this.resolveMarket(market.marketId);
        this.logger.log(`Successfully resolved market ${market.marketId}`);
      } catch (error) {
        const attempts = (market.resolutionAttempts || 0) + 1;
        await this.marketModel.updateOne(
          { marketId: market.marketId },
          { 
            $set: { 
              resolutionAttempts: attempts,
              lastResolutionAttempt: new Date(),
              resolutionError: error.message,
            } 
          }
        );
        this.logger.error(`Failed to resolve market ${market.marketId} (attempt ${attempts}): ${error.message}`);
      }
    }
  }

  async manualResolve(marketId: string, outcome: number, reason: string, adminAddress: string) {
    if (!reason || reason.length < 50) {
      throw new Error('Resolution reason must be at least 50 characters');
    }

    const market = await this.marketModel.findOne({ marketId });
    if (!market) {
      throw new Error('Market not found');
    }

    // Update market
    await this.marketModel.updateOne(
      { marketId },
      {
        status: 'RESOLVED',
        winningOutcome: outcome,
        resolutionTime: new Date(),
        'resolutionData.method': 'MANUAL',
        'resolutionData.adminOverride': true,
        'resolutionData.overrideReason': reason,
        'resolutionData.performedBy': adminAddress,
      }
    );

    // Log resolution
    await this.tweetAnalysisModel.create({
      marketId,
      isSpam: false,
      text: `Admin override: ${reason}`,
      author: adminAddress,
      analyzedAt: new Date(),
      isAdminOverride: true,
    });

    // Trigger allocation
    await this.allocationService.resolveMarket(
      marketId,
      outcome,
      Date.now(),
    );
  }
}

// Interfaces
export interface ResolutionResult {
  marketId: string;
  winningOutcome: number;
  confidence: number;
  method: 'TEAM_CLASSIFICATION' | 'SENTIMENT' | 'HYBRID' | 'MANUAL';
  sentimentData: {
    avgPolarity: number;
    avgConfidence: number;
    sampleSize: number;
  };
  teamData: {
    teamASupport: number;
    teamBSupport: number;
    totalClassified: number;
  };
  timestamp: Date;
  resolutionTime: number;
}

interface AnalysisData {
  sentimentResults: any;
  teamResults: any;
  qualityMetrics: {
    totalReplies: number;
    validReplies: number;
    filteredSpam: number;
    avgConfidence: number;
  };
}
