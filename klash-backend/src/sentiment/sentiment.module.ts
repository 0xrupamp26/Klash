import { Module } from '@nestjs/common';
import { SentimentAnalysisService } from './sentiment-analysis.service';

@Module({
    providers: [SentimentAnalysisService],
    exports: [SentimentAnalysisService],
})
export class SentimentModule { }
