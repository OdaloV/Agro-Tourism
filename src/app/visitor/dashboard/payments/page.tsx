// src/app/visitor/dashboard/payments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CreditCard,
  ChevronLeft,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";

interface Payment {
  id: number;
  bookingId: number;
  farmName: string;
  farmId: number;
  amount: number;
  date: string;
  status: "completed" | "pending" | "refunded";
  paymentMethod: string;
  transactionId: string;
  invoiceUrl: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function VisitorPayments() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "refunded">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchPayments = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        // Mock payments data - replace with API call
        const mockPayments: Payment[] = [
          {
            id: 1,
            bookingId: 1,
            farmName: "Green Acres Farm",
            farmId: 1,
            amount: 3000,
            date: "2024-04-01",
            status: "completed",
            paymentMethod: "M-Pesa",
            transactionId: "MPESA-ABC123XYZ",
            invoiceUrl: "#",
            items: [
              { name: "Farm Tour", quantity: 2, price: 1500 },
            ],
          },
          {
            id: 2,
            bookingId: 2,
            farmName: "Sunrise Dairy",
            farmId: 2,
            amount: 6000,
            date: "2024-04-05",
            status: "pending",
            paymentMethod: "Credit Card",
            transactionId: "PENDING-456",
            invoiceUrl: "#",
            items: [
              { name: "Milking Experience", quantity: 4, price: 1500 },
            ],
          },
          {
            id: 3,
            bookingId: 3,
            farmName: "Highland Orchard",
            farmId: 3,
            amount: 4500,
            date: "2024-03-20",
            status: "refunded",
            paymentMethod: "M-Pesa",
            transactionId: "MPESA-REF-789",
            invoiceUrl: "#",
            items: [
              { name: "Apple Picking", quantity: 3, price: 1500 },
            ],
          },
          {
            id: 4,
            bookingId: 4,
            farmName: "Green Valley Farm",
            farmId: 4,
            amount: 2500,
            date: "2024-03-15",
            status: "completed",
            paymentMethod: "M-Pesa",
            transactionId: "MPESA-DEF456",
            invoiceUrl: "#",
            items: [
              { name: "Vegetable Harvesting", quantity: 1, price: 2500 },
            ],
          },
        ];

        setPayments(mockPayments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router, mounted]);

  const handleDownloadInvoice = (invoiceUrl: string) => {
    alert("Invoice downloaded!");
    // In production, this would trigger actual download
  };

  const filteredPayments = payments.filter(payment => {
    if (filter !== "all" && payment.status !== filter) return false;
    if (searchQuery && !payment.farmName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalSpent = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-emerald-900">Payment History</h1>
          <p className="text-emerald-600 mt-1">Track your payments and download invoices</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-900">KES {totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-600">KES {pendingAmount.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total Transactions</p>
                <p className="text-2xl font-bold text-emerald-900">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search by farm name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-xl text-sm text-emerald-900 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="All"
            />
            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
              label="Completed"
            />
            <FilterButton
              active={filter === "pending"}
              onClick={() => setFilter("pending")}
              label="Pending"
            />
            <FilterButton
              active={filter === "refunded"}
              onClick={() => setFilter("refunded")}
              label="Refunded"
            />
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <CreditCard className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No payments found</p>
            <p className="text-emerald-500 mb-6">Your payment history will appear here</p>
            <Link href="/farms">
              <button className="px-6 py-3 bg-accent text-white rounded-xl">
                Book a Farm Experience
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onDownloadInvoice={handleDownloadInvoice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm transition-all ${
        active
          ? "bg-accent text-white"
          : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );
}

// Payment Card Component
function PaymentCard({ payment, onDownloadInvoice }: { payment: Payment; onDownloadInvoice: (url: string) => void }) {
  const statusColors = {
    completed: "bg-green-100 text-green-600",
    pending: "bg-amber-100 text-amber-600",
    refunded: "bg-red-100 text-red-600",
  };

  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    refunded: <XCircle className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition"
    >
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-emerald-900">{payment.farmName}</h3>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusColors[payment.status]}`}>
                {statusIcons[payment.status]}
                {payment.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-emerald-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(payment.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                {payment.paymentMethod}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                KES {payment.amount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-emerald-400 mt-2">Transaction ID: {payment.transactionId}</p>
          </div>
          <div className="flex gap-2">
            {payment.status === "completed" && (
              <button
                onClick={() => onDownloadInvoice(payment.invoiceUrl)}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm hover:bg-emerald-100 transition"
              >
                <Download className="h-4 w-4" />
                Invoice
              </button>
            )}
            <Link href={`/farms/${payment.farmId}`}>
              <button className="px-4 py-2 bg-accent text-white rounded-xl text-sm hover:bg-accent/90 transition">
                View Farm
              </button>
            </Link>
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="mt-4 pt-4 border-t border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-2">Items</p>
          <div className="space-y-1">
            {payment.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-emerald-600">{item.name} x{item.quantity}</span>
                <span className="text-emerald-800">KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}