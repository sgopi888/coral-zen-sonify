// Test setup for Coral Protocol Agent tests
import { vi } from 'vitest';

// Mock Web Audio API globally
global.AudioContext = vi.fn().mockImplementation(() => ({
  createBuffer: vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(1024)),
    numberOfChannels: 2,
    sampleRate: 44100,
    length: 1024
  }),
  sampleRate: 44100,
  state: 'running',
  close: vi.fn()
}));

// Mock performance.memory
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 50000000,
    totalJSHeapSize: 100000000,
    jsHeapSizeLimit: 200000000
  }
});