import { Injectable, Logger } from '@nestjs/common';
import { ResolutionService } from '../resolution/resolution.service';
import { Market } from '../schemas/market.schema';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

interface TestCase {
  name: string;
  tweet: {
    id: string;
    text: string;
    author: string;
    createdAt: string;
  };
  expectedOutcome: number;
  expectedConfidence: number;
  expectedMethod: string;
  description: string;
}

@Injectable()
export class ResolutionTester {
  private readonly logger = new Logger(ResolutionTester.name);
  private readonly TEST_DATA_DIR = join(__dirname, '../../testdata');
  
  constructor(
    private readonly resolutionService: ResolutionService,
    @InjectModel('Market') private marketModel: Model<Market>,
  ) {}

  async runTests(): Promise<{
    total: number;
    passed: number;
    failed: number;
    results: Array<{
      name: string;
      passed: boolean;
      details: any;
    }>;
  }> {
    const testCases = await this.loadTestCases();
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.runTestCase(testCase);
        results.push(result);
        
        if (result.passed) {
          this.logger.log(`✅ PASSED: ${testCase.name}`);
        } else {
          this.logger.warn(`❌ FAILED: ${testCase.name} - ${result.details.reason}`);
        }
      } catch (error) {
        this.logger.error(`❌ ERROR in test '${testCase.name}': ${error.message}`, error.stack);
        results.push({
          name: testCase.name,
          passed: false,
          details: {
            error: error.message,
            stack: error.stack,
          },
        });
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      total: results.length,
      passed,
      failed,
      results,
    };
  }

  private async runTestCase(testCase: TestCase) {
    // Create test market
    const market = await this.createTestMarket(testCase);
    
    try {
      // Run resolution
      const result = await this.resolutionService.resolveMarket(market.marketId);
      
      // Verify results
      const isOutcomeMatch = result.winningOutcome === testCase.expectedOutcome;
      const isConfidenceSufficient = result.confidence >= testCase.expectedConfidence;
      const isMethodMatch = result.method === testCase.expectedMethod;
      
      const passed = isOutcomeMatch && isConfidenceSufficient && isMethodMatch;
      
      return {
        name: testCase.name,
        passed,
        details: {
          expected: {
            outcome: testCase.expectedOutcome,
            confidence: testCase.expectedConfidence,
            method: testCase.expectedMethod,
          },
          actual: {
            outcome: result.winningOutcome,
            confidence: result.confidence,
            method: result.method,
          },
          reason: !passed ? this.getFailureReason({
            isOutcomeMatch,
            isConfidenceSufficient,
            isMethodMatch,
          }) : 'All assertions passed',
          marketId: market.marketId,
        },
      };
    } finally {
      // Clean up
      await this.marketModel.deleteOne({ marketId: market.marketId });
    }
  }

  private getFailureReason(checks: {
    isOutcomeMatch: boolean;
    isConfidenceSufficient: boolean;
    isMethodMatch: boolean;
  }): string {
    const reasons = [];
    if (!checks.isOutcomeMatch) reasons.push('outcome mismatch');
    if (!checks.isConfidenceSufficient) reasons.push('insufficient confidence');
    if (!checks.isMethodMatch) reasons.push('incorrect resolution method');
    return reasons.join(', ');
  }

  private async createTestMarket(testCase: TestCase): Promise<Market> {
    const market = new this.marketModel({
      marketId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: `Test Market: ${testCase.name}`,
      outcomes: ['Option A', 'Option B'],
      originalTweetId: testCase.tweet.id,
      originalTweetText: testCase.tweet.text,
      originalTweetAuthor: testCase.tweet.author,
      status: 'OPEN',
      closingTime: new Date(),
      metadata: {
        category: 'TEST',
        tags: ['test', 'automated'],
        controversyScore: 0.8,
        createdBy: 'test-runner',
      },
    });
    
    return market.save();
  }

  private async loadTestCases(): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    const testFiles = readdirSync(this.TEST_DATA_DIR)
      .filter(file => file.endsWith('.json') && file.startsWith('testcase_'));
    
    for (const file of testFiles) {
      try {
        const content = readFileSync(join(this.TEST_DATA_DIR, file), 'utf-8');
        const testCase = JSON.parse(content);
        testCases.push(testCase);
      } catch (error) {
        this.logger.error(`Error loading test case from ${file}: ${error.message}`);
      }
    }
    
    // Add default test cases if none found
    if (testCases.length === 0) {
      testCases.push(...this.getDefaultTestCases());
    }
    
    return testCases;
  }

  private getDefaultTestCases(): TestCase[] {
    return [
      {
        name: 'Clear Winner - Team A',
        tweet: {
          id: 'test_tweet_1',
          text: 'Team A is clearly the best! #TeamA',
          author: 'test_user',
          createdAt: new Date().toISOString(),
        },
        expectedOutcome: 0,
        expectedConfidence: 0.7,
        expectedMethod: 'TEAM_CLASSIFICATION',
        description: 'Should identify clear winner based on team classification',
      },
      {
        name: 'Sentiment Based Resolution',
        tweet: {
          id: 'test_tweet_2',
          text: 'The new policy is amazing! #politics',
          author: 'test_user',
          createdAt: new Date().toISOString(),
        },
        expectedOutcome: 0,
        expectedConfidence: 0.6,
        expectedMethod: 'SENTIMENT',
        description: 'Should resolve based on sentiment analysis',
      },
      {
        name: 'Hybrid Resolution',
        tweet: {
          id: 'test_tweet_3',
          text: 'This is a close call between the two options',
          author: 'test_user',
          createdAt: new Date().toISOString(),
        },
        expectedOutcome: 0, // or 1 based on your hybrid logic
        expectedConfidence: 0.55,
        expectedMethod: 'HYBRID',
        description: 'Should use hybrid scoring when no clear winner',
      },
      {
        name: 'Insufficient Data',
        tweet: {
          id: 'test_tweet_4',
          text: 'Not enough data here',
          author: 'test_user',
          createdAt: new Date().toISOString(),
        },
        expectedOutcome: -1,
        expectedConfidence: 0,
        expectedMethod: 'MANUAL',
        description: 'Should require manual resolution for insufficient data',
      },
      {
        name: 'Edge Case - Tied Sentiment',
        tweet: {
          id: 'test_tweet_5',
          text: 'Both options have equal merit',
          author: 'test_user',
          createdAt: new Date().toISOString(),
        },
        expectedOutcome: -1,
        expectedConfidence: 0,
        expectedMethod: 'MANUAL',
        description: 'Should require manual resolution for tied sentiment',
      },
    ];
  }
}
