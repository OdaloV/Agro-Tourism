// src/app/farmer/settings/components/PaymentSettingsTab.tsx
"use client";

import { useState } from "react";
import { Building2, User, CreditCard, Smartphone, Banknote, FileText, Save } from "lucide-react";

interface PaymentSettingsTabProps {
  payment: {
    bank_name: string;
    account_name: string;
    account_number: string;
    mpesa_number: string;
    payment_methods: string[];
    tax_id: string;
  };
  onSave: (data: any) => void;
  saving: boolean;
}

const paymentMethodOptions = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2 },
];

export default function PaymentSettingsTab({ payment, onSave, saving }: PaymentSettingsTabProps) {
  const [formData, setFormData] = useState({
    bank_name: payment?.bank_name || "",
    account_name: payment?.account_name || "",
    account_number: payment?.account_number || "",
    mpesa_number: payment?.mpesa_number || "",
    payment_methods: payment?.payment_methods || ["cash", "mpesa"],
    tax_id: payment?.tax_id || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePaymentMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(methodId)
        ? prev.payment_methods.filter(m => m !== methodId)
        : [...prev.payment_methods, methodId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Configure how you receive payments from bookings</p>
      </div>

      {/* Bank Details */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">Bank Account Details</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
              placeholder="e.g., Equity Bank"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
              placeholder="Name on the account"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
              placeholder="Bank account number"
            />
          </div>
        </div>
      </div>

      {/* M-Pesa Details */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">M-Pesa Details</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Number</label>
          <input
            type="tel"
            value={formData.mpesa_number}
            onChange={(e) => setFormData({ ...formData, mpesa_number: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
            placeholder="e.g., 0712345678"
          />
          <p className="text-xs text-gray-400 mt-1">This number will receive M-Pesa payments from bookings</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">Accepted Payment Methods</h3>
        </div>
        <div className="space-y-2">
          {paymentMethodOptions.map(method => (
            <label key={method.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.payment_methods.includes(method.id)}
                onChange={() => togglePaymentMethod(method.id)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <method.icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tax Information */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">Tax Information</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / PIN</label>
          <input
            type="text"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
            placeholder="e.g., KRA PIN"
          />
          <p className="text-xs text-gray-400 mt-1">Required for generating invoices and tax reports</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Payment Settings"}
      </button>
    </form>
  );
}