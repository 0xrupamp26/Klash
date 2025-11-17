import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TwitterDataCollector } from '../testing/twitter-data-collector';
import { ResolutionTester } from '../testing/resolution-tester';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('TestRunner');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // 1. Collect test data
    logger.log('Starting test data collection...');
    const collector = app.get(TwitterDataCollector);
    await collector.collectTestData([
      '#bitcoin OR #ethereum',
      'crypto debate',
      'web3 vs web2',
      'best blockchain',
      'crypto regulation',
    ], 2);

    // 2. Run resolution tests
    logger.log('\nStarting resolution tests...');
    const tester = app.get(ResolutionTester);
    const results = await tester.runTests();

    // 3. Print results
    logger.log('\n=== Test Results ===');
    logger.log(`Total: ${results.total}`);
    logger.log(`✅ Passed: ${results.passed}`);
    logger.log(`❌ Failed: ${results.failed}`);
    logger.log(`Pass Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

    // 4. Print detailed results
    results.results.forEach((test, index) => {
      const status = test.passed ? '✅ PASSED' : '❌ FAILED';
      logger.log(`${index + 1}. ${status} - ${test.name}`);
      if (!test.passed) {
        logger.log(`   Reason: ${test.details.reason || 'Unknown error'}`);
      }
    });

    // 5. Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Test runner failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
