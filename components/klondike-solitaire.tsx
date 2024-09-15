'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { CardGame, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { SUITS, RANKS, createDeck, seededRandom, Card } from '../lib/cards';
import { getRandomInt } from '@/lib/utils';

const seed = getRandomInt(0, Number.MAX_SAFE_INTEGER)
const rng = seededRandom(seed);
const makeNewDeck = () => createDeck(rng());

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
    const newDeck = makeNewDeck()
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
      // If the deck is empty, move waste back into deck (reversed and face down)
      setDeck(waste.reverse().map(card => ({ ...card, faceUp: false })));
      setWaste([]);
    } else {
      // Determine how many cards to draw based on the game mode
      const numCardsToDraw = gameMode === '1-card' ? 1 : 3;

      // Draw the cards from the deck and flip them face up
      const drawnCards = deck.slice(0, numCardsToDraw).map(card => ({ ...card, faceUp: true }));

      // Add drawn cards to the waste pile, removing them from the deck
      setWaste([...drawnCards, ...waste]);
      setDeck(deck.slice(numCardsToDraw));
    }

    // Reset the selected waste card after drawing
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
    
    // Only move the currently selected cards
    const cardsToMove = isFromWaste ? sourcePile : selectedCards;
    
    if (
      cardsToMove.length > 0 &&
      (targetPile.length === 0 && cardsToMove[0].rank === 'K' ||  // Move to empty tableau with King
       targetPile.length > 0 && 
       RANKS.indexOf(cardsToMove[0].rank) === RANKS.indexOf(targetPile[targetPile.length - 1].rank) - 1 &&
       ['♠', '♣'].includes(cardsToMove[0].suit) !== ['♠', '♣'].includes(targetPile[targetPile.length - 1].suit))
    ) {
      const newTableau = [...tableau];
      
      // Remove the moved cards from the source pile
      if (!isFromWaste) {
        newTableau[sourceIndex] = sourcePile.slice(0, sourcePile.length - cardsToMove.length);
        if (newTableau[sourceIndex].length > 0) {
          newTableau[sourceIndex][newTableau[sourceIndex].length - 1].faceUp = true;
        }
      } else {
        setWaste(waste.slice(1));
      }
      
      // Add the moved cards to the target pile
      newTableau[targetIndex] = [...targetPile, ...cardsToMove];
      
      setTableau(newTableau);
      setSelectedColumn(null);
      setSelectedCards([]);  // Clear the selection
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
    const keyPressed = e.key.toLowerCase();
    if (gameWon && keyPressed != 'n') return;
    
    switch (keyPressed) {
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
          moveCards(0, columnIndex, true); // Move from waste to tableau
        } else if (selectedColumn === null) {
          // No column selected yet, select the column
          setSelectedColumn(columnIndex);
          setSelectedCards(tableau[columnIndex].filter(card => card.faceUp));
        } else if (selectedColumn === columnIndex) {
          // If the same column is selected again, allow partial selection by reducing selectedCards
          const viableCardsToSelect = tableau[columnIndex].filter(card => card.faceUp);
          const allSelected = viableCardsToSelect.length == selectedCards.length;
          const noneSelected = selectedCards.length == 0;
          const cardsUpToSelected = (noneSelected ? viableCardsToSelect : ((!allSelected ? [viableCardsToSelect[viableCardsToSelect.findIndex((card) => card == selectedCards[0]) - 1], ...selectedCards] : [viableCardsToSelect.at(-1)]).filter((val) => val) ?? []))
          setSelectedCards(cardsUpToSelected as Card[]);
        } else {
          // Try to move the selected cards to the new column
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
  const visibleWasteCards = waste.slice(0, gameMode === '3-card' ? 3: 1).reverse();

  return (
    <CardGame className="w-full max-w-4xl mx-auto mt-8 p-4" onKeyDown={handleKeyPress} tabIndex={0}>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button onClick={() => { initializeGame(); setGameMode('1-card'); }}>1-Card</Button>
          <Button onClick={() => { initializeGame(); setGameMode('3-card'); }}>3-Card</Button>
          <Button onClick={initializeGame}>New Game</Button>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-10 h-14 rounded border border-dashed flex items-center justify-center cursor-pointer"
                 onClick={drawCards}>
              {deck.length > 0 ? deck.length : 'R'}
            </div>
            {visibleWasteCards.map((wasteCard, k) => (
              <div className="w-10 h-14" key={k}>
                {renderCard(wasteCard, selectedWasteCard && (visibleWasteCards.length && wasteCard == visibleWasteCards.at(-1) || false))}
              </div>
            ))}
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
        <div className="grid grid-cols-7 gap-2 relative min-h-80">
          {tableau.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-1">
              {column.map((card, cardIndex) => (
                <div key={cardIndex}>
                  {renderCard(card, selectedColumn === columnIndex && selectedCards.includes(card))}
                </div>
              ))}
            </div>
          ))}
          {gameWon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-sans font-normal mb-2">Congratulations!</h2>
                <p className="text-xl font-sans font-normal">You Won</p>
                <div dangerouslySetInnerHTML={{ __html: `<!-- /* ${seed} */ -->` }}></div>
              </div>
            </div>
          )}
        </div>
        {false && (
        <div className="mt-4">
          <p>Waste cards</p>
          {waste.map((wasteCard, wasteCardIndex) => (
            <div key={wasteCardIndex}>
            {renderCard(
              wasteCard,
              visibleWasteCards.map(
                (card: Card) => `${card.rank}-${card.suit}`
              ).includes(`${wasteCard.rank}-${wasteCard.suit}`)
            )}
            </div>
          ))}
        </div>
        )}
        {false && (
        <div className="mt-4">
          <p>Selected cards</p>
          {selectedCards.map((selectedCard, selectedCardIndex) => (
            <div key={selectedCardIndex}>
            {renderCard(selectedCard, false)}
            </div>
          ))}
        </div>
        )}
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
    </CardGame>
  );
}
