import { seededRandom } from "./cards";

// Unit tests for seededRandom
describe('seededRandom', () => {
  test('should generate a consistent random sequence with the same seed', () => {
    const seed = 12345;
    const randomGen = seededRandom(seed);

    const expectedSequence = [
      0.09661652808693845,
      0.8339946273099581,
      0.9477024976608367,
      0.035878594532495915,
      0.011545852768743274
    ];

    for (let i = 0; i < expectedSequence.length; i++) {
      const generatedValue = randomGen();
      expect(generatedValue).toBeCloseTo(expectedSequence[i], 8); // Test to 8 decimal places
    }
  });

  test('should generate different sequences for different seeds', () => {
    const seed1 = 12345;
    const seed2 = 54321;

    const randomGen1 = seededRandom(seed1);
    const randomGen2 = seededRandom(seed2);

    const sequence1 = [];
    const sequence2 = [];

    // Generate the first 5 numbers from both sequences
    for (let i = 0; i < 5; i++) {
      sequence1.push(randomGen1());
      sequence2.push(randomGen2());
    }

    // Ensure the sequences are different
    expect(sequence1).not.toEqual(sequence2);
  });

  test('should be consistent across a large number of iterations', () => {
    const seed = 98765;
    const randomGen = seededRandom(seed);
    const iterations = 52 * 52 * 52; // 140,608 iterations

    // Store the first and last number after iterations
    const firstValue = randomGen();
    let lastValue;

    for (let i = 1; i < iterations; i++) {
      lastValue = randomGen();
    }

    // Ensure that the first and last numbers are not the same
    expect(firstValue).not.toEqual(lastValue);

    // Further ensure that the same seed produces the same result for large iterations
    const randomGenRepeat = seededRandom(seed);
    for (let i = 1; i < iterations; i++) {
      randomGenRepeat();
    }
    expect(lastValue).not.toBeUndefined();
    expect(lastValue).not.toBeNull();
    expect(randomGenRepeat()).toBeCloseTo(lastValue!, 8);
  });

  test('should generate numbers between 0 and 1', () => {
    const seed = 24680;
    const randomGen = seededRandom(seed);
    const iterations = 1000; // Test over 1000 iterations

    for (let i = 0; i < iterations; i++) {
      const value = randomGen();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
