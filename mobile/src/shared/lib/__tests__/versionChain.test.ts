import { recordVersion, resetVersionChains, resolveVersion } from '../versionChain';

describe('versionChain', () => {
  beforeEach(resetVersionChains);

  it('returns the base version when nothing was recorded', () => {
    expect(resolveVersion('a', 'v1')).toBe('v1');
  });

  it('rebases queued changes onto versions produced by our own earlier changes', () => {
    // Two edits queued offline both carry v1. The first one is replayed and produces v2.
    recordVersion('a', 'v1', 'v2');
    expect(resolveVersion('a', 'v1')).toBe('v2');

    // The second one is sent with v2 and produces v3; a third queued edit still resolves.
    recordVersion('a', 'v2', 'v3');
    expect(resolveVersion('a', 'v1')).toBe('v3');
  });

  it("does not hide someone else's change (unknown versions stay as they are)", () => {
    recordVersion('a', 'v1', 'v2');
    expect(resolveVersion('a', 'vX')).toBe('vX');
    expect(resolveVersion('b', 'v1')).toBe('v1');
  });
});
