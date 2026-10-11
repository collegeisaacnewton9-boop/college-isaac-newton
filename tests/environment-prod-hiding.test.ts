import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isProductionEnvironment, isAIStudioOrDev, shouldProposeGitHubOption } from '../src/utils/environment';

describe('Production Environment & Developer Tools Protection', () => {
  it('should detect official domain collegeisaacnewton.com as production', () => {
    // Simulate window.location.hostname for production
    const originalWindow = globalThis.window;
    
    // @ts-ignore
    globalThis.window = {
      location: {
        hostname: 'collegeisaacnewton.com',
      },
    };

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(isAIStudioOrDev(), false);
    assert.strictEqual(shouldProposeGitHubOption(), false);

    // Restore
    globalThis.window = originalWindow;
  });

  it('should detect www.collegeisaacnewton.com as production and hide dev tools', () => {
    const originalWindow = globalThis.window;
    
    // @ts-ignore
    globalThis.window = {
      location: {
        hostname: 'www.collegeisaacnewton.com',
      },
    };

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(shouldProposeGitHubOption(), false);

    globalThis.window = originalWindow;
  });

  it('should detect localhost or run.app as development allowing developer tools', () => {
    const originalWindow = globalThis.window;
    
    // @ts-ignore
    globalThis.window = {
      location: {
        hostname: 'localhost',
      },
    };

    assert.strictEqual(isProductionEnvironment(), false);
    assert.strictEqual(shouldProposeGitHubOption(), true);

    globalThis.window = originalWindow;
  });
});
