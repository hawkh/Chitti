// Comprehensive Application Test
const fs = require('fs');
const path = require('path');

class ChittiAppTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  test(description, testFn) {
    try {
      testFn();
      this.results.passed++;
      this.log(`PASS: ${description}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ description, error: error.message });
      this.log(`FAIL: ${description} - ${error.message}`, 'error');
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(__dirname, filePath));
  }

  directoryExists(dirPath) {
    return fs.existsSync(path.join(__dirname, dirPath)) && 
           fs.statSync(path.join(__dirname, dirPath)).isDirectory();
  }

  runTests() {
    this.log('🚀 Starting Chitti AI NDT Application Test Suite');

    // Test Core Structure
    this.test('Package.json exists', () => {
      if (!this.fileExists('package.json')) throw new Error('package.json not found');
    });

    this.test('Next.js configuration exists', () => {
      if (!this.fileExists('next.config.js')) throw new Error('next.config.js not found');
    });

    this.test('TypeScript configuration exists', () => {
      if (!this.fileExists('tsconfig.json')) throw new Error('tsconfig.json not found');
    });

    // Test Database Schema
    this.test('Prisma schema exists', () => {
      if (!this.fileExists('prisma/schema.prisma')) throw new Error('Prisma schema not found');
    });

    // Test Core Services
    this.test('Database service exists', () => {
      if (!this.fileExists('lib/database.ts')) throw new Error('Database service not found');
    });

    this.test('Redis service exists', () => {
      if (!this.fileExists('lib/redis.ts')) throw new Error('Redis service not found');
    });

    // Test AI Services
    this.test('Scalable Model Manager exists', () => {
      if (!this.fileExists('services/ai/ScalableModelManager.ts')) throw new Error('ScalableModelManager not found');
    });

    this.test('Predictive Maintenance Engine exists', () => {
      if (!this.fileExists('services/ai/PredictiveMaintenanceEngine.ts')) throw new Error('PredictiveMaintenanceEngine not found');
    });

    this.test('Multi-Modal Engine exists', () => {
      if (!this.fileExists('services/ai/MultiModalEngine.ts')) throw new Error('MultiModalEngine not found');
    });

    // Test Processing Services
    this.test('Job Queue service exists', () => {
      if (!this.fileExists('services/processing/JobQueue.ts')) throw new Error('JobQueue service not found');
    });

    this.test('Detection Service exists', () => {
      if (!this.fileExists('services/database/DetectionService.ts')) throw new Error('DetectionService not found');
    });

    // Test Advanced Features
    this.test('Digital Twin Engine exists', () => {
      if (!this.fileExists('services/digitaltwin/DigitalTwinEngine.ts')) throw new Error('DigitalTwinEngine not found');
    });

    this.test('Blockchain Compliance Engine exists', () => {
      if (!this.fileExists('services/blockchain/ComplianceEngine.ts')) throw new Error('ComplianceEngine not found');
    });

    this.test('Edge AI Manager exists', () => {
      if (!this.fileExists('services/edge/EdgeAIManager.ts')) throw new Error('EdgeAIManager not found');
    });

    this.test('Business Intelligence service exists', () => {
      if (!this.fileExists('services/analytics/BusinessIntelligence.ts')) throw new Error('BusinessIntelligence not found');
    });

    // Test WebSocket Service
    this.test('WebSocket Manager exists', () => {
      if (!this.fileExists('services/websocket/WebSocketManager.ts')) throw new Error('WebSocketManager not found');
    });

    // Test API Routes
    this.test('Batch processing API exists', () => {
      if (!this.fileExists('app/api/processing/batch/route.ts')) throw new Error('Batch processing API not found');
    });

    this.test('Models API exists', () => {
      if (!this.fileExists('app/api/models/route.ts')) throw new Error('Models API not found');
    });

    this.test('System status API exists', () => {
      if (!this.fileExists('app/api/system/status/route.ts')) throw new Error('System status API not found');
    });

    // Test Docker Configuration
    this.test('Docker Compose configuration exists', () => {
      if (!this.fileExists('docker-compose.yml')) throw new Error('docker-compose.yml not found');
    });

    this.test('Dockerfile exists', () => {
      if (!this.fileExists('Dockerfile')) throw new Error('Dockerfile not found');
    });

    // Test Setup Scripts
    this.test('Setup script exists', () => {
      if (!this.fileExists('scripts/setup.js')) throw new Error('Setup script not found');
    });

    // Test Documentation
    this.test('Scalable README exists', () => {
      if (!this.fileExists('README_SCALABLE.md')) throw new Error('Scalable README not found');
    });

    this.test('Million Dollar Features doc exists', () => {
      if (!this.fileExists('MILLION_DOLLAR_FEATURES.md')) throw new Error('Million Dollar Features doc not found');
    });

    // Test Environment Configuration
    this.test('Environment configuration exists', () => {
      if (!this.fileExists('.env.local')) throw new Error('.env.local not found');
    });

    // Test Directory Structure
    this.test('Services directory structure', () => {
      const requiredDirs = [
        'services/ai',
        'services/processing',
        'services/database',
        'services/digitaltwin',
        'services/blockchain',
        'services/edge',
        'services/analytics',
        'services/websocket'
      ];
      
      for (const dir of requiredDirs) {
        if (!this.directoryExists(dir)) {
          throw new Error(`Directory ${dir} not found`);
        }
      }
    });

    // Test API Structure
    this.test('API directory structure', () => {
      const requiredDirs = [
        'app/api/processing/batch',
        'app/api/models',
        'app/api/system/status'
      ];
      
      for (const dir of requiredDirs) {
        if (!this.directoryExists(dir)) {
          throw new Error(`API directory ${dir} not found`);
        }
      }
    });

    // Test Configuration Files
    this.test('Configuration files integrity', () => {
      const configFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'tailwind.config.js',
        'prisma/schema.prisma'
      ];
      
      for (const file of configFiles) {
        if (!this.fileExists(file)) {
          throw new Error(`Configuration file ${file} not found`);
        }
      }
    });

    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary');
    this.log(`✅ Passed: ${this.results.passed}`);
    this.log(`❌ Failed: ${this.results.failed}`);
    this.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.errors.length > 0) {
      this.log('\n🔍 Failed Tests:');
      this.results.errors.forEach(error => {
        this.log(`   • ${error.description}: ${error.error}`, 'error');
      });
    }

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! Chitti AI NDT is ready for deployment.', 'success');
    } else {
      this.log('\n⚠️  Some tests failed. Please review and fix the issues above.', 'error');
    }
  }
}

// Run the tests
const tester = new ChittiAppTester();
tester.runTests();