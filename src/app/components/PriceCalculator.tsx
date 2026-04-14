"use client";

import { useState, useEffect } from "react";

interface PriceCalculatorProps {
  pricePerPerson: number;
  currency: string;
  onPriceChange: (total: number, participants: number, discount: number) => void;
  discountPercent?: number; // Added: optional discount from group settings
}

export default function PriceCalculator({ pricePerPerson, currency, onPriceChange, discountPercent = 0 }: PriceCalculatorProps) {
  const [participants, setParticipants] = useState(1);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [category, setCategory] = useState<'standard' | 'group' | 'large_group' | 'custom_discount'>('standard');

  useEffect(() => {
    let discount = 0;
    let newCategory: 'standard' | 'group' | 'large_group' | 'custom_discount' = 'standard';
    
    // Priority: Custom discount from group settings > hardcoded tiers
    if (discountPercent > 0) {
      discount = discountPercent;
      newCategory = 'custom_discount';
    } else if (participants >= 11 && participants <= 20) {
      discount = 10;
      newCategory = 'group';
    } else if (participants >= 21 && participants <= 50) {
      discount = 15;
      newCategory = 'group';
    } else if (participants >= 51) {
      discount = 0;
      newCategory = 'large_group';
    }
    
    setAppliedDiscount(discount);
    setCategory(newCategory);
    
    const regularTotal = pricePerPerson * participants;
    const discountAmount = regularTotal * (discount / 100);
    const total = regularTotal - discountAmount;
    
    onPriceChange(total, participants, discount);
  }, [participants, pricePerPerson, discountPercent, onPriceChange]);

  const regularTotal = pricePerPerson * participants;
  const discountAmount = regularTotal * (appliedDiscount / 100);
  const total = regularTotal - discountAmount;

  const handleParticipantsChange = (value: number) => {
    // Use group settings max if available, otherwise use 100
    const maxGuests = discountPercent > 0 ? 500 : 100;
    setParticipants(Math.min(maxGuests, Math.max(1, value)));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Participants
        </label>
        <input
          type="number"
          min="1"
          max={discountPercent > 0 ? 500 : 100}
          value={participants}
          onChange={(e) => handleParticipantsChange(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {discountPercent > 0 ? `Maximum ${discountPercent > 0 ? 500 : 100} participants per booking` : "Maximum 100 participants per booking"}
        </p>
      </div>

      {/* Custom Discount from Farmer Settings */}
      {category === 'custom_discount' && discountPercent > 0 && (
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            🎉 Special Group Discount Applied!
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            {discountPercent}% off for groups of {participants}+ people
          </p>
          {participants >= 50 && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Note: Additional requirements may apply for groups of 50+ (deposit, waiver, etc.)
            </p>
          )}
        </div>
      )}

      {/* Hardcoded Group Discount */}
      {category === 'group' && discountPercent === 0 && (
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            🎉 Group Discount Applied!
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            {appliedDiscount}% off for groups of 11-50 people
          </p>
        </div>
      )}

      {/* Large Group Warning */}
      {category === 'large_group' && discountPercent === 0 && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
            📋 Large Group (50+ people)
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Please submit a quote request. The farmer will provide custom pricing within 24 hours.
          </p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Regular price ({participants} × {currency} {pricePerPerson})</span>
          <span className="font-medium">{currency} {regularTotal.toLocaleString()}</span>
        </div>
        
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Group discount ({appliedDiscount}% off)</span>
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