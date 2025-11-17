import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import * as PythonShell from 'python-shell';
import { TwitterService } from './twitter.service';
import { Market } from './schemas/market.schema';
import { TweetAnalysis } from './schemas/tweet-analysis.schema';

// Mock PythonShell
jest.mock('python-shell');

// Mock models
const mockMarketModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockTweetAnalysisModel = {
  find: jest.fn(),
  create: jest.fn(),
};

describe('TwitterService', () => {
  let service: TwitterService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitterService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                TWITTER_API_KEY: 'test-api-key',
                PYTHON_PATH: 'python',
              };
              return config[key];
            }),
          },
        },
        {
          provide: getModelToken(Market.name),
          useValue: mockMarketModel,
        },
        {
          provide: getModelToken(TweetAnalysis.name),
          useValue: mockTweetAnalysisModel,
        },
      ],
    }).compile();

    service = module.get<TwitterService>(TwitterService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeSentimentHF', () => {
    it('should analyze sentiment successfully', async () => {
      const mockTweets = [
        { id: '1', text: 'Bitcoin is going to the moon! 🚀' },
        { id: '2', text: 'I hate this market crash' },
      ];

      const mockResult = {
        outcome: 'POSITIVE',
        avgPolarity: 0.8,
        avgConfidence: 0.95,
        sampleSize: 2,
        detailedSentiments: [
          { tweetId: '1', sentiment: 'positive', confidence: 0.9, polarity: 0.9 },
          { tweetId: '2', sentiment: 'negative', confidence: 0.8, polarity: -0.7 },
        ],
      };

      // Mock PythonShell
      const mockPythonShell = {
        send: jest.fn(),
        end: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'message') {
            callback(JSON.stringify(mockResult));
          }
          if (event === 'close') {
            callback(0);
          }
          return mockPythonShell;
        }),
      };

      (PythonShell.PythonShell as jest.Mock).mockImplementation(() => mockPythonShell);

      const result = await service.analyzeSentimentHF(mockTweets);

      expect(PythonShell.PythonShell).toHaveBeenCalled();
      expect(mockPythonShell.send).toHaveBeenCalledWith(JSON.stringify(mockTweets));
      expect(result).toEqual(mockResult);
    });

    it('should handle Python script errors', async () => {
      const mockTweets = [{ id: '1', text: 'Test tweet' }];
      const errorMessage = 'Python script error';

      const mockPythonShell = {
        send: jest.fn(),
        end: jest.fn(),
        on: jest.fn().mockImplementation((event, errorCallback) => {
          if (event === 'error') {
            errorCallback(new Error(errorMessage));
          }
          return mockPythonShell;
        }),
      };

      (PythonShell.PythonShell as jest.Mock).mockImplementation(() => mockPythonShell);

      await expect(service.analyzeSentimentHF(mockTweets)).rejects.toThrow(
        `Sentiment analysis failed: ${errorMessage}`,
      );
    });
  });

  describe('classifyTeams', () => {
    it('should classify teams successfully', async () => {
      const mockInput = {
        controversy: 'Is Bitcoin better than Ethereum?',
        teams: ['Bitcoin', 'Ethereum'],
        tweets: [
          { id: '1', text: 'Bitcoin is the future' },
          { id: '2', text: 'Ethereum has better tech' },
        ],
      };

      const mockResult = {
        controversy: mockInput.controversy,
        winningTeam: 'Bitcoin',
        teamStats: {
          Bitcoin: { count: 1, percentage: 50, avgConfidence: 0.9, supporters: [] },
          Ethereum: { count: 1, percentage: 50, avgConfidence: 0.85, supporters: [] },
        },
        totalClassified: 2,
      };

      const mockPythonShell = {
        send: jest.fn(),
        end: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'message') {
            callback(JSON.stringify(mockResult));
          }
          if (event === 'close') {
            callback(0);
          }
          return mockPythonShell;
        }),
      };

      (PythonShell.PythonShell as jest.Mock).mockImplementation(() => mockPythonShell);

      const result = await service.classifyTeams(
        mockInput.controversy,
        mockInput.tweets,
        mockInput.teams,
      );

      expect(PythonShell.PythonShell).toHaveBeenCalled();
      expect(mockPythonShell.send).toHaveBeenCalledWith(JSON.stringify({
        controversy: mockInput.controversy,
        teams: mockInput.teams,
        tweets: mockInput.tweets,
      }));
      expect(result).toEqual(mockResult);
    });
  });

  describe('resolveMarket', () => {
    const mockMarketId = 'market-123';
    const mockMarket = {
      marketId: mockMarketId,
      question: 'Will Bitcoin hit $100k by 2025?',
      outcomes: ['Yes', 'No'],
      originalTweetId: 'tweet-123',
      status: 'OPEN',
      closingTime: new Date(Date.now() + 86400000), // Tomorrow
      save: jest.fn().mockResolvedValue(true),
    };

    const mockReplyTweets = [
      { id: 'reply-1', text: 'Yes, Bitcoin will hit $100k!', author: 'user1' },
      { id: 'reply-2', text: 'No way, it will crash', author: 'user2' },
    ];

    const mockResolutionResult = {
      marketId: mockMarketId,
      winningOutcome: 'Yes',
      winningIndex: 0,
      confidence: 0.75,
      sentimentBreakdown: {
        Yes: { count: 3, percentage: 75, avgConfidence: 0.8 },
        No: { count: 1, percentage: 25, avgConfidence: 0.7 },
        total_analyzed: 4,
      },
    };

    beforeEach(() => {
      mockMarketModel.findOne.mockResolvedValue(mockMarket);
      jest.spyOn(service as any, 'getReplyTweets').mockResolvedValue(mockReplyTweets);
    });

    it('should resolve market successfully', async () => {
      const mockPythonShell = {
        send: jest.fn(),
        end: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'message') {
            callback(JSON.stringify(mockResolutionResult));
          }
          if (event === 'close') {
            callback(0);
          }
          return mockPythonShell;
        }),
      };

      (PythonShell.PythonShell as jest.Mock).mockImplementation(() => mockPythonShell);

      const result = await service.resolveMarket(mockMarketId);

      expect(mockMarketModel.findOne).toHaveBeenCalledWith({ marketId: mockMarketId });
      expect(PythonShell.PythonShell).toHaveBeenCalled();
      expect(mockMarket.status).toBe('RESOLVED');
      expect(mockMarket.winningOutcome).toBe(mockResolutionResult.winningOutcome);
      expect(mockMarket.winningIndex).toBe(mockResolutionResult.winningIndex);
      expect(mockMarket.resolutionTime).toBeDefined();
      expect(mockMarket.save).toHaveBeenCalled();
      expect(result).toEqual(mockResolutionResult);
    });

    it('should throw error if market not found', async () => {
      mockMarketModel.findOne.mockResolvedValue(null);
      await expect(service.resolveMarket('nonexistent')).rejects.toThrow('Market nonexistent not found');
    });

    it('should throw error if market already resolved', async () => {
      mockMarketModel.findOne.mockResolvedValue({ ...mockMarket, status: 'RESOLVED' });
      await expect(service.resolveMarket(mockMarketId)).rejects.toThrow(
        `Market ${mockMarketId} is already resolved`,
      );
    });
  });

  describe('autoResolveExpiredMarkets', () => {
    const mockExpiredMarkets = [
      {
        marketId: 'market-1',
        question: 'Market 1',
        status: 'OPEN',
        closingTime: new Date(Date.now() - 1000), // Past time
        save: jest.fn().mockResolvedValue(true),
      },
      {
        marketId: 'market-2',
        question: 'Market 2',
        status: 'OPEN',
        closingTime: new Date(Date.now() - 2000), // Past time
        save: jest.fn().mockResolvedValue(true),
      },
    ];

    beforeEach(() => {
      mockMarketModel.find.mockResolvedValue(mockExpiredMarkets);
      jest.spyOn(service as any, 'resolveMarket').mockImplementation(async (marketId) => {
        if (marketId === 'market-1') {
          return { success: true };
        }
        throw new Error('Resolution failed');
      });
    });

    it('should resolve all expired markets', async () => {
      await service.autoResolveExpiredMarkets();

      expect(mockMarketModel.find).toHaveBeenCalledWith({
        status: 'OPEN',
        closingTime: { $lt: expect.any(Date) },
      });

      expect(service['resolveMarket']).toHaveBeenCalledTimes(2);
      expect(service['resolveMarket']).toHaveBeenCalledWith('market-1');
      expect(service['resolveMarket']).toHaveBeenCalledWith('market-2');

      // First market should be resolved successfully
      expect(mockExpiredMarkets[0].status).toBe('RESOLVED');
      
      // Second market should be closed due to resolution failure
      expect(mockExpiredMarkets[1].status).toBe('CLOSED');
    });
  });
});
