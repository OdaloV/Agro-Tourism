// src/app/components/PriceCalculator.tsx
"use client";

import { useState, useEffect } from "react";

interface PriceCalculatorProps {
  pricePerPerson: number;
  currency: string;
  onPriceChange: (total: number, participants: number, discount: number) => void;
}

export default function PriceCalculator({ pricePerPerson, currency, onPriceChange }: PriceCalculatorProps) {
  const [participants, setParticipants] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [category, setCategory] = useState<'standard' | 'group' | 'large_group'>('standard');

  useEffect(() => {
    let discount = 0;
    let newCategory: 'standard' | 'group' | 'large_group' = 'standard';
    
    if (participants >= 11 && participants <= 20) {
      discount = 10;
      newCategory = 'group';
    } else if (participants >= 21 && participants <= 50) {
      discount = 15;
      newCategory = 'group';
    } else if (participants >= 51) {
      discount = 0;
      newCategory = 'large_group';
    }
    
    setDiscountPercent(discount);
    setCategory(newCategory);
    
    const regularTotal = pricePerPerson * participants;
    const discountAmount = regularTotal * (discount / 100);
    const total = regularTotal - discountAmount;
    
    onPriceChange(total, participants, discount);
  }, [participants, pricePerPerson, onPriceChange]);

  const regularTotal = pricePerPerson * participants;
  const discountAmount = regularTotal * (discountPercent / 100);
  const total = regularTotal - discountAmount;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Participants
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={participants}
          onChange={(e) => setParticipants(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum 100 participants per booking</p>
      </div>

      {category === 'group' && (
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            🎉 Group Discount Applied!
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            {discountPercent}% off for groups of 11-50 people
          </p>
        </div>
      )}

      {category === 'large_group' && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
            📋 Large Group (50+ people)
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Please submit a quote request. The farmer will provide custom pricing within 24 hours.
          </p>
        </div>
      )}

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Regular price ({participants} × {currency} {pricePerPerson})</span>
          <span className="font-medium">{currency} {regularTotal.toLocaleString()}</span>
        </div>
        
        {discountPercent > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Group discount ({discountPercent}% off)</span>
            <span>- {currency} {discountAmount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-emerald-600">
            {currency} {total.toLocaleString()}
          </span>
        </div>
        
        {participants > 1 && (
          <p className="text-xs text-gray-500 text-center">
            ({currency} {(total / participants).toLocaleString()} per person)
          </p>
        )}
      </div>
    </div>
  );
}