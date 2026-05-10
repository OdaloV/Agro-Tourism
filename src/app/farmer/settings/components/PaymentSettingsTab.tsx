"use client";

import { useState, useEffect } from "react";
import { Building2, CreditCard, FileText, Save } from "lucide-react";

interface PaymentSettingsTabProps {
  payment: {
    bank_name: string;
    account_name: string;
    account_number: string;
    bank_code: string;
    tax_id: string;
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function PaymentSettingsTab({ payment, onSave, saving }: PaymentSettingsTabProps) {
  const [formData, setFormData] = useState({
    bank_name: payment?.bank_name || "",
    account_name: payment?.account_name || "",
    account_number: payment?.account_number || "",
    bank_code: payment?.bank_code || "",
    tax_id: payment?.tax_id || "",
  });

  const [bankCodes, setBankCodes] = useState<{ code: string; name: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    fetch("/api/bank-codes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBankCodes(data);
        } else {
          console.error("Bank codes API returned non-array:", data);
          setBankCodes([]);
        }
        setLoadingBanks(false);
      })
      .catch((err) => {
        console.error("Failed to load bank codes:", err);
        setBankCodes([]);
        setLoadingBanks(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting payment data:", formData);
    if (!formData.bank_code) {
      alert("Please select a bank code.");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Payment Details</h2>
        <p className="text-sm text-gray-500 mb-6">
          Payouts for completed bookings will be sent to this bank account.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">Bank Account</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-gray-900"
              placeholder="e.g., Equity Bank"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Code <span className="text-xs text-gray-400">(required for payout)</span>
            </label>
            <select
              name="bank_code"
              value={formData.bank_code}
              onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-gray-900"
              required
              disabled={loadingBanks}
            >
              <option key="placeholder" value="">
                {loadingBanks ? "Loading banks..." : "Select bank"}
              </option>
              {bankCodes.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.code})
                </option>
              ))}
            </select>
            {!loadingBanks && bankCodes.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Failed to load bank list. Please refresh or contact support.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-gray-900"
              placeholder="Name on the account"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-gray-900"
              placeholder="Bank account number"
              required
            />
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-gray-900">Tax Information (Optional)</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / PIN</label>
          <input
            type="text"
            name="tax_id"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-gray-900"
            placeholder="e.g., KRA PIN"
          />
          <p className="text-xs text-gray-400 mt-1">Required for invoicing and tax reporting</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Payment Settings"}
      </button>
    </form>
  );
}