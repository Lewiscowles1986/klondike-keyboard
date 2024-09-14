import { getRandomInt } from './utils';

describe('getRandomInt', () => {
  test('should return an integer within the specified range', () => {
    const min = 5;
    const max = 10;
    for (let i = 0; i < 100; i++) {
      const randomInt = getRandomInt(min, max);
      expect(randomInt).toBeGreaterThanOrEqual(min);
      expect(randomInt).toBeLessThan(max);
      expect(Number.isInteger(randomInt)).toBe(true);
    }
  });

  test('should return the min value when Math.random() is 0', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0); // Mock Math.random() to always return 0
    const min = 3;
    const max = 7;
    expect(getRandomInt(min, max)).toBe(min); // Should return the min value when Math.random() is 0
    randomSpy.mockRestore(); // Correctly restore Math.random() after the test
  });

  test('should return the max value minus one when Math.random() is near 1', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999999); // Mock Math.random() to be very close to 1
    const min = 1;
    const max = 5;
    expect(getRandomInt(min, max)).toBe(max - 1); // Should return max - 1 when Math.random() is close to 1
    randomSpy.mockRestore(); // Correctly restore Math.random()
  });

  test('should return the correct value when min and max are equal', () => {
    const min = 5;
    const max = 5;
    const randomInt = getRandomInt(min, max);
    expect(randomInt).toBe(min); // Should return min (or max) when they are equal
  });

  test('should handle negative ranges correctly', () => {
    const min = -10;
    const max = -5;
    for (let i = 0; i < 100; i++) {
      const randomInt = getRandomInt(min, max);
      expect(randomInt).toBeGreaterThanOrEqual(min);
      expect(randomInt).toBeLessThan(max);
    }
  });

  test('should handle non-integer min and max values by flooring and ceiling them respectively', () => {
    const min = 2.7;
    const max = 7.3;
    for (let i = 0; i < 100; i++) {
      const randomInt = getRandomInt(min, max);
      expect(randomInt).toBeGreaterThanOrEqual(Math.ceil(min)); // Expect ceiling of min
      expect(randomInt).toBeLessThan(Math.floor(max)); // Expect floor of max
    }
  });

  test('should throw an error if min is greater than max', () => {
    const min = 10;
    const max = 5;
    expect(() => getRandomInt(min, max)).toThrow(); // Ensure it throws an error or handles the case
  });

  test('should return consistent values with mocked Math.random()', () => {
    const min = 1;
    const max = 4;

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValueOnce(0.3);
    expect(getRandomInt(min, max)).toBe(1);

    randomSpy.mockReturnValueOnce(0.7);
    expect(getRandomInt(min, max)).toBe(3);

    randomSpy.mockRestore(); // Correctly restore Math.random()
  });
});
