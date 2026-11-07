import { describe, it } from 'node:test';
import assert from 'node:assert';
import { downloadImageFile } from '../src/utils/downloadHelper';

describe('Download Helper Utility', () => {
  it('should export downloadImageFile function cleanly', () => {
    assert.strictEqual(typeof downloadImageFile, 'function');
  });

  it('should return false when url is empty or null', async () => {
    const result = await downloadImageFile('');
    assert.strictEqual(result, false);
  });
});
