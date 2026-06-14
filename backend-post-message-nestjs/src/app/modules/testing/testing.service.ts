import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class TestingService implements OnModuleInit {
  private readonly logger = new Logger(TestingService.name);

  async onModuleInit(): Promise<void> {
    const shouldTest = process.env.TESTING === 'true';
    this.logger.log(`TESTING env value: "${process.env.TESTING}" (type: ${typeof process.env.TESTING})`);

    if (!shouldTest) {
      this.logger.log('Testing disabled');
      return;
    }

    this.logger.log('🧪 Starting test suite...');
    try {
      const { stdout, stderr } = await execAsync('npm test -- --watch=false');
      if (stdout) this.logger.log(stdout);
      if (stderr) this.logger.warn(stderr);
      this.logger.log('✅ Test suite completed successfully');
    } catch (error) {
      this.logger.error('❌ Tests failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
