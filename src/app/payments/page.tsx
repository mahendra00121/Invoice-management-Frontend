"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Trash2, 
  Menu,
  Sun,
  Moon,
  IndianRupee,
  Calendar,
  Eye,
  CheckCircle,
  Printer,
  Coins,
  QrCode,
  AlertCircle,
  Filter,
  TrendingUp,
  Image as ImageIcon,
  Check,
  X,
  Download,
  MessageCircle
} from "lucide-react"

import Sidebar from "@/components/Sidebar"

// Shadcn UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"


interface InvoiceItem {
  id: number | string;
  productId: number | string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstPercent: number;
  discountType: "Percentage" | "Flat";
  discountValue: number;
  lineTotal: number;
}

interface Invoice {
  id: number | string;
  invoiceNumber: string;
  quotationNumber?: string;
  customerId: number | string;
  customerName: string;
  customerGSTIN: string;
  customerState: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  contactPerson: string;
  shippingAddress: string;
  salesPerson: string;
  paymentTerms: string;
  invoiceDate: string;
  dueDate: string;
  currency: "INR" | "USD";
  subTotal: number;
  discountAmount: number;
  gstAmount: number;
  shippingCharges: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Credit Card" | "None";
  transactionRef: string;
  status: "Draft" | "Paid" | "Pending" | "Partial Paid" | "Cancelled" | "Overdue";
  notes: string;
  termsConditions: string;
  createdBy: string;
  createdAt: string;
  items: InvoiceItem[];
}

interface PaymentEntry {
  id: number | string;
  receiptNumber: string;
  invoiceId: number | string;
  invoiceNumber: string;
  customerId: number | string;
  customerName: string;
  paymentDate: string;
  amount: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Cheque";
  referenceNumber: string;
  transactionId: number | string;
  chequeNumber?: string;
  receivedBy: string;
  notes: string;
  proofUrl?: string; // Simulated file upload log
  balanceRemaining: number;
  invoiceTotal: number; // original billing total
  createdAt: string;
  
  // Backend Aliases
  paymentNumber?: string;
  transactionRef?: string;
  visualSlipPath?: string;
}

const RECEIVED_BY_LIST = ["Administrator", "Rohan Mehta", "Pooja Sharma", "Accounts Desk"];

const OUR_COMPANY = {
  name: "Vyapaar Pro Enterprises Ltd",
  gstin: "27BBBBB2222B2Z2",
  state: "Maharashtra",
  address: "102, Technopolis IT Park, BKC",
  city: "Mumbai",
  pincode: "400051",
  email: "billing@vyapaar.pro",
  phone: "9876500000"
};

