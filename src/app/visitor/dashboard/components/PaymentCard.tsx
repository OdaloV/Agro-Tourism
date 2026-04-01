// src/app/visitor/dashboard/components/PaymentCard.tsx
import { Calendar, DollarSign, Download, CheckCircle, Clock, XCircle } from "lucide-react";

interface Payment {
  id: number;
  bookingId: number;
  farmName: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "refunded";
  invoiceUrl: string;
}

interface PaymentCardProps {
  payment: Payment;
  onDownloadInvoice: (url: string) => void;
}

const statusStyles = {
  completed: "bg-green-100 text-green-600",
  pending: "bg-amber-100 text-amber-600",
  refunded: "bg-red-100 text-red-600",
};

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  refunded: <XCircle className="h-4 w-4" />,
};

export function PaymentCard({ payment, onDownloadInvoice }: PaymentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-emerald-100 last:border-0">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-emerald-900">{payment.farmName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusStyles[payment.status]}`}>
            {statusIcons[payment.status]}
            {payment.status}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-emerald-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(payment.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            KES {payment.amount.toLocaleString()}
          </span>
        </div>
      </div>
      {payment.status === "completed" && (
        <button
          onClick={() => onDownloadInvoice(payment.invoiceUrl)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-accent hover:bg-emerald-50 rounded-lg transition"
        >
          <Download className="h-4 w-4" />
          Invoice
        </button>
      )}
    </div>
  );
}