import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import { PythonShell } from 'python-shell';
import { ConfigService } from '@nestjs/config';
import { AptosService } from '../aptos/aptos.service';
import { CreateControversyDto } from './dto/controversy.dto';
import { Controversy, ControversyDocument, ControversyStatus } from './schemas/controversy.schema';

@Injectable()
export class TwitterControversyService {
  private readonly logger = new Logger(TwitterControversyService.name);
  private readonly pythonScriptsPath: string;

  constructor(
    @InjectModel(Controversy.name) private controversyModel: Model<ControversyDocument>,
    @Inject(forwardRef(() => AptosService)) private aptosService: AptosService,
    private configService: ConfigService,
  ) {
    this.pythonScriptsPath = path.join(process.cwd(), 'src', 'python');
  }

  async searchControversies(query: string, limit = 50): Promise<ControversyDocument[]> {
    try {
      const result = await this.runPythonScript('scraper.py', ['search', query, limit.toString()]);
      const tweets = JSON.parse(result);
      
      const savedControversies: ControversyDocument[] = [];
      
      for (const tweet of tweets) {
        const controversyData: CreateControversyDto = {
          tweetId: tweet.id,
          text: tweet.text,
          author: tweet.author,
          controversyScore: tweet.controversy_score,
          metrics: {
            replies: tweet.replies,
            retweets: tweet.retweets,
            likes: tweet.likes,
            quotes: tweet.quotes,
          },
        };
        
        const controversy = await this.createOrUpdateControversy(controversyData);
        savedControversies.push(controversy);
      }
      
      return savedControversies;
    } catch (error) {
      this.logger.error(`Error searching controversies: ${error.message}`, error.stack);
      throw new Error('Failed to search for controversies');
    }
  }

  async monitorInfluencer(username: string, limit = 20): Promise<ControversyDocument[]> {
    try {
      const result = await this.runPythonScript('scraper.py', ['monitor', username, limit.toString()]);
      const tweets = JSON.parse(result);
      
      const savedControversies: ControversyDocument[] = [];
      
      for (const tweet of tweets) {
        const controversyData: CreateControversyDto = {
          tweetId: tweet.id,
          text: tweet.text,
          author: tweet.author,
          controversyScore: tweet.controversy_score,
          metrics: {
            replies: tweet.replies,
            retweets: tweet.retweets,
            likes: tweet.likes,
            quotes: tweet.quotes,
          },
        };
        
        const controversy = await this.createOrUpdateControversy(controversyData);
        savedControversies.push(controversy);
      }
      
      return savedControversies;
    } catch (error) {
      this.logger.error(`Error monitoring influencer ${username}: ${error.message}`, error.stack);
      throw new Error(`Failed to monitor influencer: ${username}`);
    }
  }