// Initial seed collections for demo
const SEED_PAYMENTS: PaymentEntry[] = [
  {
    id: "rcpt-1",
    receiptNumber: "RCPT-2026-0001",
    invoiceId: 1,
    invoiceNumber: "INV-2026-0001",
    customerId: 1,
    customerName: "TechPulse Solutions Pvt Ltd",
    paymentDate: "2026-05-22",
    amount: 50000.00,
    paymentMode: "Bank Transfer",
    referenceNumber: "NEFT-INB982039",
    transactionId: "TXN58392049",
    receivedBy: "Administrator",
    notes: "Initial advance bank transfer payment against ProBook purchase.",
    balanceRemaining: 67958.00,
    invoiceTotal: 117958.00,
    createdAt: "2026-05-22T10:30:00.000Z"
  }
];

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<PaymentEntry[]>([])
  
  // Dynamic filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [modeFilter, setModeFilter] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Dialog Control
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentEntry | null>(null)

  // Payment Form States
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer" | "Cheque">("UPI")
  const [refNumber, setRefNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [chequeNumber, setChequeNumber] = useState("")
  const [receivedBy, setReceivedBy] = useState(RECEIVED_BY_LIST[0])
  const [notes, setNotes] = useState("")
  const [uploadedProofName, setUploadedProofName] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Theme support
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("invoice_management_theme") as "light" | "dark" | null
      return savedTheme || "light"
    }
    return "light"
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("invoice_management_theme", theme)
  }, [theme])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("invoice_management_user")
      if (!userStr) {
        window.location.href = "/login"
        return
      }
      try {
        const userObj = JSON.parse(userStr)
        setUserPermissions(userObj.permissions ? userObj.permissions.split(',') : [])
      } catch (e) {}

      // Invoices database loader
      const savedInvoices = localStorage.getItem("invoice_management_invoices")
      if (savedInvoices) {
        const parsedInvoices = JSON.parse(savedInvoices);
        requestAnimationFrame(() => {
          setInvoices(parsedInvoices);
        });
      }

      // Payments database loader
      const savedPayments = localStorage.getItem("invoice_management_payments")
      if (savedPayments) {
        const parsedPayments = JSON.parse(savedPayments);
        requestAnimationFrame(() => {
          setPayments(parsedPayments);
        });
      } else {
        
        requestAnimationFrame(() => {
          setPayments([]);
        });
      }
    }

    // Fetch live invoices and payments from C# API to ensure perfectly synchronized state!
    Promise.all([
      api.invoices.getAll().catch(() => null),
      api.payments.getAll().catch(() => null)
    ]).then(([liveInvoices, livePayments]) => {
      if (liveInvoices && Array.isArray(liveInvoices)) setInvoices(liveInvoices)
      if (livePayments && Array.isArray(livePayments)) setPayments(livePayments)
    })

    const handle = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  const getPaymentModeBadge = (mode: string) => {
    switch(mode) {
      case "UPI":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Bank Transfer":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Cash":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Cheque":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  // Calculate statistics summary
  const totalAmountReceived = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalOutstandingBalance = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0)
  const totalPaidInvoicesCount = invoices.filter(inv => inv.status === "Paid").length
  const totalPendingInvoicesCount = invoices.filter(inv => inv.status === "Pending" || inv.status === "Partial Paid").length

  // Filter Payments database
  const filteredPayments = payments.filter(p => {
    const sq = searchQuery.toLowerCase()
    const matchesSearch = (p.customerName || "").toLowerCase().includes(sq) || 
                          (p.invoiceNumber || "").toLowerCase().includes(sq) ||
                          (p.receiptNumber || p.paymentNumber || "").toLowerCase().includes(sq) ||
                          (p.transactionId || "").toString().toLowerCase().includes(sq) ||
                          (p.referenceNumber || p.transactionRef || "").toLowerCase().includes(sq)
    
    const matchesMode = modeFilter === "All" ? true : p.paymentMode === modeFilter

    let matchesDate = true
    if (startDate) {
      matchesDate = matchesDate && new Date(p.paymentDate) >= new Date(startDate)
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(p.paymentDate) <= new Date(endDate)
    }

    return matchesSearch && matchesMode && matchesDate
  })

  // Selected invoice helper properties
  const selectedInvoice = invoices.find(inv => inv.id == selectedInvoiceId)

  // Open creation modal
  const handleOpenAddForm = () => {
    setSelectedInvoiceId("")
    setPaymentDate(new Date().toISOString().split("T")[0])
    setPaymentAmount("")
    setPaymentMode("UPI")
    setRefNumber("")
    setTransactionId("")
    setChequeNumber("")
    setReceivedBy(RECEIVED_BY_LIST[0])
    setNotes("")
    setUploadedProofName("")
    setFormErrors({})
    setIsAddOpen(true)
  }

  // Handle fake proof file upload simulation
  const handleFileChangeSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedProofName(file.name)
      toast.success(`Attached document: ${file.name} successfully linked to transaction!`)
    }
  }

  // Form submit saving transaction logs
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!selectedInvoiceId) {
      errors.selectedInvoiceId = "Please select a pending invoice ledger"
    }

    if (!paymentDate) {
      errors.paymentDate = "Payment execution date is required"
    }

    const amt = parseFloat(paymentAmount)
    if (isNaN(amt) || amt <= 0) {
      errors.paymentAmount = "Specify a valid positive numerical amount"
    } else if (selectedInvoice && amt > selectedInvoice.balanceAmount) {
      errors.paymentAmount = `Payment amount exceeds current balance (₹${selectedInvoice.balanceAmount.toLocaleString("en-IN")})`
    }

    if (paymentMode === "UPI" && !transactionId.trim()) {
      errors.transactionId = "Transaction ID parameter is mandatory for UPI payments"
    }

    if (paymentMode === "Bank Transfer" && !refNumber.trim()) {
      errors.refNumber = "UTR transaction code is mandatory for direct bank transfers"
    }

    if (paymentMode === "Cheque" && !chequeNumber.trim()) {
      errors.chequeNumber = "Provide the bank Cheque leaf number"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error("Please resolve form issues before committing the ledger transaction.")
      return
    }

    if (!selectedInvoice) return

    // 1. Calculate remaining balance
    const currentPaidTotal = selectedInvoice.paidAmount + amt
    const remainingBalance = Math.max(0, selectedInvoice.grandTotal - currentPaidTotal)

    // 2. Compute the new status
    let computedStatus: "Paid" | "Partial Paid" | "Pending" = "Pending"
    if (currentPaidTotal >= selectedInvoice.grandTotal) {
      computedStatus = "Paid"
    } else if (currentPaidTotal > 0) {
      computedStatus = "Partial Paid"
    }

    // 3. Create the new Payment Entry Object
    const receiptCode = `RCPT-2026-${String(payments.length + 1).padStart(4, "0")}`
    const newPayment: PaymentEntry = {
      id: Math.floor(Math.random() * 10000000),
      receiptNumber: receiptCode,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      paymentDate: paymentDate,
      amount: amt,
      paymentMode: paymentMode,
      referenceNumber: paymentMode === "Bank Transfer" ? refNumber.trim() : (paymentMode === "Cheque" ? chequeNumber.trim() : refNumber.trim()),
      transactionId: paymentMode === "UPI" ? transactionId.trim() : transactionId.trim(),
      chequeNumber: paymentMode === "Cheque" ? chequeNumber.trim() : undefined,
      receivedBy: receivedBy,
      notes: notes.trim() || `Partial collection received against bill ${selectedInvoice.invoiceNumber}`,
      proofUrl: uploadedProofName ? `/proofs/${uploadedProofName}` : undefined,
      balanceRemaining: remainingBalance,
      invoiceTotal: selectedInvoice.grandTotal,
      createdAt: new Date().toISOString(),
      
      // Backend aliases for C# compatibility
      paymentNumber: receiptCode,
      transactionRef: (paymentMode === "UPI" ? transactionId.trim() : (paymentMode === "Bank Transfer" ? refNumber.trim() : chequeNumber.trim())) || "N/A",
      visualSlipPath: uploadedProofName ? `/proofs/${uploadedProofName}` : ""
    }

    // 4. Update the Invoice record in memory
    const updatedInvoices = invoices.map(inv => {
      if (inv.id == selectedInvoice.id) {
        return {
          ...inv,
          paidAmount: currentPaidTotal,
          balanceAmount: remainingBalance,
          status: computedStatus,
          paymentMode: paymentMode === "Cheque" ? "Bank Transfer" : paymentMode,
          transactionRef: paymentMode === "UPI" ? transactionId.trim() : (paymentMode === "Bank Transfer" ? refNumber.trim() : chequeNumber.trim())
        }
      }
      return inv
    })

    // 5. Update local storage Databases synchronously
    const updatedPayments = [newPayment, ...payments]
    
    setInvoices(updatedInvoices)
    setPayments(updatedPayments)

    localStorage.setItem("invoice_management_invoices", JSON.stringify(updatedInvoices))
    localStorage.setItem("invoice_management_payments", JSON.stringify(updatedPayments))

    // Push to backend audit trail API directly so it shows up globally
    const userStr = localStorage.getItem("invoice_management_user");
    const user = userStr ? JSON.parse(userStr) : { name: "Administrator" };
    
    try {
      await api.auditLogs.create({
        userName: user.name, 
        action: "Create", 
        entityName: "Payment", 
        entityId: selectedInvoice.invoiceNumber,
        details: `Processed payment of ₹${amt.toLocaleString("en-IN")} for Invoice ${selectedInvoice.invoiceNumber}`, 
      });
    } catch (e) {
      console.warn("Audit log backend tracking failed", e)
    }

    setIsAddOpen(false)
    toast.success(`Payment Receipt ${receiptCode} created. Invoice status: ${computedStatus}!`)

    // Auto open preview receipt
    setSelectedPayment(newPayment)
    setIsReceiptOpen(true)
  }

  // Delete a Payment Entry and restore Invoice balance state
  const handleDeletePayment = (p: PaymentEntry) => {
    if (confirm(`Are you absolutely sure you want to delete payment record ${p.receiptNumber}? This will deduct paid ledger values and increase the outstanding invoice balances.`)) {

      const updatedInvoices = invoices.map(inv => {
        if (inv.id == p.invoiceId) {
          const rawPaid = Math.max(0, inv.paidAmount - p.amount)
          const rawBalance = inv.grandTotal - rawPaid
          
          let computedStatus: "Paid" | "Partial Paid" | "Pending" = "Pending"
          if (rawPaid === 0) {
            computedStatus = "Pending"
          } else if (rawPaid < inv.grandTotal) {
            computedStatus = "Partial Paid"
          } else {
            computedStatus = "Paid"
          }

          return {
            ...inv,
            paidAmount: rawPaid,
            balanceAmount: rawBalance,
            status: computedStatus
          }
        }
        return inv
      })

      const updatedPayments = payments.filter(item => item.id !== p.id)

      setInvoices(updatedInvoices)
      setPayments(updatedPayments)

      localStorage.setItem("invoice_management_invoices", JSON.stringify(updatedInvoices))
      localStorage.setItem("invoice_management_payments", JSON.stringify(updatedPayments))

      toast.warning(`Deleted Payment Entry ${p.receiptNumber}. Invoice balances recalculated.`)
    }
  }

  // Preview Receipt Action
  const handlePreviewReceipt = (p: PaymentEntry) => {
    setSelectedPayment(p)
    setIsReceiptOpen(true)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    if (!selectedPayment) return;
    
    // Attempt to find customer phone from linked invoice
    const linkedInvoice = invoices.find(inv => inv.id === selectedPayment.invoiceId || inv.invoiceNumber === selectedPayment.invoiceNumber);
    let phone = linkedInvoice?.customerPhone || "";
    
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = `91${phone}`;
    }
    
    const message = `Namaste ${selectedPayment.customerName},%0A%0AAapka Payment Receipt *${selectedPayment.receiptNumber}* taiyaar hai.%0A*Amount Received:* ₹${(selectedPayment.amount || 0).toLocaleString("en-IN")}%0A*Against Invoice:* ${selectedPayment.invoiceNumber}%0A*Remaining Balance:* ₹${(selectedPayment.balanceRemaining || 0).toLocaleString("en-IN")}%0A%0AKripya is message ke sath bheji gayi receipt check karein.%0A%0ADhanyawaad,%0A*${OUR_COMPANY.name}*`;

    if (!phone) {
      toast.error("Customer phone number not found in invoice records.");
      return;
    }

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // Hydration safety wrapper check
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Coins className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Initializing Payment Engine...</p>
          <p className="text-xs text-muted-foreground">Compiling bank transaction histories and ledger mappings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      {/* Shared Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="flex items-center justify-between h-20 px-6 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Payment Ledger Management
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Receive collections, execute balances auto-reconciliation, track partial payments and print compliance cash slips.
              </p>
            </div>
          </div>

          {/* Right Header panel controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-xl border border-border bg-card/50 text-foreground"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {userPermissions.includes("Payments.CRUD") && (
              <Button 
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 md:px-4 rounded-xl text-xs h-10 shadow-lg flex items-center gap-2 group transition-all"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span className="hidden md:inline">Record Payment Entry</span>
              </Button>
            )}
          </div>
        </header>

        {/* Dynamic scroll body container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:bg-white print:text-black">
          
          {/* Section 1: Dashboard Widgets (Aesthetic Analytics Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
            
            {/* Widget 1: Total Received */}
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full translate-x-4 -translate-y-4 transition-all group-hover:scale-110"></div>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Received</span>
                  <span className="text-xl font-black font-mono text-emerald-500">
                    ₹{totalAmountReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Widget 2: Outstanding Receivables */}
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-bl-full translate-x-4 -translate-y-4 transition-all group-hover:scale-110"></div>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Outstanding Due</span>
                  <span className="text-xl font-black font-mono text-amber-500">
                    ₹{totalOutstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Widget 3: Fully Paid Bills Count */}
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-full translate-x-4 -translate-y-4 transition-all group-hover:scale-110"></div>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Paid Invoices</span>
                  <span className="text-xl font-black font-mono text-foreground">
                    {totalPaidInvoicesCount} Bills
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Widget 4: Outstanding Bills Pending Collections */}
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full translate-x-4 -translate-y-4 transition-all group-hover:scale-110"></div>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Pending Collection</span>
                  <span className="text-xl font-black font-mono text-red-500">
                    {totalPendingInvoicesCount} Accounts
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Section 2: Advanced Search, Date Ranges & Mode Filters */}
          <Card className="bg-card border-border shadow-sm rounded-2xl print:hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search query input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text"
                    placeholder="Search by customer, bill no, RCPT, TXN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border hover:border-border/80 rounded-xl h-10 w-full text-xs"
                  />
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                  
                  {/* Mode select */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <select
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground outline-none cursor-pointer h-10"
                    >
                      <option value="All">All Modes</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-background border-border rounded-xl text-xs h-10 w-32 font-medium"
                      title="From Date"
                    />
                  </div>

                  {/* End Date */}
                  <div className="text-xs text-muted-foreground font-bold">to</div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-background border-border rounded-xl text-xs h-10 w-32 font-medium"
                      title="To Date"
                    />
                  </div>

                  {/* Clear Button */}
                  {(searchQuery || modeFilter !== "All" || startDate || endDate) && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("")
                        setModeFilter("All")
                        setStartDate("")
                        setEndDate("")
                      }}
                      className="text-xs font-bold hover:bg-muted text-muted-foreground hover:text-foreground h-10 rounded-xl px-3"
                    >
                      Reset Filters
                    </Button>
                  )}

                </div>

              </div>
            </CardContent>
          </Card>

          {/* Section 3: Ledger Registry Table */}
          <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl print:hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border h-14">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="text-foreground font-semibold px-6 w-[160px]">Receipt Number</TableHead>
                      <TableHead className="text-foreground font-semibold px-6 w-[150px]">Invoice Number</TableHead>
                      <TableHead className="text-foreground font-semibold px-6">Customer Profile</TableHead>
                      <TableHead className="text-foreground font-semibold px-6">Payment Date</TableHead>
                      <TableHead className="text-foreground font-semibold px-6">Payment Mode</TableHead>
                      <TableHead className="text-foreground font-semibold px-6 text-right">Received Amount</TableHead>
                      <TableHead className="text-foreground font-semibold px-6 text-right">Remaining Balance</TableHead>
                      <TableHead className="text-foreground font-semibold px-6 text-center w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((p, idx) => {
                        // Find invoice status dynamic badge highlight styling
                        const matchingInv = invoices.find(i => i.id == p.invoiceId)
                        const safeBalance = p.balanceRemaining ?? matchingInv?.balanceAmount ?? 0;
                        const safeReceipt = p.receiptNumber || p.paymentNumber || "N/A";
                        const safeRef = p.referenceNumber || p.transactionRef;

                        return (
                          <TableRow 
                            key={`${p.id}-${idx}`} 
                            className="border-b border-border/60 hover:bg-muted/30 transition-colors h-16 group"
                          >
                            {/* Receipt Code */}
                             <TableCell className="px-6 font-bold text-foreground font-mono text-xs">
                              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.05)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {safeReceipt}
                              </span>
                            </TableCell>

                            {/* Invoice Link */}
                            <TableCell className="px-6 font-semibold text-foreground font-mono text-xs">
                              <Link href="/invoices" className="hover:text-primary transition-colors hover:underline">
                                {p.invoiceNumber}
                              </Link>
                            </TableCell>

                            {/* Customer Profile */}
                            <TableCell className="px-6 font-semibold text-foreground">
                              <div className="flex flex-col">
                                <span className="block truncate">{p.customerName}</span>
                                <span className="block text-[9px] font-normal text-muted-foreground tracking-wider uppercase">{p.receivedBy || "Administrator"}</span>
                              </div>
                            </TableCell>

                            {/* Payment Date */}
                            <TableCell className="px-6 text-muted-foreground font-mono text-xs">
                              {p.paymentDate}
                            </TableCell>

                            {/* Payment Mode */}
                            <TableCell className="px-6 text-foreground font-semibold">
                              <div className="flex flex-col items-start gap-1">
                                <div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPaymentModeBadge(p.paymentMode)}`}>
                                    {p.paymentMode}
                                  </span>
                                </div>
                                {safeRef && (
                                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">Ref: {safeRef}</span>
                                )}
                              </div>
                            </TableCell>

                            {/* Received Amount */}
                            <TableCell className="px-6 text-emerald-500 font-extrabold font-mono text-right text-xs shrink-0">
                              ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </TableCell>

                            {/* Remaining Balance */}
                            <TableCell className="px-6 text-right">
                              {safeBalance <= 0 ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_2px_10px_rgba(16,185,129,0.05)]">
                                  <CheckCircle className="w-3 h-3" />
                                  Fully Settled
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono shadow-[0_2px_10px_rgba(245,158,11,0.05)]">
                                  ₹{safeBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Preview slip button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                  onClick={() => handlePreviewReceipt(p)}
                                  title="View Receipt Slip"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                {/* Download Receipt Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                  onClick={() => {
                                    handlePreviewReceipt(p);
                                    setTimeout(() => handlePrintReceipt(), 350);
                                  }}
                                  title="Download / Print PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>

                                {/* Delete collection record */}
                                {userPermissions.includes("Payments.CRUD") && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    onClick={() => handleDeletePayment(p)}
                                    title="Void Transaction Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="h-[400px]">
                          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <Coins className="w-10 h-10 text-primary opacity-80" />
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-2">No Payments Found</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              There are no payment receipts matching your current filters. Try resetting them or record a new collection.
                            </p>
                            <Button onClick={handleOpenAddForm} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Plus className="w-4 h-4 mr-2" />
                              Record Payment Entry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* DIALOG 1: ADD PAYMENT COLLECTIONS DIALOG FORM */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-3xl rounded-2xl shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmitPayment}>
            
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/15">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span>Receive Customer Payment Entry</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record inbound cash flow, reconcile balance amounts, and issue printed A4 receipt slips automatically.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Form Body Fields - 2 Column Split Grid */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* SECTION A: Invoice Information Selection */}
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2 border-b border-border pb-1">
                  1. Bill / Invoice Alignment Section
                </span>
              </div>

              {/* Invoice Selector */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="invoiceSelect" className="text-xs font-bold text-foreground/80">Select Pending Invoice Ledger *</Label>
                <Select
                  value={selectedInvoiceId || "none"}
                  onValueChange={(val) => {
                    const finalVal = val === "none" ? "" : val
                    setSelectedInvoiceId(finalVal)
                    const inv = invoices.find(i => i.id == finalVal)
                    if (inv) {
                      setPaymentAmount(inv.balanceAmount.toString())
                      setFormErrors(prev => ({ ...prev, selectedInvoiceId: "", paymentAmount: "" }))
                    }
                  }}
                >
                  <SelectTrigger id="invoiceSelect" className={`px-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none transition-all ${formErrors.selectedInvoiceId ? "border-red-500 focus:border-red-500" : ""}`}>
                    <SelectValue placeholder="-- Choose Outstanding Invoice --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Choose Outstanding Invoice --</SelectItem>
                    {invoices
                      .filter(inv => inv.status !== "Draft" && inv.status !== "Cancelled" && inv.status !== "Paid" && inv.balanceAmount > 0)
                      .map(inv => (
                        <SelectItem key={inv.id} value={inv.id.toString()}>
                          {inv.invoiceNumber} - {inv.customerName} (Bal Due: ₹{inv.balanceAmount.toLocaleString("en-IN")} / Total: ₹{inv.grandTotal.toLocaleString("en-IN")})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formErrors.selectedInvoiceId && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.selectedInvoiceId}</span>}
              </div>

              {/* Auto Fill Customer Details */}
              {selectedInvoice && (
                <>
                  {/* Customer Company Name */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground font-semibold">Customer / Buyer Profile</Label>
                    <Input 
                      value={selectedInvoice.customerName} 
                      readOnly 
                      className="bg-muted text-muted-foreground font-bold text-xs rounded-xl h-10 cursor-not-allowed"
                    />
                  </div>

                  {/* Due Date & Invoice Date */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground font-semibold">Terms Date & Limits</Label>
                    <Input 
                      value={`Billed: ${selectedInvoice.invoiceDate} / Limit: ${selectedInvoice.dueDate}`} 
                      readOnly 
                      className="bg-muted text-muted-foreground font-bold text-xs rounded-xl h-10 cursor-not-allowed"
                    />
                  </div>

                  {/* Pricing metrics grid summary */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/80">
                    <div>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Bill Amount</span>
                      <span className="text-xs font-bold font-mono text-foreground">₹{selectedInvoice.grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Amount Paid Previously</span>
                      <span className="text-xs font-bold font-mono text-emerald-500">₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Current Outstanding Balance</span>
                      <span className="text-xs font-bold font-mono text-amber-500">₹{selectedInvoice.balanceAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION B: Payment Details Information */}
              <div className="col-span-2 pt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2 border-b border-border pb-1">
                  2. Collection & Payment Specifications
                </span>
              </div>

              {/* Payment Date */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="payDate" className="text-xs font-bold text-foreground/80">Payment Received Date *</Label>
                <Input 
                  id="payDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={`bg-background border-border rounded-xl h-10 text-xs font-semibold ${formErrors.paymentDate ? "border-red-500" : ""}`}
                />
                {formErrors.paymentDate && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.paymentDate}</span>}
              </div>

              {/* Payment Amount */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="payAmount" className="text-xs font-bold text-foreground/80">Payment Amount (INR) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="payAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 15000"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value)
                      setFormErrors(prev => ({ ...prev, paymentAmount: "" }))
                    }}
                    className={`pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono font-bold text-foreground ${formErrors.paymentAmount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.paymentAmount && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.paymentAmount}</span>}
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="payModeSelect" className="text-xs font-bold text-foreground/80">Payment Mode *</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(val: any) => {
                    setPaymentMode(val)
                    setFormErrors(prev => ({ ...prev, transactionId: "", refNumber: "", chequeNumber: "" }))
                  }}
                >
                  <SelectTrigger id="payModeSelect" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none">
                    <SelectValue placeholder="Select Payment Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI (BHIM/GPay/PhonePe)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS/RTGS)</SelectItem>
                    <SelectItem value="Cash">Cash Collection</SelectItem>
                    <SelectItem value="Cheque">Bank Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Received By */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="receivedBySelect" className="text-xs font-bold text-foreground/80">Received By Staff *</Label>
                <Select value={receivedBy} onValueChange={setReceivedBy}>
                  <SelectTrigger id="receivedBySelect" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECEIVED_BY_LIST.map(staff => (
                      <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* DYNAMIC METADATA INPUTS depending on Mode Selected */}
              {paymentMode === "UPI" && (
                <div className="space-y-1.5 col-span-2 animate-fadeIn">
                  <Label htmlFor="upiTxnId" className="text-xs font-bold text-foreground/80">UPI Transaction ID / Ref No (12-Digit)*</Label>
                  <Input 
                    id="upiTxnId"
                    placeholder="e.g. 609204859012"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className={`bg-background border-border rounded-xl h-10 text-xs font-mono font-semibold ${formErrors.transactionId ? "border-red-500" : ""}`}
                  />
                  {formErrors.transactionId && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.transactionId}</span>}
                </div>
              )}

              {paymentMode === "Bank Transfer" && (
                <div className="space-y-1.5 col-span-2 animate-fadeIn">
                  <Label htmlFor="utrNumber" className="text-xs font-bold text-foreground/80">NEFT / IMPS / RTGS UTR Number *</Label>
                  <Input 
                    id="utrNumber"
                    placeholder="e.g. UTIB000028392010"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className={`bg-background border-border rounded-xl h-10 text-xs font-mono font-semibold ${formErrors.refNumber ? "border-red-500" : ""}`}
                  />
                  {formErrors.refNumber && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.refNumber}</span>}
                </div>
              )}

              {paymentMode === "Cheque" && (
                <div className="space-y-1.5 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label htmlFor="chqNumber" className="text-xs font-bold text-foreground/80">Cheque Number (6-Digit) *</Label>
                    <Input 
                      id="chqNumber"
                      placeholder="e.g. 483012"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className={`bg-background border-border rounded-xl h-10 text-xs font-mono font-semibold ${formErrors.chequeNumber ? "border-red-500" : ""}`}
                    />
                    {formErrors.chequeNumber && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.chequeNumber}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bankRef" className="text-xs font-bold text-foreground/80">Issuing Bank Details</Label>
                    <Input 
                      id="bankRef"
                      placeholder="e.g. HDFC Bank, BKC Branch"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="bg-background border-border rounded-xl h-10 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Upload Proof (Advanced container slot) */}
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold text-foreground/80">Upload Transaction Proof (Screenshot / Deposit Slip / PDF)</Label>
                <div className="border border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center relative bg-muted/10 cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/80" />
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    <span className="text-primary font-bold">Click to attach file</span> or drag & drop logs
                  </div>
                  <span className="text-[8px] text-muted-foreground/60 block">PDF, PNG, JPG formats up to 5MB</span>
                  
                  <input 
                    type="file" 
                    onChange={handleFileChangeSimulation}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*,application/pdf"
                  />
                  
                  {uploadedProofName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] bg-primary/10 border border-primary/20 text-primary font-mono font-bold animate-pulse">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      <span>{uploadedProofName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="formNotes" className="text-xs font-bold text-foreground/80">Office Log Notes / Remarks</Label>
                <textarea 
                  id="formNotes"
                  placeholder="Payment remarks e.g. Received under partial credit extension log limits."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl p-3 w-full text-xs font-medium text-foreground outline-none resize-none transition-all"
                />
              </div>

            </div>

            {/* Form Footer Action Panels */}
            <div className="px-6 py-4 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-3 bg-muted/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-bold hover:bg-muted text-muted-foreground rounded-xl h-10 px-4 w-full sm:w-auto"
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-5 rounded-xl flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Payment & Slip</span>
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: TRANSACTION RECEIPTS PREVIEW SLIP (PRINT & A4 COMPLIANT) */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #print-only-layout, #print-only-layout * { visibility: visible !important; }
            #print-only-layout { 
              position: relative !important; 
              width: 100% !important; 
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            /* Proportionally enlarge all fonts for professional A4 readability */
            #print-only-layout .text-\\[9px\\] { font-size: 11px !important; line-height: 1.4 !important; }
            #print-only-layout .text-\\[10px\\] { font-size: 13px !important; line-height: 1.4 !important; }
            #print-only-layout .text-[11px] { font-size: 14px !important; line-height: 1.4 !important; }
            #print-only-layout .text-xs { font-size: 15px !important; line-height: 1.5 !important; }
            #print-only-layout .text-sm { font-size: 17px !important; line-height: 1.5 !important; }
            #print-only-layout .text-lg { font-size: 20px !important; line-height: 1.5 !important; }
            #print-only-layout .text-xl { font-size: 24px !important; line-height: 1.5 !important; }
            #print-only-layout .text-2xl { font-size: 28px !important; line-height: 1.5 !important; }
          }
        `}</style>
        <DialogContent className="bg-white border-none text-black !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 w-full h-[100dvh] max-w-none max-h-none rounded-none shadow-none p-0 overflow-hidden flex flex-col print:block print:static print:transform-none print:overflow-visible print:max-h-none print:h-auto print:w-full print:border-none print:shadow-none print:bg-transparent print:p-0 print:m-0">
          
          {/* Action Buttons Panel (Hidden during printing) */}
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden shrink-0 text-foreground">
            <DialogTitle className="text-xs font-extrabold tracking-wider uppercase">
              Collection Receipt Preview
            </DialogTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handlePrintReceipt}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl h-9 px-4 flex-1 sm:flex-none items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download / Print</span>
              </Button>
              <Button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#1ebd5b] text-white font-semibold rounded-xl border-0 h-9 px-4 text-xs flex-1 sm:flex-none items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Share</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsReceiptOpen(false)}
                className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-lg shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Core Printable Receipt Body Content */}
          {selectedPayment && (
            <div id="print-only-layout" className="flex flex-col flex-1 overflow-hidden p-4 sm:p-8 space-y-6 print:p-4 print:bg-white print:text-black">
              
              {/* BRANDING HEADER SECTION */}
              <div className="flex items-start justify-between border-b border-border pb-6">
                <div className="flex items-start gap-4">
                  {/* Logo layout */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white shrink-0 shadow-md">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground print:text-black">{OUR_COMPANY.name}</h2>
                    <span className="block text-[10px] text-primary print:text-black font-extrabold uppercase tracking-widest">{OUR_COMPANY.address}, {OUR_COMPANY.city}</span>
                    <span className="block text-[10px] text-muted-foreground print:text-gray-600 font-bold font-mono">GSTIN: {OUR_COMPANY.gstin} | State: {OUR_COMPANY.state}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-xs font-black tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase px-3 py-1 rounded-md mb-1.5 print:bg-transparent print:border-black print:text-black">
                    PAYMENT RECEIPT
                  </span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-600 font-mono font-bold">Receipt No: <span className="text-foreground print:text-black font-black font-sans">{selectedPayment.receiptNumber}</span></span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-600 font-mono font-bold">Date: <span className="text-foreground print:text-black font-sans font-semibold">{selectedPayment.paymentDate}</span></span>
                </div>
              </div>

              {/* CLIENT PROFILE & INBOUND BILL LINKAGE SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border/80 print:bg-transparent print:border-black">
                
                {/* Client column */}
                <div>
                  <span className="block text-[9px] text-muted-foreground print:text-gray-600 uppercase font-black tracking-widest mb-1.5">Received From Customer</span>
                  <span className="block text-sm font-bold text-foreground print:text-black">{selectedPayment.customerName}</span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-600 mt-1">
                    Thank you for your valuable corporate business relationships!
                  </span>
                </div>

                {/* Bill column */}
                <div className="text-right">
                  <span className="block text-[9px] text-muted-foreground print:text-gray-600 uppercase font-black tracking-widest mb-1.5">Against Outbound Invoice</span>
                  <span className="block text-sm font-extrabold font-mono text-foreground print:text-black">{selectedPayment.invoiceNumber}</span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-600 font-mono font-semibold mt-1">Invoice Total: ₹{((selectedPayment.invoiceTotal) ?? (invoices.find(i => i.id == selectedPayment.invoiceId)?.grandTotal) ?? 0).toLocaleString("en-IN")}</span>
                </div>

              </div>

              {/* PAYMENT DATA GRID SUMMARY */}
              <div className="border border-border/80 rounded-xl overflow-x-auto print:overflow-hidden print:border-black">
                <Table className="print:text-black">
                  <TableHeader className="bg-muted/30 border-b border-border/80 print:bg-transparent print:border-black">
                    <TableRow className="hover:bg-transparent print:border-black">
                      <TableHead className="text-foreground print:text-black font-bold px-6">Payment Mode</TableHead>
                      <TableHead className="text-foreground print:text-black font-bold px-6">Transaction Ref / Cheque</TableHead>
                      <TableHead className="text-foreground print:text-black font-bold px-6">Authorizing Desk</TableHead>
                      <TableHead className="text-foreground print:text-black font-extrabold px-6 text-right w-[180px]">Collected Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent h-14 print:border-black">
                      <TableCell className="px-6 font-semibold">{selectedPayment.paymentMode}</TableCell>
                      <TableCell className="px-6 font-mono text-xs">{selectedPayment.referenceNumber || selectedPayment.transactionId || selectedPayment.transactionRef || "N/A"}</TableCell>
                      <TableCell className="px-6 text-xs font-semibold">{selectedPayment.receivedBy || "Administrator"}</TableCell>
                      <TableCell className="px-6 text-emerald-500 print:text-black font-black font-mono text-right text-sm">
                        ₹{selectedPayment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* ACCOUNT DUES BALANCE RECONCILIATION SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* QR Code UPI Payload simulated block */}
                <div className="col-span-2 border border-border/60 p-4 rounded-xl flex items-center gap-4 print:border-black print:hidden">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-1 relative shadow-sm">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">BHIM UPI Payments</span>
                    <span className="block text-[10px] text-foreground font-semibold">Fast Reconciliations Logging</span>
                    <p className="text-[9px] text-muted-foreground/80 font-medium mt-1">Scan to authorize direct bank collections instantly.</p>
                  </div>
                </div>

                {/* Right side balance tally column */}
                <div className="col-span-3 sm:col-span-1 bg-muted/15 p-4 rounded-xl border border-border/80 flex flex-col justify-center space-y-1.5 print:bg-transparent print:border-black">
                  <div className="flex items-center justify-between text-xs text-muted-foreground print:text-gray-700">
                    <span>Invoice Total:</span>
                    <span className="font-mono">₹{((selectedPayment.invoiceTotal) ?? (invoices.find(i => i.id == selectedPayment.invoiceId)?.grandTotal) ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-500 print:text-black font-semibold">
                    <span>Paid Collection:</span>
                    <span className="font-mono">₹{(selectedPayment.amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-1.5 text-xs text-foreground font-black print:text-black print:border-black">
                    <span>Balance Remaining:</span>
                    <span className="font-mono text-amber-500 print:text-black font-black">₹{((selectedPayment.balanceRemaining) ?? (invoices.find(i => i.id == selectedPayment.invoiceId)?.balanceAmount) ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

              </div>

              {/* REMARKS AND NOTES */}
              {selectedPayment.notes && (
                <div className="text-xs text-muted-foreground print:text-gray-600 italic bg-muted/5 p-3 rounded-lg border border-border/40 print:border-none">
                  <span className="font-bold block text-[10px] uppercase text-foreground/80 print:text-black not-italic mb-0.5">Office Remarks</span>
                  &ldquo;{selectedPayment.notes}&rdquo;
                </div>
              )}

              {/* RECEIPT FOOTER */}
              <div className="flex items-end justify-between border-t border-border pt-8 mt-auto print:border-black">
                <div>
                  <span className="block text-xs font-bold text-foreground print:text-black">Terms of Receipt:</span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-500">1. This is a computer generated collection credit log.</span>
                  <span className="block text-[10px] text-muted-foreground print:text-gray-500">2. Subject to realization of bank funds for cheque deposits.</span>
                </div>

                <div className="text-center w-48 shrink-0">
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/40 italic font-medium print:hidden">[Digital Accounts Seal]</span>
                  </div>
                  <div className="border-t border-border/80 pt-1.5 print:border-black">
                    <span className="block text-[10px] font-bold text-foreground print:text-black">Authorized Signatory</span>
                    <span className="block text-[9px] text-muted-foreground print:text-gray-600">Accounts & Ledger Division</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>

    </div>
  )
}








