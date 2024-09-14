'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

type Card = {
  suit: string;
  rank: string;
  faceUp: boolean;
};

const createDeck = (): Card[] => {
  const deck = SUITS.flatMap(suit =>
    RANKS.map(rank => ({ suit, rank, faceUp: false }))
  );
  return shuffle(deck);
};

const shuffle = (array: Card[]): Card[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export function KlondikeSolitaireComponent() {
  const [gameMode, setGameMode] = useState<'1-card' | '3-card'>('1-card');
  const [deck, setDeck] = useState<Card[]>([]);
  const [tableau, setTableau] = useState<Card[][]>([]);
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [selectedWasteCard, setSelectedWasteCard] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const initializeGame = useCallback(() => {
    const newDeck = createDeck();
    const newTableau: Card[][] = Array(7).fill([]).map((_, i) => 
      newDeck.splice(0, i + 1).map((card, j) => ({ ...card, faceUp: j === i }))
    );
    setDeck(newDeck);
    setTableau(newTableau);
    setFoundation([[], [], [], []]);
    setWaste([]);
    setSelectedColumn(null);
    setSelectedCards([]);
    setSelectedWasteCard(false);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const checkWinCondition = useCallback(() => {
    const allFoundationsFull = foundation.every(pile => pile.length === 13);
    if (allFoundationsFull) {
      setGameWon(true);
    }
  }, [foundation]);

  useEffect(() => {
    checkWinCondition();
  }, [foundation, checkWinCondition]);

  const drawCards = () => {
    if (deck.length === 0) {
      setDeck(waste.reverse().map(card => ({ ...card, faceUp: false })));
      setWaste([]);
    } else {
      const numCardsToDraw = gameMode === '1-card' ? 1 : 3;
      const drawnCards = deck.slice(0, numCardsToDraw).map(card => ({ ...card, faceUp: true }));
      setWaste([...drawnCards, ...waste]);
      setDeck(deck.slice(numCardsToDraw));
    }
    setSelectedWasteCard(false);
  };

  const moveToFoundation = (card: Card, sourceIndex: number, isFromWaste: boolean) => {
    const foundationIndex = SUITS.indexOf(card.suit);
    const foundationPile = foundation[foundationIndex];
    
    if (
      (foundationPile.length === 0 && card.rank === 'A') ||
      (foundationPile.length > 0 && 
       RANKS.indexOf(card.rank) === RANKS.indexOf(foundationPile[foundationPile.length - 1].rank) + 1)
    ) {
      const newFoundation = [...foundation];
      newFoundation[foundationIndex] = [...foundationPile, card];
      setFoundation(newFoundation);

      if (isFromWaste) {
        setWaste(waste.filter((_, index) => index !== sourceIndex));
      } else {
        const newTableau = [...tableau];
        newTableau[sourceIndex] = newTableau[sourceIndex].slice(0, -1);
        if (newTableau[sourceIndex].length > 0) {
          newTableau[sourceIndex][newTableau[sourceIndex].length - 1].faceUp = true;
        }
        setTableau(newTableau);
      }

      setSelectedColumn(null);
      setSelectedCards([]);
      setSelectedWasteCard(false);

      return true;
    }

    return false;
  };

  const moveCards = (sourceIndex: number, targetIndex: number, isFromWaste: boolean = false) => {
    const sourcePile = isFromWaste ? [waste[0]] : tableau[sourceIndex];
    const targetPile = tableau[targetIndex];
    const cardsToMove = isFromWaste ? sourcePile : sourcePile.slice(sourcePile.findIndex(card => card.faceUp));

    if (
      cardsToMove.length > 0 &&
      (targetPile.length === 0 && cardsToMove[0].rank === 'K' ||
       targetPile.length > 0 && 
       RANKS.indexOf(cardsToMove[0].rank) === RANKS.indexOf(targetPile[targetPile.length - 1].rank) - 1 &&
       ['♠', '♣'].includes(cardsToMove[0].suit) !== ['♠', '♣'].includes(targetPile[targetPile.length - 1].suit))
    ) {
      const newTableau = [...tableau];
      if (!isFromWaste) {
        newTableau[sourceIndex] = sourcePile.slice(0, sourcePile.length - cardsToMove.length);
        if (newTableau[sourceIndex].length > 0) {
          newTableau[sourceIndex][newTableau[sourceIndex].length - 1].faceUp = true;
        }
      } else {
        setWaste(waste.slice(1));
      }
      newTableau[targetIndex] = [...targetPile, ...cardsToMove];
      setTableau(newTableau);
      setSelectedColumn(null);
      setSelectedCards([]);
      setSelectedWasteCard(false);
      return true;
    }

    return false;
  };

  const tryMoveToFoundation = () => {
    if (selectedWasteCard && waste.length > 0) {
      return moveToFoundation(waste[0], 0, true);
    } else if (selectedColumn !== null && tableau[selectedColumn].length > 0) {
      const topCard = tableau[selectedColumn][tableau[selectedColumn].length - 1];
      return moveToFoundation(topCard, selectedColumn, false);
    }
    return false;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameWon) return;
    
    switch (e.key.toLowerCase()) {
      case 'd':
        drawCards();
        break;
      case 'f':
        tryMoveToFoundation();
        break;
      case 'w':
        setSelectedWasteCard(true);
        setSelectedColumn(null);
        setSelectedCards([]);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
        const columnIndex = parseInt(e.key) - 1;
        if (selectedWasteCard) {
          moveCards(0, columnIndex, true);
        } else if (selectedColumn === null) {
          setSelectedColumn(columnIndex);
          setSelectedCards(tableau[columnIndex].filter(card => card.faceUp));
        } else {
          moveCards(selectedColumn, columnIndex);
        }
        break;
      case 'escape':
        setSelectedColumn(null);
        setSelectedCards([]);
        setSelectedWasteCard(false);
        break;
      case 'n':
        initializeGame();
        break;
    }
  };

  const renderCard = (card: Card, isSelected: boolean = false) => (
    <div className={`w-10 h-14 rounded ${
      isSelected ? 'border-2 border-yellow-400' : 'border border-gray-300'
    } ${card.faceUp ? (
      ['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'
    ) : 'bg-blue-500'} flex items-center justify-center`}>
      {card.faceUp ? `${card.rank}${card.suit}` : ''}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 p-4" onKeyDown={handleKeyPress} tabIndex={0}>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button onClick={() => setGameMode('1-card')}>1-Card</Button>
          <Button onClick={() => setGameMode('3-card')}>3-Card</Button>
          <Button onClick={initializeGame}>New Game</Button>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-10 h-14 rounded border border-dashed flex items-center justify-center cursor-pointer"
                 onClick={drawCards}>
              {deck.length > 0 ? deck.length : 'R'}
            </div>
            <div className="w-10 h-14">
              {waste.length > 0 && renderCard(waste[0], selectedWasteCard)}
            </div>
          </div>
          <div className="flex space-x-2">
            {foundation.map((pile, index) => (
              <div key={index} className="w-10 h-14">
                {pile.length > 0 ? renderCard(pile[pile.length - 1]) : (
                  <div className="w-10 h-14 rounded border border-dashed flex items-center justify-center" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 relative">
          {tableau.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-1">
              {column.map((card, cardIndex) => (
                <div key={cardIndex}>
                  {renderCard(card, selectedColumn === columnIndex && cardIndex >= column.length - selectedCards.length)}
                </div>
              ))}
            </div>
          ))}
          {gameWon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-sans font-normal mb-2">Congratulations!</h2>
                <p className="text-xl font-sans font-normal">You Won</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p>Controls:</p>
          <ul className="list-disc list-inside">
            <li>D: Draw card(s)</li>
            <li>F: Move selected card to foundation (from waste or tableau)</li>
            <li>W: Select top waste card</li>
            <li>1-7: Select/move cards in tableau or move selected waste card</li>
            <li>N: Start a new game</li>
            <li>Esc: Deselect cards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}