  async analyzeSentiment(tweetId: string, maxReplies = 50): Promise<any> {
    try {
      // First, get the tweet and its replies
      const replies = await this.getTweetReplies(tweetId, maxReplies);
      
      // Analyze sentiment of the replies
      const result = await this.runPythonScript('analyzer.py', [], JSON.stringify(replies));
      const analysis = JSON.parse(result);
      
      // Update the controversy with the sentiment analysis
      await this.controversyModel.findOneAndUpdate(
        { tweetId },
        { 
          $set: { 
            'sentimentAnalysis': {
              outcome: analysis.outcome,
              avgPolarity: analysis.avg_polarity,
              avgSubjectivity: analysis.avg_subjectivity,
              sampleSize: analysis.sample_size,
            }
          } 
        }
      );
      
      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing sentiment for tweet ${tweetId}: ${error.message}`, error.stack);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async autoCreateMarkets(): Promise<ControversyDocument[]> {
    try {
      const threshold = this.configService.get<number>('CONTROVERSY_THRESHOLD') || 0.5;
      
      const controversies = await this.controversyModel.find({
        status: ControversyStatus.PENDING,
        controversyScore: { $gte: threshold },
      }).sort({ controversyScore: -1 }).limit(10);
      
      const createdMarkets: ControversyDocument[] = [];
      
      for (const controversy of controversies) {
        try {
          const marketDescription = `Will this controversy be resolved positively? ${controversy.text.substring(0, 100)}...`;
          const closingTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
          
          const market = await this.aptosService.createMarket(
            marketDescription,
            ['Yes', 'No'],
            closingTime
          );
          
          controversy.marketId = market.id;
          controversy.status = ControversyStatus.MARKET_CREATED;
          await controversy.save();
          
          createdMarkets.push(controversy);
        } catch (error) {
          this.logger.error(`Error creating market for controversy ${controversy.tweetId}: ${error.message}`, error.stack);
        }
      }
      
      return createdMarkets;
    } catch (error) {
      this.logger.error(`Error in autoCreateMarkets: ${error.message}`, error.stack);
      throw new Error('Failed to create markets automatically');
    }
  }

  async resolveMarket(marketId: string, tweetId: string): Promise<any> {
    try {
      // Get the controversy
      const controversy = await this.controversyModel.findOne({ tweetId });
      if (!controversy) {
        throw new Error(`Controversy not found for tweet ${tweetId}`);
      }
      
      // Analyze sentiment to determine the outcome
      const analysis = await this.analyzeSentiment(tweetId);
      
      // Determine the winning outcome (0 = Yes, 1 = No)
      const winningOutcome = analysis.outcome === 'POSITIVE' ? 0 : 1;
      
      // Resolve the market on the blockchain
      const result = await this.aptosService.resolveMarket(marketId, winningOutcome);
      
      // Update the controversy
      controversy.status = ControversyStatus.RESOLVED;
      controversy.resolvedOutcome = winningOutcome === 0 ? 'Yes' : 'No';
      controversy.resolvedAt = new Date();
      await controversy.save();
      
      return {
        success: true,
        marketId,
        tweetId,
        winningOutcome: controversy.resolvedOutcome,
        transactionHash: result.transactionHash,
        sentimentAnalysis: analysis,
      };
    } catch (error) {
      this.logger.error(`Error resolving market ${marketId}: ${error.message}`, error.stack);
      throw new Error(`Failed to resolve market: ${error.message}`);
    }
  }

  private async createOrUpdateControversy(data: CreateControversyDto): Promise<ControversyDocument> {
    return this.controversyModel.findOneAndUpdate(
      { tweetId: data.tweetId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  private async getTweetReplies(tweetId: string, limit: number): Promise<any[]> {
    try {
      const result = await this.runPythonScript('scraper.py', ['replies', tweetId, limit.toString()]);
      return JSON.parse(result);
    } catch (error) {
      this.logger.error(`Error getting replies for tweet ${tweetId}: ${error.message}`);
      return [];
    }
  }

  private runPythonScript(script: string, args: string[] = [], input?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: any = {
        mode: 'text' as const,
        pythonPath: 'python',
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: this.pythonScriptsPath,
        args: args,
      };

      const pyshell = new PythonShell(script, options);
      let result = '';

      if (input) {
        pyshell.send(input);
      }

      pyshell.on('message', (message: string) => {
        result += message;
      });

      pyshell.end((err) => {
        if (err) {
          this.logger.error(`Python script ${script} error: ${err.message}`, err.stack);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Additional helper methods
  async findAll(query: any = {}): Promise<ControversyDocument[]> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;
    
    return this.controversyModel.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<ControversyDocument | null> {
    return this.controversyModel.findById(id).exec();
  }

  async findByTweetId(tweetId: string): Promise<ControversyDocument | null> {
    return this.controversyModel.findOne({ tweetId }).exec();
  }

  async updateStatus(tweetId: string, status: ControversyStatus): Promise<ControversyDocument | null> {
    return this.controversyModel.findOneAndUpdate(
      { tweetId },
      { $set: { status } },
      { new: true }
    ).exec();
  }

  async deleteControversy(id: string): Promise<ControversyDocument | null> {
    return this.controversyModel.findByIdAndDelete(id).exec();
  }
}
