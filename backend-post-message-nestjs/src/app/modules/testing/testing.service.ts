import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { spawn } from 'child_process';

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

    await new Promise((resolve, reject) => {
      const jest = spawn('npm', ['test', '--', '--watch=false'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      jest.on('close', (code) => {
        if (code === 0) {
          this.logger.log('✅ Test suite completed successfully');
          resolve(null);
        } else {
          this.logger.error(`❌ Tests failed with exit code ${code}`);
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      jest.on('error', (error) => {
        this.logger.error('❌ Failed to run tests:', error.message);
        reject(error);
      });
    });
  }
}
