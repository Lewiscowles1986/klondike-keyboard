const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export type Card = {
  suit: string;
  rank: string;
  faceUp: boolean;
};

// Function to create a shuffled deck with a seed
const createDeck = (seed: number): Card[] => {
  const deck = SUITS.flatMap(suit =>
    RANKS.map(rank => ({ suit, rank, faceUp: false }))
  );
  return shuffle(deck, seed);
};

// Simple linear congruential generator (LCG) for a seeded random number
const seededRandom = (seed: number): () => number => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };
};

// Fisher-Yates shuffle algorithm using seeded random
const shuffle = (array: Card[], seed: number): Card[] => {
  const random = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export { SUITS, RANKS, seededRandom, createDeck }