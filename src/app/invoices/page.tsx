"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Plus, 
  Search, 
  Trash2, 
  Menu,
  Sun,
  Moon,
  Package,
  Truck,
  IndianRupee,
  Calendar,
  Eye,
  CheckCircle,
  Printer,
  Download,
  Mail,
  Coins,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowLeftRight,
  QrCode,
  CreditCard,
  AlertCircle,
  FileCheck,
  X,
  Bell,
  ChevronDown,
  MessageCircle,
  MapPin,
  Send
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
  DialogFooter, 
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

function SearchableSelect({ options, value, onChange, placeholder, required = false }: { options: {id: string|number, label: string}[], value: string|number, onChange: (val: string|number) => void, placeholder: string, required?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(opt => opt.id.toString() === value.toString());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none flex items-center justify-between cursor-pointer ${!selectedOption && required ? 'border-red-300' : ''}`}
      >
        <span className={selectedOption ? "text-foreground truncate block w-full text-left" : "text-muted-foreground truncate block w-full text-left"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-2" />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-60 top-full">
          <div className="p-2 border-b border-border bg-muted/20">
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">No matches found.</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id}
                  className="px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 text-foreground transition-colors truncate"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Interfaces matching exact DB Schema specifications
interface Customer {
  id: number | string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

interface Product {
  id: number | string;
  productName: string;
  categoryName: number | string;
  hsnCode: string;
  barcode?: string;
  unitPrice: number;
  gstPercent: number;
  stockQuantity: number;
  unit: string;
  description: string;
  createdAt: string;
}

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

export interface PaymentRecord {
  id: string | number;
  date: string;
  amount: number;
  mode: "Cash" | "UPI" | "Bank Transfer" | "Credit Card" | "Cheque" | "Other" | "None";
  referenceId: string;
  notes: string;
}

interface Invoice {
  id: number | string;
  invoiceNumber: string;
  quotationNumber?: string; // Optional linkage to approved quotation
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
  // Logistics / Dispatch Fields
  dispatchStatus?: "Pending" | "Packed" | "Dispatched" | "In Transit" | "Delivered" | "Returned";
  courierPartner?: string;
  trackingNumber?: string;
  dispatchDate?: string;
  paymentHistory?: PaymentRecord[];
}

interface Quotation {
  id: number | string;
  quotationNumber: string;
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
  currency: "INR" | "USD";
  quotationDate: string;
  expiryDate: string;
  subTotal: number;
  discountAmount: number;
  gstAmount: number;
  shippingCharges: number;
  roundOff: number;
  grandTotal: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  notes: string;
  termsConditions: string;
  createdBy: string;
  createdAt: string;
  items: {
    productId: number | string;
    productName: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    gstPercent?: number;
    discountType?: "Percentage" | "Flat";
    discountValue?: number;
    lineTotal?: number;
  }[];
}

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

const SALES_PERSONS = ["Rohan Mehta", "Pooja Sharma", "Karan Malhotra", "Sneha Rao"];
const PAYMENT_TERMS = ["7 Days", "15 Days", "30 Days", "Immediate"];

// Seed defaults
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 1,
    companyName: "TechPulse Solutions Pvt Ltd",
    contactPerson: "Rajesh Sharma",
    phone: "9876543210",
    email: "rajesh@techpulse.in",
    gstNumber: "27AAAAA1111A1Z1",
    address: "402, Signature Towers, Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    createdAt: "2026-05-10T11:30:00.000Z"
  },
  {
    id: 2,
    companyName: "Vardhaman Steel & Alloys",
    contactPerson: "Amit Patel",
    phone: "9123456789",
    email: "billing@vardhamansteel.com",
    gstNumber: "24CCCCC3333C3Z3",
    address: "GIDC Industrial Estate, Phase 3, Vatva",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382445",
    createdAt: "2026-05-15T09:45:00.000Z"
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    productName: "HP ProBook 450 G10 Laptop",
    categoryName: "Electronics",
    hsnCode: "84713010",
    unitPrice: 54999.00,
    gstPercent: 18,
    stockQuantity: 25,
    unit: "Pcs",
    description: "Intel Core i5, 16GB RAM, 512GB SSD, Windows 11 Pro Enterprise Edition.",
    createdAt: "2026-05-10T12:00:00.000Z"
  },
  {
    id: 2,
    productName: "High Grade Stainless Steel Sheets (304)",
    categoryName: "Raw Materials",
    hsnCode: "72199000",
    unitPrice: 180.00,
    gstPercent: 18,
    stockQuantity: 1200,
    unit: "Kgs",
    description: "Grade 304 hot rolled stainless steel plate, thickness 2mm - 5mm.",
    createdAt: "2026-05-12T09:30:00.000Z"
  }
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2026-0001",
    quotationNumber: "QT-2026-0001",
    customerId: 1,
    customerName: "TechPulse Solutions Pvt Ltd",
    customerGSTIN: "27AAAAA1111A1Z1",
    customerState: "Maharashtra",
    customerEmail: "rajesh@techpulse.in",
    customerAddress: "402, Signature Towers, Bandra Kurla Complex",
    customerCity: "Mumbai",
    customerPhone: "9876543210",
    contactPerson: "Rajesh Sharma",
    shippingAddress: "402, Signature Towers, BKC, Mumbai",
    salesPerson: "Rohan Mehta",
    paymentTerms: "15 Days",
    invoiceDate: "2026-05-22",
    dueDate: "2026-06-06",
    currency: "INR",
    subTotal: 104498.10,
    discountAmount: 5499.90,
    gstAmount: 18809.66,
    shippingCharges: 150,
    roundOff: 0.14,
    grandTotal: 117958.00,
    paidAmount: 50000.00,
    balanceAmount: 67958.00,
    paymentMode: "Bank Transfer",
    transactionRef: "TXN58392049",
    status: "Partial Paid",
    notes: "Part payment received. Remaining balance to be paid before due date.",
    termsConditions: "1. Payment within 15 days.\n2. Goods once sold will not be returned.",
    createdBy: "Administrator",
    createdAt: "2026-05-22T10:15:00.000Z",
    items: [
      {
        id: 1,
        productId: 1,
        productName: "HP ProBook 450 G10 Laptop",
        description: "Standard model with corporate warranty log",
        quantity: 2,
        unit: "Pcs",
        unitPrice: 54999.00,
        gstPercent: 18,
        discountType: "Percentage",
        discountValue: 5,
        lineTotal: 117807.86
      }
    ]
  }
];

// Helper to translate grand total to English words
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const regex = new RegExp('[0-9]{1,9}');
  if (!regex.test(num.toString())) return 'Amount too large';
  const n = ('000000000' + Math.round(num)).substr(-9);
  let cmd = '';
  
  const crore = parseInt(n.substr(0, 2));
  const lakh = parseInt(n.substr(2, 2));
  const thousand = parseInt(n.substr(4, 2));
  const hundred = parseInt(n.substr(6, 1));
  const tens = parseInt(n.substr(7, 2));

  if (crore) cmd += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + ' ' + a[crore % 10]) + 'Crore ';
  if (lakh) cmd += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10]) + 'Lakh ';
  if (thousand) cmd += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10]) + 'Thousand ';
  if (hundred) cmd += a[hundred] + 'Hundred ';
  if (tens) cmd += (tens < 20 ? a[tens] : b[Math.floor(tens / 10)] + ' ' + a[tens % 10]);

  return cmd.trim() ? cmd.trim() + ' Rupees Only' : 'Zero Rupees Only';
}

export default function InvoicesPage() {
  const [mounted, setMounted] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  
  // Data lists loaded from local storage directly in constructor
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("invoice_management_customers")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.error(error)
        }
      }
    }
    return DEFAULT_CUSTOMERS
  })

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("invoice_management_products")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.error(error)
        }
      }
    }
    return DEFAULT_PRODUCTS
  })

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("invoice_management_quotations")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.error(error)
        }
      }
    }
    return []
  })

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("invoice_management_invoices")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.error(error)
        }
      }
    }
    return SEED_INVOICES
  })

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
    }
    
    const loadData = async () => {
      try {
        const [invRes, custRes, prodRes, settingsRes] = await Promise.all([
          api.invoices.getAll(),
          api.customers.getAll(),
          api.products.getAll(),
          api.settings.get()
        ])
        setInvoices(Array.isArray(invRes) ? invRes : [])
        setCustomers(Array.isArray(custRes) ? custRes : [])
        setProducts(Array.isArray(prodRes) ? prodRes : [])
        if (settingsRes) setWorkspaceSettings(settingsRes)
      } catch (e) {
        console.error("Failed to load initial data", e)
      }
    }
    loadData()

    const handle = requestAnimationFrame(() => {
      if (typeof window !== "undefined") {
        const savedQuotations = localStorage.getItem("invoice_management_quotations")
        if (savedQuotations) {
          setQuotations(JSON.parse(savedQuotations))
        }
      }
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Theme state
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

  // Sync state helpers
  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices)
    localStorage.setItem("invoice_management_invoices", JSON.stringify(newInvoices))
  }

  // Dialog management states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isChallanMode, setIsChallanMode] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState<"Pending" | "Packed" | "Dispatched" | "In Transit" | "Delivered" | "Returned">("Pending")
  const [courierPartner, setCourierPartner] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [dispatchDate, setDispatchDate] = useState("")
  // Dynamic Multi-Field Invoice Form State variables
  const [invoiceId, setInvoiceId] = useState<number | string>("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [linkedQuotationNumber, setLinkedQuotationNumber] = useState("")
  const [invoiceCustomerId, setInvoiceCustomerId] = useState<number | string>("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [billingAddress, setBillingAddress] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [salesPerson, setSalesPerson] = useState(SALES_PERSONS[0])
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[1])
  const [currency, setCurrency] = useState<"INR" | "USD">("INR")
  const [invoiceStatus, setInvoiceStatus] = useState<"Draft" | "Paid" | "Pending" | "Partial Paid" | "Cancelled" | "Overdue">("Pending")
  
  // Array of active Invoice Items (Dynamic multiple row list)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  
  // Notes & terms
  const [notes, setNotes] = useState("Payment due immediately within terms limit.")
  const [termsConditions, setTermsConditions] = useState("1. Payment within 15 days.\n2. Goods once sold will not be returned.")
  
  // Shipping charge & Paid amounts
  const [shippingCharges, setShippingCharges] = useState<number>(0)
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [workspaceSettings, setWorkspaceSettings] = useState<any>(null)

  // Payment Modal States
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false)
  const [payAmountInput, setPayAmountInput] = useState("")
  const [payModeInput, setPayModeInput] = useState<PaymentRecord["mode"]>("UPI")
  const [payDateInput, setPayDateInput] = useState(new Date().toISOString().split("T")[0])
  const [payRefInput, setPayRefInput] = useState("")
  const [payNotesInput, setPayNotesInput] = useState("")

  // Payment information
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer" | "Credit Card" | "None">("None")
  const [transactionRef, setTransactionRef] = useState("")

  // Form editing indicator
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  // Listen for Chatbot Events
  useEffect(() => {
    const handleBotCreate = () => {
      // Reset form fields
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`)
      setLinkedQuotationNumber("")
      setInvoiceCustomerId("")
      setInvoiceDate(new Date().toISOString().split("T")[0])
      
      const due = new Date()
      due.setDate(due.getDate() + 15)
      setDueDate(due.toISOString().split("T")[0])
      
      setBillingAddress("")
      setShippingAddress("")
      setCurrency("INR")
      setInvoiceStatus("Pending")
      setInvoiceItems([])
      setShippingCharges(0)
      setPaidAmount(0)
      setNotes("Payment due immediately within terms limit.")
      setIsEditingExisting(false)
      setInvoiceId("")

      // Open Modal
      setIsCreateOpen(true)
    };

    window.addEventListener('BOT_ACTION_CREATE_INVOICE', handleBotCreate);
    return () => window.removeEventListener('BOT_ACTION_CREATE_INVOICE', handleBotCreate);
  }, []);

  // ----------------------------------------------------
  // Barcode Scanner Integration (Fast Keystroke Listener)
  // ----------------------------------------------------
  useEffect(() => {
    if (!isCreateOpen) return;

    let barcodeString = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // If time between keystrokes is more than 50ms, it's a human typing, reset.
      if (currentTime - lastKeyTime > 50) {
        barcodeString = "";
      }
      
      if (e.key === 'Enter' && barcodeString.length >= 4) {
        const scannedBarcode = barcodeString;
        barcodeString = ""; // Reset
        
        // Find product by barcode
        const matchedProduct = products.find(p => p.barcode === scannedBarcode);
        
        if (matchedProduct) {
          // Prevent form submission if we intercepted a barcode
          e.preventDefault();
          
          setInvoiceItems(prev => {
            const existing = prev.find(item => item.productId.toString() === matchedProduct.id.toString());
            if (existing) {
              const qty = existing.quantity + 1;
              const baseTotal = qty * existing.unitPrice;
              let rowDiscAmount = 0;
              if (existing.discountType === "Percentage") {
                rowDiscAmount = baseTotal * (existing.discountValue / 100);
              } else {
                rowDiscAmount = Math.min(existing.discountValue, baseTotal);
              }
              const taxableAmount = baseTotal - rowDiscAmount;
              const rowGst = taxableAmount * (existing.gstPercent / 100);
              const newLineTotal = parseFloat((taxableAmount + rowGst).toFixed(2));
              
              toast.success(`Scanned: ${matchedProduct.productName} (Qty: ${qty})`);
              return prev.map(item => item.id === existing.id ? { ...item, quantity: qty, lineTotal: newLineTotal } : item);
            } else {
              const baseTotal = 1 * matchedProduct.unitPrice;
              const rowGst = baseTotal * (matchedProduct.gstPercent / 100);
              
              const newRowItem: InvoiceItem = {
                id: Math.floor(Math.random() * 10000000),
                productId: matchedProduct.id,
                productName: matchedProduct.productName,
                description: matchedProduct.description || "Scanned via Barcode",
                quantity: 1,
                unit: matchedProduct.unit || "Pcs",
                unitPrice: matchedProduct.unitPrice,
                gstPercent: matchedProduct.gstPercent,
                discountType: "Percentage",
                discountValue: 0,
                lineTotal: parseFloat((baseTotal + rowGst).toFixed(2))
              };
              toast.success(`Scanned: ${matchedProduct.productName} added to bill!`);
              return [...prev, newRowItem];
            }
          });
        }
      } else if (e.key.length === 1) {
        // Only append single characters (alphanumeric)
        barcodeString += e.key;
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateOpen, products]);

  // ----------------------------------------------------
  // Dynamic Calculations Engine (Formula-aligned)
  // ----------------------------------------------------
  const calculateFormTotals = (
    itemsList: InvoiceItem[], 
    shipCharges: number, 
    paidAmt: number,
    custId: number | string
  ) => {
    let subtotalSum = 0
    let discountSum = 0
    let gstSum = 0

    itemsList.forEach(item => {
      // Line item math
      const baseProductTotal = item.quantity * item.unitPrice
      let discountAmount = 0
      
      if (item.discountType === "Percentage") {
        discountAmount = baseProductTotal * (item.discountValue / 100)
      } else {
        discountAmount = Math.min(item.discountValue, baseProductTotal)
      }

      const taxableLineAmount = baseProductTotal - discountAmount
      const lineGst = taxableLineAmount * (item.gstPercent / 100)
      
      subtotalSum += taxableLineAmount
      discountSum += discountAmount
      gstSum += lineGst
    })

    // IGST vs CGST/SGST calculation based on buyer state
    const customerObj = customers.find(c => c.id.toString() === custId.toString())
    const isIGST = customerObj ? customerObj.state !== OUR_COMPANY.state : false

    const rawGrandTotal = subtotalSum + gstSum + shipCharges
    const roundedGrandTotal = Math.round(rawGrandTotal)
    const roundOffDiff = roundedGrandTotal - rawGrandTotal

    // Auto calculate balance amount
    const balanceAmt = roundedGrandTotal - paidAmt

    // Dynamic auto status helper logic based on payments received
    let computedStatus: "Draft" | "Paid" | "Pending" | "Partial Paid" | "Cancelled" = "Pending"
    if (paidAmt === 0) {
      computedStatus = "Pending"
    } else if (paidAmt > 0 && paidAmt < roundedGrandTotal) {
      computedStatus = "Partial Paid"
    } else if (paidAmt >= roundedGrandTotal) {
      computedStatus = "Paid"
    }

    return {
      subTotal: parseFloat(subtotalSum.toFixed(2)),
      discountAmount: parseFloat(discountSum.toFixed(2)),
      gstAmount: parseFloat(gstSum.toFixed(2)),
      shippingCharges: shipCharges,
      roundOff: parseFloat(roundOffDiff.toFixed(2)),
      grandTotal: roundedGrandTotal,
      balanceAmount: parseFloat(Math.max(0, balanceAmt).toFixed(2)),
      isIGST,
      computedStatus
    }
  }

  // Active form summary trigger
  const activeSummary = calculateFormTotals(invoiceItems, shippingCharges, paidAmount, invoiceCustomerId)

  // Side-effect: When paid amount is edited, auto set status mode to computed status
  useEffect(() => {
    if (isCreateOpen) {
      const handle = requestAnimationFrame(() => {
        setInvoiceStatus(activeSummary.computedStatus)
      })
      return () => cancelAnimationFrame(handle)
    }
  }, [paidAmount, activeSummary.computedStatus, isCreateOpen])

  // Auto-Fill Form values when selecting a customer
  const handleCustomerSelection = (custId: number | string) => {
    setInvoiceCustomerId(custId)
    const customer = customers.find(c => c.id.toString() === custId.toString())
    if (customer) {
      setBillingAddress(customer.address + ", " + customer.city + ", " + customer.state + " - " + customer.pincode)
      setShippingAddress(customer.address + ", " + customer.city + ", " + customer.state + " - " + customer.pincode)
      toast.success(`Client profile pulled for ${customer.companyName}`)
    } else {
      setBillingAddress("")
      setShippingAddress("")
    }
  }

  // Auto-fill entire Invoice from Approved Quotation selection
  const handleQuotationLinkage = (qNo: string) => {
    setLinkedQuotationNumber(qNo)
    const quote = quotations.find(q => q.quotationNumber === qNo)
    if (quote) {
      setInvoiceCustomerId(quote.customerId)
      setBillingAddress(quote.customerAddress)
      setShippingAddress(quote.shippingAddress || quote.customerAddress)
      setSalesPerson(quote.salesPerson)
      setCurrency(quote.currency)
      setNotes(quote.notes || "Invoice linked to quotation log " + qNo)
      setTermsConditions(quote.termsConditions)
      setShippingCharges(quote.shippingCharges || 0)
      
      // Auto load product rows with new IDs
      const loadedItems: InvoiceItem[] = quote.items.map((item: { productId: number | string; productName: string; description?: string; quantity?: number; unit?: string; unitPrice?: number; gstPercent?: number; discountType?: "Percentage" | "Flat"; discountValue?: number; lineTotal?: number; }) => ({
        id: Math.floor(Math.random() * 10000000),
        productId: item.productId,
        productName: item.productName,
        description: item.description || "Quotation mapped item",
        quantity: item.quantity || 1,
        unit: item.unit || "Pcs",
        unitPrice: item.unitPrice || 0,
        gstPercent: item.gstPercent || 18,
        discountType: item.discountType || "Percentage",
        discountValue: item.discountValue || 0,
        lineTotal: item.lineTotal || 0
      }))
      
      setInvoiceItems(loadedItems)
      toast.success(`Approved quotation ${qNo} details auto-loaded flawlessly!`)
    }
  }

  // ----------------------------------------------------
  // Product Row Adding & Realtime Inline calculations
  // ----------------------------------------------------
  const handleAddNewItemRow = () => {
    const defaultProduct = products[0]
    if (!defaultProduct) {
      toast.error("Please register products in inventory list first.")
      return
    }

    const newRowItem: InvoiceItem = {
      id: Math.floor(Math.random() * 10000000),
      productId: defaultProduct.id,
      productName: defaultProduct.productName,
      description: defaultProduct.description || "Standard ledger item log",
      quantity: 1,
      unit: defaultProduct.unit || "Pcs",
      unitPrice: defaultProduct.unitPrice,
      gstPercent: defaultProduct.gstPercent,
      discountType: "Percentage",
      discountValue: 0,
      lineTotal: defaultProduct.unitPrice + (defaultProduct.unitPrice * (defaultProduct.gstPercent / 100))
    }

    setInvoiceItems([...invoiceItems, newRowItem])
  }

  // Handle inline row item changes & recalculates line totals immediately
  const handleRowItemChange = (itemId: number | string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id == itemId) {
        const updated = { ...item, [field]: value }

        // If product is changed, reload standard rate, GST, unit and description
        if (field === "productId") {
          const productSelected = products.find(p => p.id == value)
          if (productSelected) {
            updated.productName = productSelected.productName
            updated.unitPrice = productSelected.unitPrice
            updated.gstPercent = productSelected.gstPercent
            updated.unit = productSelected.unit
            updated.description = productSelected.description || "Catalog item log"
          }
        }

        // Stock Availability Warning
        if (field === "quantity" || field === "productId") {
          const productSelected = products.find(p => p.id == updated.productId)
          if (productSelected && updated.quantity > productSelected.stockQuantity) {
            toast.error(`Stock Warning: Only ${productSelected.stockQuantity} ${productSelected.unit} available for ${productSelected.productName}.`, { duration: 4000 })
          }
        }

        // Recalculate dynamic lineTotal for the row
        const qty = updated.quantity
        const price = updated.unitPrice
        const baseTotal = qty * price
        
        let rowDiscAmount = 0
        if (updated.discountType === "Percentage") {
          rowDiscAmount = baseTotal * (updated.discountValue / 100)
        } else {
          rowDiscAmount = Math.min(updated.discountValue, baseTotal)
        }

        const taxableAmount = baseTotal - rowDiscAmount
        const rowGst = taxableAmount * (updated.gstPercent / 100)
        updated.lineTotal = parseFloat((taxableAmount + rowGst).toFixed(2))

        return updated
      }
      return item
    })

    setInvoiceItems(updatedItems)
  }

  const handleRemoveItemRow = (itemId: number | string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId))
  }

  // ----------------------------------------------------
  // Open Form to Create a Brand New Invoice
  // ----------------------------------------------------
  const handleOpenCreateForm = () => {
    setIsEditingExisting(false)
    setInvoiceId(Math.floor(Math.random() * 10000000))
    // Format Auto generated invoice code: INV-2026-0002
    setInvoiceNumber(`INV-2026-${String(invoices.length + 1).padStart(4, "0")}`)
    setLinkedQuotationNumber("")
    setInvoiceCustomerId("")
    setInvoiceDate(new Date().toISOString().split("T")[0])
    
    // Set default due date to 15 days ahead
    const exp = new Date()
    exp.setDate(exp.getDate() + 15)
    setDueDate(exp.toISOString().split("T")[0])
    
    setBillingAddress("")
    setShippingAddress("")
    setSalesPerson(SALES_PERSONS[0])
    setPaymentTerms(PAYMENT_TERMS[1])
    setCurrency("INR")
    setInvoiceStatus("Pending")
    setInvoiceItems([])
    setShippingCharges(0)
    setPaidAmount(0)
    setPaymentMode("None")
    setTransactionRef("")
    setNotes("Payment due immediately within terms limit.")
    setTermsConditions("1. Payment within 15 days.\n2. Goods once sold will not be returned.")
    
    setIsCreateOpen(true)
  }

  // ----------------------------------------------------
  // Open Form to Edit an Existing Invoice
  // ----------------------------------------------------
  const handleOpenEditForm = (inv: Invoice) => {
    setIsEditingExisting(true)
    setInvoiceId(inv.id)
    setInvoiceNumber(inv.invoiceNumber)
    setLinkedQuotationNumber(inv.quotationNumber || "")
    setInvoiceCustomerId(inv.customerId)
    setInvoiceDate(inv.invoiceDate)
    setDueDate(inv.dueDate)
    setBillingAddress(inv.customerAddress)
    setShippingAddress(inv.shippingAddress)
    setSalesPerson(inv.salesPerson)
    setPaymentTerms(inv.paymentTerms)
    setCurrency(inv.currency)
    setInvoiceStatus(inv.status)
    setInvoiceItems(inv.items)
    setShippingCharges(inv.shippingCharges)
    setPaidAmount(inv.paidAmount)
    setPaymentMode(inv.paymentMode)
    setTransactionRef(inv.transactionRef)
    setNotes(inv.notes)
    setTermsConditions(inv.termsConditions)
    
    setIsCreateOpen(true)
  }

  // ----------------------------------------------------
  // Payment History Handlers
  // ----------------------------------------------------
  const handleOpenPaymentRecord = (inv: Invoice) => {
    setSelectedInvoice(inv)
    setPayAmountInput(inv.balanceAmount > 0 ? inv.balanceAmount.toString() : "")
    setPayModeInput("UPI")
    setPayDateInput(new Date().toISOString().split("T")[0])
    setPayRefInput("")
    setPayNotesInput("")
    setIsPaymentRecordOpen(true)
  }

  const handleSavePaymentRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice) return

    const amount = parseFloat(payAmountInput)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    const newPayment: PaymentRecord = {
      id: Math.floor(Math.random() * 10000000).toString(),
      date: payDateInput,
      amount: amount,
      mode: payModeInput,
      referenceId: payRefInput,
      notes: payNotesInput
    }

    const updatedHistory = [...(selectedInvoice.paymentHistory || []), newPayment]
    const newPaidAmt = selectedInvoice.paidAmount + amount
    const newBalAmt = selectedInvoice.grandTotal - newPaidAmt
    
    let newStatus = selectedInvoice.status
    if (newBalAmt <= 0) newStatus = "Paid"
    else if (newPaidAmt > 0) newStatus = "Partial Paid"

    const updatedInvoice = {
      ...selectedInvoice,
      paymentHistory: updatedHistory,
      paidAmount: newPaidAmt,
      balanceAmount: Math.max(0, newBalAmt),
      status: newStatus
    }

    try {
      const result = await api.invoices.update(selectedInvoice.id, updatedInvoice)
      const updatedList = invoices.map(item => item.id.toString() === selectedInvoice.id.toString() ? result : item)
      saveInvoices(updatedList)
      toast.success(`Payment of ₹${amount} recorded for ${selectedInvoice.invoiceNumber}!`)
      setIsPaymentRecordOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment")
    }
  }

  const handlePrintReceipt = (payment: PaymentRecord, inv: Invoice) => {
    const receiptHtml = `
      <html>
        <head><title>Payment Receipt</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
          <div style="max-width: 600px; margin: auto; border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #4F46E5; margin-top: 0; font-size: 24px; letter-spacing: 2px;">PAYMENT RECEIPT</h2>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <h3 style="margin-bottom: 5px;">${OUR_COMPANY.name}</h3>
            <p style="margin-top: 0; color: #6b7280; font-size: 14px;">${OUR_COMPANY.address}, ${OUR_COMPANY.city}</p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px;">
              <div>
                <p style="margin: 5px 0;"><strong>Receipt ID:</strong> RCPT-${payment.id}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString("en-IN")}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 5px 0;"><strong>Against Invoice:</strong> ${inv.invoiceNumber}</p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 10px 0;"><strong>Received From:</strong> ${inv.customerName}</p>
              <p style="margin: 10px 0; font-size: 18px;"><strong>Amount Received:</strong> <span style="color: #10b981;">₹${payment.amount.toLocaleString("en-IN")}</span></p>
              <p style="margin: 10px 0;"><strong>Payment Mode:</strong> ${payment.mode}</p>
              ${payment.referenceId ? `<p style="margin: 10px 0;"><strong>Reference ID:</strong> ${payment.referenceId}</p>` : ''}
              ${payment.notes ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${payment.notes}</p>` : ''}
            </div>
            
            <p style="text-align: right; margin-top: 50px;"><strong>Authorized Signatory</strong></p>
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(receiptHtml);
    win?.document.close();
    win?.focus();
    win?.print();
  }

  // ----------------------------------------------------
  // Logistics / Tracking Handlers
  // ----------------------------------------------------
  const handleOpenTracking = (inv: Invoice) => {
    setSelectedInvoice(inv)
    setTrackingStatus(inv.dispatchStatus || "Pending")
    setCourierPartner(inv.courierPartner || "")
    setTrackingNumber(inv.trackingNumber || "")
    setDispatchDate(inv.dispatchDate || new Date().toISOString().split("T")[0])
    setIsTrackingOpen(true)
  }

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice) return

    const updatedInvoice = {
      ...selectedInvoice,
      dispatchStatus: trackingStatus,
      courierPartner: courierPartner,
      trackingNumber: trackingNumber,
      dispatchDate: dispatchDate
    }

    try {
      const result = await api.invoices.update(selectedInvoice.id, updatedInvoice)
      const updatedList = invoices.map(item => item.id.toString() === selectedInvoice.id.toString() ? result : item)
      saveInvoices(updatedList)
      toast.success(`Dispatch status updated for ${selectedInvoice.invoiceNumber}!`)
      setIsTrackingOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to update tracking info")
    }
  }

  const handleWhatsAppTracking = (inv: Invoice) => {
    let phone = inv.customerPhone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '91' + phone;

    let message = `Namaste ${inv.contactPerson || inv.customerName},%0A%0AAapka Order (Invoice *${inv.invoiceNumber}*) ka naya status: *${inv.dispatchStatus || 'Pending'}*.`;
    if (inv.courierPartner) message += `%0A*Courier:* ${inv.courierPartner}`;
    if (inv.trackingNumber) message += `%0A*Tracking No:* ${inv.trackingNumber}`;
    message += `%0A%0AThank you!%0A*${OUR_COMPANY.name}*`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // Save Invoice Form (Submit Handler)
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceCustomerId) {
      toast.error("Validation Error: Please select a customer.")
      return
    }

    if (invoiceItems.length === 0) {
      toast.error("Validation Error: Add at least one item to calculate totals.")
      return
    }

    const customerObj = customers.find(c => c.id.toString() === invoiceCustomerId.toString())
    if (!customerObj) return

    const summaryTotals = calculateFormTotals(invoiceItems, shippingCharges, paidAmount, invoiceCustomerId)

    const invoiceObj: Invoice = {
      id: invoiceId,
      invoiceNumber: invoiceNumber,
      quotationNumber: linkedQuotationNumber || undefined,
      customerId: customerObj.id,
      customerName: customerObj.companyName,
      customerGSTIN: customerObj.gstNumber,
      customerState: customerObj.state,
      customerEmail: customerObj.email,
      customerAddress: billingAddress,
      customerCity: customerObj.city,
      customerPhone: customerObj.phone,
      contactPerson: customerObj.contactPerson,
      shippingAddress: shippingAddress,
      salesPerson: salesPerson,
      paymentTerms: paymentTerms,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      currency: currency,
      subTotal: summaryTotals.subTotal,
      discountAmount: summaryTotals.discountAmount,
      gstAmount: summaryTotals.gstAmount,
      shippingCharges: shippingCharges,
      roundOff: summaryTotals.roundOff,
      grandTotal: summaryTotals.grandTotal,
      paidAmount: paidAmount,
      balanceAmount: summaryTotals.balanceAmount,
      paymentMode: paymentMode,
      transactionRef: transactionRef,
      status: invoiceStatus,
      notes: notes,
      termsConditions: termsConditions,
      createdBy: "Administrator",
      createdAt: new Date().toISOString(),
      items: invoiceItems
    }

    try {
      if (isEditingExisting) {
        const updatedInvoice = await api.invoices.update(invoiceId, invoiceObj)
        const updatedList = invoices.map(item => item.id.toString() === invoiceId.toString() ? updatedInvoice : item)
        saveInvoices(updatedList)
        toast.success(`Tax Invoice ${invoiceNumber} updated successfully!`)
      } else {
        const newInvoice = await api.invoices.create(invoiceObj)
        const updatedList = [newInvoice, ...invoices]
        saveInvoices(updatedList)
        toast.success(`New Tax Invoice ${invoiceNumber} generated successfully!`)
      }
      
      // Inventory/Stock Deduction Logic
      let updatedProducts = [...products];
      if (isEditingExisting) {
        // First, add back the quantities from the old invoice version
        const oldInvoice = invoices.find(inv => inv.id.toString() === invoiceId.toString());
        if (oldInvoice) {
          oldInvoice.items.forEach(oldItem => {
            const productIdx = updatedProducts.findIndex(p => p.id.toString() === oldItem.productId.toString());
            if (productIdx !== -1) {
              updatedProducts[productIdx] = { ...updatedProducts[productIdx], stockQuantity: updatedProducts[productIdx].stockQuantity + oldItem.quantity };
            }
          });
        }
      }
      
      // Now deduct the new quantities
      invoiceItems.forEach(newItem => {
        const productIdx = updatedProducts.findIndex(p => p.id.toString() === newItem.productId.toString());
        if (productIdx !== -1) {
          updatedProducts[productIdx] = { ...updatedProducts[productIdx], stockQuantity: Math.max(0, updatedProducts[productIdx].stockQuantity - newItem.quantity) };
        }
      });

      setProducts(updatedProducts);
      localStorage.setItem("invoice_management_products", JSON.stringify(updatedProducts));

      setIsCreateOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save invoice to system")
    }
  }

  // Handle invoice print preview trigger
  const handlePrintInvoice = () => {
    window.print()
  }

  // Override modern oklch/lab variables across the ENTIRE document temporarily
  // to guarantee html2canvas does not crash during getComputedStyle analysis
  const overrideCssVariables = () => {
      const root = document.documentElement;
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#000000');
      root.style.setProperty('--popover', '#ffffff');
      root.style.setProperty('--popover-foreground', '#000000');
      root.style.setProperty('--primary', '#4f46e5');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#f1f5f9');
      root.style.setProperty('--secondary-foreground', '#0f172a');
      root.style.setProperty('--muted', '#f8fafc');
      root.style.setProperty('--muted-foreground', '#64748b');
      root.style.setProperty('--accent', '#f1f5f9');
      root.style.setProperty('--accent-foreground', '#0f172a');
      root.style.setProperty('--destructive', '#ef4444');
      root.style.setProperty('--destructive-foreground', '#ffffff');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--input', '#e2e8f0');
      root.style.setProperty('--ring', '#4f46e5');
  };

  const restoreCssVariables = () => {
      const root = document.documentElement;
      const vars = [
        '--background', '--foreground', '--card', '--card-foreground', 
        '--popover', '--popover-foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
        '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
        '--border', '--input', '--ring'
      ];
      vars.forEach(v => root.style.removeProperty(v));
  };

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const printElement = document.getElementById('print-only-layout');
      if (!printElement) {
        toast.error("Template not found");
        return;
      }

      toast.loading("Generating High-Quality PDF...", { id: 'pdf-toast' });
      
      const opt = {
        margin:       10,
        filename:     `${selectedInvoice?.invoiceNumber || 'Invoice'}.pdf`,
        image:        { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      overrideCssVariables();
      await html2pdf().set(opt).from(printElement).save();
      restoreCssVariables();
      
      toast.success("PDF Downloaded Successfully!", { id: 'pdf-toast' });
    } catch (error) {
      restoreCssVariables();
      console.error(error);
      toast.error("Failed to generate PDF", { id: 'pdf-toast' });
    }
  }

  const handleEmailClient = async () => {
    if (!selectedInvoice) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const printElement = document.getElementById('print-only-layout');
      if (!printElement) {
        toast.error("Template not found");
        return;
      }

      toast.loading("Preparing invoice and sending email...", { id: 'email-toast' });
      
      const opt = {
        margin:       10,
        filename:     `${selectedInvoice.invoiceNumber}.pdf`,
        image:        { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      overrideCssVariables();
      const pdfBase64 = await html2pdf().set(opt).from(printElement).outputPdf('datauristring');
      restoreCssVariables();

      await api.invoices.sendEmail(selectedInvoice.id, pdfBase64);
      toast.success(`Invoice dispatched via email to ${selectedInvoice.customerEmail}!`, { id: 'email-toast' });
    } catch (error: any) {
      restoreCssVariables();
      console.error(error);
      toast.error(error.message || "Failed to send email", { id: 'email-toast' });
    }
  }

  const handleWhatsAppShare = () => {
    if (!selectedInvoice) return;
    
    let phone = selectedInvoice.customerPhone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = `91${phone}`;
    }
    
    const docType = isChallanMode ? "Delivery Challan" : "Tax Invoice";
    const amountStr = `${selectedInvoice.currency === "INR" ? "₹" : "$"}${selectedInvoice.grandTotal.toLocaleString("en-IN")}`;
    const dateStr = !isChallanMode ? `%0A*Due Date:* ${selectedInvoice.dueDate}` : '';
    
    const message = `Namaste ${selectedInvoice.contactPerson || selectedInvoice.customerName},%0A%0AAapka ${docType} *${selectedInvoice.invoiceNumber}* taiyaar hai.%0A*Total Amount:* ${amountStr}${dateStr}%0A%0AKripya is message ke sath bheji gayi PDF file check karein.%0A%0ADhanyawaad,%0A*${OUR_COMPANY.name}*`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // Get visually pleasing badge styles depending on invoice state
  const getStatusBadgeStyle = (statusVal: string) => {
    switch (statusVal) {
      case "Paid":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.05)]"
      case "Partial Paid":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.05)]"
      case "Pending":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.05)]"
      case "Cancelled":
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
      case "Overdue":
        return "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.05)]"
      default:
        return "bg-muted border-border text-foreground/80"
    }
  }

  const getDispatchBadge = (statusVal: string) => {
    switch (statusVal) {
      case "Packed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Dispatched":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "In Transit":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]";
      case "Returned":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  }

  const handleSendReminder = (inv: any) => {
    toast.success(`Stern payment reminder dispatched to ${inv.customerEmail} for Invoice ${inv.invoiceNumber}!`, { icon: '🚨' });
  }

  // Filter & Search Invoices Table list
  const filteredInvoices = invoices.map(inv => {
    // Dynamic Overdue calculation
    let isOverdue = false;
    let displayStatus = inv.status;
    if (inv.status !== "Paid" && inv.status !== "Cancelled" && inv.balanceAmount > 0) {
      // Check if due date is in the past
      if (new Date(inv.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
        isOverdue = true;
        displayStatus = "Overdue";
      }
    }
    return { ...inv, displayStatus, isOverdue };
  }).filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.quotationNumber && inv.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "All" ? true : inv.displayStatus === statusFilter || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculation parameters for widgets
  const netInvoicedVal = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0)
  const totalPaidLedgerVal = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0)
  const totalBalanceDueVal = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0)
  const totalOverdueVal = invoices.reduce((acc, inv) => {
    if (inv.status !== "Paid" && inv.status !== "Cancelled" && inv.balanceAmount > 0) {
      if (new Date(inv.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
        return acc + inv.balanceAmount;
      }
    }
    return acc;
  }, 0)

  // Loading Screen Shell
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <FileCheck className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Initializing Billing Engine...</p>
          <p className="text-xs text-muted-foreground">Mapping payments, ledger sheets and GST channels</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* Shared Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
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
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span>Invoice & Payment Workspace</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Create directly or generate from approved estimates, specify custom payment entries, monitor UTR/transaction statuses and print receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
              className="rounded-xl border-border bg-card/60 hover:bg-accent hover:text-accent-foreground h-10 w-10 transition-all duration-300"
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-800" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400" />
              )}
            </Button>

            {userPermissions.includes("Invoices.CRUD") && (
              <Button 
                onClick={handleOpenCreateForm}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-10 px-3 md:px-4 transition-all shadow-md shadow-primary/10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> <span className="hidden md:inline">Direct Invoice</span>
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          
          {/* Key Invoiced Ledger Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
            
            {/* Stat 1: Total Sales Invoiced */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Net Sales Invoiced</span>
                  <span className="text-2xl font-black text-foreground tracking-tight block">
                    ₹{netInvoicedVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2: Total Payments Received */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Payments Collected</span>
                  <span className="text-2xl font-black text-emerald-500 tracking-tight block">
                    ₹{totalPaidLedgerVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 3: Balance Outstanding Due */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Accounts Receivable</span>
                  <span className="text-2xl font-black text-amber-500 tracking-tight block">
                    ₹{totalBalanceDueVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 4: Overdue Collections */}
            <Card className={`bg-card transition-all duration-300 border ${totalOverdueVal > 0 ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]" : "border-border hover:border-primary/20"}`}>
              <CardContent className="p-6 flex items-center justify-between relative overflow-hidden">
                {totalOverdueVal > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full animate-pulse"></div>}
                <div className="space-y-1.5 relative z-10">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${totalOverdueVal > 0 ? "text-rose-500" : "text-muted-foreground"}`}>Overdue Collections</span>
                  <span className={`text-2xl font-black tracking-tight block ${totalOverdueVal > 0 ? "text-rose-500" : "text-foreground"}`}>
                    ₹{totalOverdueVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${totalOverdueVal > 0 ? "bg-rose-500/10 border border-rose-500/20 text-rose-500" : "bg-muted border border-border text-muted-foreground"}`}>
                  <Bell className={`w-6 h-6 ${totalOverdueVal > 0 ? "animate-pulse" : ""}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-5 rounded-2xl border border-border print:hidden">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search by Invoice Number, linked Quotation, or Client Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border rounded-xl h-11 w-full text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Status Filter:</span>
              <div className="flex flex-wrap bg-muted p-1 rounded-lg border border-border w-full md:w-auto">
                {["All", "Draft", "Pending", "Partial Paid", "Paid", "Overdue", "Cancelled"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      statusFilter === s 
                        ? "bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Invoices Table Grid */}
          <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl print:hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border h-14 text-xs">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="text-foreground font-semibold px-3 w-[110px]">Invoice No</TableHead>
                      <TableHead className="text-foreground font-semibold px-3">Customer / Client</TableHead>
                      <TableHead className="text-foreground font-semibold px-3">Due Date</TableHead>
                      <TableHead className="text-foreground font-semibold px-3 text-right">Invoiced</TableHead>
                      <TableHead className="text-foreground font-semibold px-3 text-right">Paid</TableHead>
                      <TableHead className="text-foreground font-semibold px-3 text-right">Balance</TableHead>
                      <TableHead className="text-foreground font-semibold px-3">Status</TableHead>
                      <TableHead className="text-foreground font-semibold text-center px-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => (
                        <TableRow 
                          key={inv.id} 
                          className={`border-b border-border/60 transition-colors h-16 group ${inv.isOverdue ? "bg-rose-500/5 hover:bg-rose-500/10" : "hover:bg-muted/30"}`}
                        >
                          <TableCell className="px-3 font-semibold text-foreground font-mono text-xs">
                            {inv.invoiceNumber}
                            {inv.quotationNumber && (
                              <span className="block text-[9px] text-primary font-bold font-mono">Qty: {inv.quotationNumber}</span>
                            )}
                          </TableCell>
                          
                          <TableCell className="px-3 font-semibold text-foreground text-xs leading-tight">
                            <div>
                              <span className="truncate block max-w-[150px]">{inv.customerName}</span>
                              <span className="block text-[9px] font-normal text-muted-foreground">{inv.customerGSTIN || "GSTIN Exempt"}</span>
                            </div>
                          </TableCell>

                          <TableCell className="px-3 text-foreground text-xs font-mono">
                            {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          </TableCell>

                          <TableCell className="px-3 font-bold font-mono text-foreground text-xs text-right">
                            {inv.currency === "INR" ? "₹" : "$"}
                            {inv.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                          </TableCell>

                          <TableCell className="px-3 font-bold font-mono text-emerald-500 text-xs text-right">
                            <div className="flex flex-col items-end">
                              <span>
                                {inv.currency === "INR" ? "₹" : "$"}
                                {inv.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                              </span>
                              {inv.paidAmount > 0 && (
                                <div 
                                  className="w-16 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden flex shadow-inner" 
                                  title={`${Math.round((inv.paidAmount / inv.grandTotal) * 100)}% Paid`}
                                >
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${inv.balanceAmount <= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                                    style={{ width: `${Math.min(100, Math.round((inv.paidAmount / inv.grandTotal) * 100))}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className={`px-3 font-bold font-mono text-xs text-right ${inv.isOverdue ? "text-rose-500" : (inv.balanceAmount > 0 ? "text-red-500" : "text-slate-400")}`}>
                            {inv.currency === "INR" ? "₹" : "$"}
                            {inv.balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                          </TableCell>

                          <TableCell className="px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadgeStyle(inv.displayStatus)}`}>
                              {inv.displayStatus === "Paid" && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                              )}
                              {inv.displayStatus === "Pending" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              )}
                              {inv.displayStatus === "Partial Paid" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              )}
                              {inv.displayStatus === "Overdue" && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                </span>
                              )}
                              {inv.displayStatus}
                            </span>
                            {inv.dispatchStatus && (
                              <span className={`block mt-1.5 w-max px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${getDispatchBadge(inv.dispatchStatus)}`}>
                                🚚 {inv.dispatchStatus}
                              </span>
                            )}
                          </TableCell>

                          {/* Action Grid */}
                          <TableCell className="px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Record Payment */}
                              {userPermissions.includes("Invoices.CRUD") && (
                                <Button 
                                  onClick={() => handleOpenPaymentRecord(inv)}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                  title="Record Payment / View History"
                                >
                                  <IndianRupee className="w-4 h-4" />
                                </Button>
                              )}

                              {/* Send Reminder for Overdue */}
                              {inv.isOverdue && (
                                <Button 
                                  onClick={() => handleSendReminder(inv)}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                                  title="Send Payment Reminder"
                                >
                                  <Bell className="w-4 h-4 animate-pulse" />
                                </Button>
                              )}
                              {/* Logistics / Dispatch Tracking */}
                              <Button 
                                onClick={() => handleOpenTracking(inv)}
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                                title="Update Delivery/Logistics Status"
                              >
                                <MapPin className="w-4 h-4" />
                              </Button>
                              {/* Edit invoice Form */}
                              {userPermissions.includes("Invoices.CRUD") && (
                                <Button 
                                  onClick={() => handleOpenEditForm(inv)}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                  title="Edit/Track Payments"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                </Button>
                              )}

                              {/* View invoice PDF template */}
                              <Button 
                                onClick={() => {
                                  setSelectedInvoice(inv)
                                  setIsChallanMode(false)
                                  setIsViewOpen(true)
                                }}
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="View PDF / Print Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {/* Print Delivery Challan */}
                              <Button 
                                onClick={() => {
                                  setSelectedInvoice(inv)
                                  setIsChallanMode(true)
                                  setIsViewOpen(true)
                                }}
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-600/10 rounded-lg transition-all"
                                title="Generate Delivery Challan"
                              >
                                <Truck className="w-4 h-4" />
                              </Button>

                              {/* Delete */}
                              {userPermissions.includes("Invoices.CRUD") && (
                                <Button 
                                  onClick={() => {
                                    setSelectedInvoice(inv)
                                    setIsDeleteOpen(true)
                                  }}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Delete Invoice Entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="h-[400px]">
                          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <FileCheck className="w-10 h-10 text-primary opacity-80" />
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-2">No Invoices Found</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              There are no invoices matching your current filters. Try tweaking your search or create a new one.
                            </p>
                            <Button onClick={handleOpenCreateForm} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Plus className="w-4 h-4 mr-2" />
                              Compose Direct Invoice
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

          {/* PRINT VIEW AREA: Beautiful GST-Compliant Print-Ready Layout */}
          {selectedInvoice && (
            <div className="hidden print:block bg-white text-black p-8 font-sans border-0 shadow-none text-xs w-full max-w-[800px] mx-auto">
              
              {/* Header Company detail */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-800">TAX INVOICE</h1>
                  <span className="block text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 w-max">ORIGINAL FOR RECIPIENT</span>
                  <div className="mt-4 space-y-1 text-slate-600">
                    <span className="block font-bold text-slate-800 text-sm">{OUR_COMPANY.name}</span>
                    <span className="block">{OUR_COMPANY.address}, {OUR_COMPANY.city}</span>
                    <span className="block">GSTIN: <span className="font-mono font-semibold">{OUR_COMPANY.gstin}</span></span>
                    <span className="block">State: {OUR_COMPANY.state} | Pincode: {OUR_COMPANY.pincode}</span>
                  </div>
                </div>

                <div className="text-right space-y-1 text-slate-600 text-xs">
                  <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-left min-w-[200px] space-y-1 mb-2">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Invoice Number</span>
                    <span className="block text-sm font-bold text-slate-800 font-mono">{selectedInvoice.invoiceNumber}</span>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase mt-1">Invoice Date</span>
                    <span className="block text-xs font-semibold text-slate-700">{selectedInvoice.invoiceDate}</span>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase mt-1">Payment Due Date</span>
                    <span className="block text-xs font-semibold text-red-600">{selectedInvoice.dueDate}</span>
                  </div>
                  <span className="block">Email: {OUR_COMPANY.email}</span>
                  <span className="block">Phone: {OUR_COMPANY.phone}</span>
                </div>
              </div>

              {/* Billed To / Shipping / Supply */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-6">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">BILLED TO (BUYER)</span>
                  <span className="block font-bold text-slate-800 text-sm">{selectedInvoice.customerName}</span>
                  <span className="block text-slate-600 leading-relaxed">{selectedInvoice.customerAddress}</span>
                  <span className="block text-slate-600">Contact: {selectedInvoice.contactPerson} ({selectedInvoice.customerPhone})</span>
                  <span className="block text-slate-600">Email: {selectedInvoice.customerEmail}</span>
                </div>

                <div className="space-y-1 text-right">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SHIPPING ADDRESS</span>
                  <span className="block text-slate-600 leading-relaxed">{selectedInvoice.shippingAddress || "Same as Billing Address"}</span>
                  <span className="block text-slate-700 font-bold mt-2">GSTIN: <span className="font-mono">{selectedInvoice.customerGSTIN || "Exempted"}</span></span>
                  <span className="block text-slate-600">Place of Supply: {selectedInvoice.customerState}</span>
                </div>
              </div>

              {/* Sales Person & Currency log */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 mb-6">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Sales Executive</span>
                  <span className="block font-bold text-slate-700 text-xs">{selectedInvoice.salesPerson}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Payment Terms</span>
                  <span className="block font-bold text-slate-700 text-xs">{selectedInvoice.paymentTerms}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Billing Currency</span>
                  <span className="block font-bold text-slate-700 text-xs">{selectedInvoice.currency}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Invoice Status</span>
                  <span className="block font-bold text-slate-700 text-xs uppercase">{selectedInvoice.status}</span>
                </div>
              </div>

              {/* Product Line items table */}
              <div className="overflow-x-auto"><table className="w-full border-collapse min-w-[600px] text-left mb-6">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50 h-10 text-slate-800 font-bold">
                    <th className="px-2 w-[4%]">#</th>
                    <th className="px-2 w-[36%]">Product Description</th>
                    <th className="px-2 w-[8%] text-center">Unit</th>
                    <th className="px-2 w-[14%] text-right">Rate</th>
                    <th className="px-2 w-[7%] text-center">Qty</th>
                    <th className="px-2 w-[7%] text-center">GST</th>
                    <th className="px-2 w-[10%] text-right">Discount</th>
                    <th className="px-2 w-[14%] text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 h-10 text-slate-700">
                      <td className="px-2 font-mono">{idx + 1}</td>
                      <td className="px-2">
                        <span className="block font-bold text-slate-800">{item.productName}</span>
                        <span className="block text-[9px] text-slate-500 italic">{item.description}</span>
                      </td>
                      <td className="px-2 text-center">{item.unit}</td>
                      <td className="px-2 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-2 text-center font-mono">{item.quantity}</td>
                      <td className="px-2 text-center font-mono">{item.gstPercent}%</td>
                      <td className="px-2 text-right font-mono text-xs text-red-600">
                        {item.discountType === "Percentage" ? `${item.discountValue}%` : `₹${item.discountValue}`}
                      </td>
                      <td className="px-2 text-right font-mono font-semibold">₹{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>

              {/* Subtotal summary section */}
              <div className="flex justify-between items-start mt-8">
                
                {/* Words Translation & QR Pay block */}
                <div className="max-w-[45%] space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Amount In Words</span>
                    <span className="block text-[11px] font-bold text-slate-800 leading-normal mt-1">{numberToWords(selectedInvoice.grandTotal)}</span>
                  </div>

                  {/* Payment tracking info */}
                  <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200/50 space-y-1">
                    <span className="block text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Payment Log Detail</span>
                    <span className="block text-[10px]">Payment Mode: <span className="font-semibold text-slate-800">{selectedInvoice.paymentMode}</span></span>
                    {selectedInvoice.transactionRef && (
                      <span className="block text-[10px]">UTR/Transaction Ref: <span className="font-mono font-semibold text-slate-800">{selectedInvoice.transactionRef}</span></span>
                    )}
                  </div>

                  {/* QR Code and digital payment visual */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="bg-white p-1 rounded border border-slate-300">
                      <QrCode className="w-14 h-14 text-slate-800" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 text-[10px]">BHIM UPI Scan & Pay</span>
                      <span className="block text-slate-500 text-[9px] mt-0.5 leading-relaxed">Scan using any UPI App (GPAY, PhonePe, Paytm) to clear accounts receivable balances instantly.</span>
                    </div>
                  </div>
                </div>

                {/* Summaries values */}
                <div className="min-w-[280px] space-y-2 text-slate-600 text-[11px] font-medium">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-slate-800">₹{selectedInvoice.subTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-red-600">
                    <span>Line Discounts sum:</span>
                    <span className="font-mono">- ₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>

                  {selectedInvoice.customerState === OUR_COMPANY.state ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (Intrastate - 9%):</span>
                        <span className="font-mono text-slate-800">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (Intrastate - 9%):</span>
                        <span className="font-mono text-slate-800">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST (Interstate - 18%):</span>
                      <span className="font-mono text-slate-800">₹{selectedInvoice.gstAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span className="font-mono text-slate-800">₹{selectedInvoice.shippingCharges.toFixed(2)}</span>
                  </div>

                  {selectedInvoice.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Round Off diff:</span>
                      <span className="font-mono">{selectedInvoice.roundOff > 0 ? `+ ₹${selectedInvoice.roundOff}` : `- ₹${Math.abs(selectedInvoice.roundOff)}`}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t-2 border-slate-300 pt-2 text-base font-black text-slate-800">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono text-sm">₹{selectedInvoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-200 pt-1">
                    <span>Amount Paid Recd:</span>
                    <span className="font-mono">₹{selectedInvoice.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-red-500 font-black border-t-2 border-dashed border-slate-200 pt-1.5">
                    <span>Remaining Balance Due:</span>
                    <span className="font-mono text-xs">₹{selectedInvoice.balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Notes terms */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                <div className="space-y-2 text-slate-500">
                  <span className="block font-bold text-slate-700">Notes / Remarks:</span>
                  <p className="leading-relaxed text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line">{selectedInvoice.notes}</p>
                  
                  <span className="block font-bold text-slate-700 mt-2">Terms & Conditions:</span>
                  <p className="leading-relaxed text-[10px] text-slate-600 whitespace-pre-line">{selectedInvoice.termsConditions}</p>
                </div>

                <div className="text-right flex flex-col justify-end items-end space-y-1">
                  <span className="block text-[10px] text-slate-400 italic">For {workspaceSettings?.companyName || OUR_COMPANY.name}</span>
                  {workspaceSettings?.authorizedSignature ? (
                    <div className="h-12 w-24 flex items-center justify-end">
                      <img src={workspaceSettings.authorizedSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-10 w-24 border-b border-slate-300"></div>
                  )}
                  <span className="block font-bold text-slate-700 mt-2">Authorized Signatory</span>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* DIALOG 1: SPATIOUS FULL-DETAILED COMPOSER FORM (Create & Edit) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-6xl rounded-2xl shadow-2xl overflow-hidden p-0 max-h-[94vh] flex flex-col">
          <form onSubmit={handleSaveInvoice} className="flex flex-col h-full overflow-hidden" noValidate>
            
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span>{isEditingExisting ? `Edit Invoice Details (${invoiceNumber})` : "Compose Dynamic Tax Invoice"}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Load approved estimates, configure tax fields, trace payments received, and generate cash ledger records.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex items-center gap-2 text-xs font-mono font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full shadow-inner">
                {invoiceNumber}
              </div>
            </div>

            {/* Scrollable multi-section form body */}
            <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1">
              
              {/* LINK Approved Quotation section */}
              {!isEditingExisting && quotations.filter(q => q.status === "Approved").length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-foreground">Import approved quotation estimative data?</span>
                      <span className="block text-[11px] text-muted-foreground">Select an approved quotation from the dropdown to automatically prefill all customer and product entries instantly.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={linkedQuotationNumber || "none"} onValueChange={(val) => handleQuotationLinkage(val === "none" ? "" : val)}>
                      <SelectTrigger className="px-3 bg-card border border-border focus:ring-1 focus:ring-primary rounded-xl h-9 text-xs font-bold text-foreground outline-none w-48 shadow-sm">
                        <SelectValue placeholder="-- Link Quotation --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Link Quotation --</SelectItem>
                        {quotations.filter(q => q.status === "Approved").map(q => (
                          <SelectItem key={q.id} value={q.quotationNumber}>{q.quotationNumber} - {q.customerName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* SECTION 1: INVOICE HEADER INFORMATION */}
              <div className="space-y-4 bg-muted/10 border border-border p-5 rounded-2xl relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Invoice Header Section</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Invoice Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="invNum" className="text-xs font-bold text-foreground/80">Invoice Number</Label>
                    <Input
                      id="invNum"
                      value={invoiceNumber}
                      readOnly
                      className="bg-muted text-muted-foreground font-mono font-bold text-xs rounded-xl h-10"
                    />
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="invDate" className="text-xs font-bold text-foreground/80">Invoice Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="invDate"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                        className="pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dueD" className="text-xs font-bold text-foreground/80">Payment Due Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="dueD"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                        className="pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="iCustomer" className="text-xs font-bold text-foreground/80">Select Customer *</Label>
                    <SearchableSelect
                      options={customers.map(c => ({ id: c.id, label: `${c.companyName} (${c.state})` }))}
                      value={invoiceCustomerId}
                      onChange={(val) => handleCustomerSelection(val)}
                      placeholder="-- Select Buyer --"
                      required
                    />
                  </div>

                  {/* Phone Auto Fill */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cPhone" className="text-xs font-bold text-foreground/80">Phone Number</Label>
                    <Input
                      id="cPhone"
                      placeholder="Auto Filled / Custom"
                      value={customers.find(c => c.id.toString() === invoiceCustomerId.toString())?.phone || ""}
                      readOnly
                      className="bg-muted text-muted-foreground rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* GST Number Auto Fill */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cGST" className="text-xs font-bold text-foreground/80">GST Number</Label>
                    <Input
                      id="cGST"
                      placeholder="GSTIN Auto Filled"
                      value={customers.find(c => c.id.toString() === invoiceCustomerId.toString())?.gstNumber || ""}
                      readOnly
                      className="bg-muted text-muted-foreground rounded-xl h-10 text-xs font-mono font-semibold"
                    />
                  </div>

                  {/* Payment terms */}
                  <div className="space-y-1.5">
                    <Label htmlFor="payT" className="text-xs font-bold text-foreground/80">Payment Terms</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger id="payT" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none">
                        <SelectValue placeholder="Select Payment Terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(term => (
                          <SelectItem key={term} value={term}>{term}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sales Person Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="salesP" className="text-xs font-bold text-foreground/80">Sales Person</Label>
                    <Select value={salesPerson} onValueChange={setSalesPerson}>
                      <SelectTrigger id="salesP" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none">
                        <SelectValue placeholder="Select Sales Person" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALES_PERSONS.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="currencyMode" className="text-xs font-bold text-foreground/80">Currency</Label>
                    <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
                      <SelectTrigger id="currencyMode" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-bold text-foreground outline-none">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Invoice Status (Auto-computed but displayable) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formStatus" className="text-xs font-bold text-foreground/80">Invoice Status (Calculated)</Label>
                    <Input
                      id="formStatus"
                      value={invoiceStatus}
                      readOnly
                      className="bg-muted text-muted-foreground font-bold text-xs rounded-xl h-10"
                    />
                  </div>

                  {/* Billing address */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <Label htmlFor="billAddr" className="text-xs font-bold text-foreground/80">Billing Address</Label>
                    <textarea
                      id="billAddr"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Select a registered customer or provide details..."
                      rows={2}
                      className="p-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl w-full text-xs font-medium outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Shipping Address (Optional) */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <Label htmlFor="shipAddr" className="text-xs font-bold text-foreground/80">Shipping Address (Optional)</Label>
                    <textarea
                      id="shipAddr"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Provide optional delivery or dispatch supply details..."
                      rows={2}
                      className="p-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl w-full text-xs font-medium outline-none resize-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT ITEMS DYNAMIC LEDGER SECTION */}
              <div className="space-y-4 bg-muted/10 border border-border p-5 rounded-2xl relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex justify-between items-center">
                  <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>2. Product Item Section (Dynamic Multi-Row)</span>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleAddNewItemRow}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs h-8 px-3 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Product Row
                  </Button>
                </div>

                {/* Line items dynamic grid */}
                <div className="border border-border rounded-xl overflow-x-auto bg-background">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-foreground text-xs font-bold px-4 w-[28%]">Product</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-center w-[10%]">Qty</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-center w-[10%]">Unit</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-right w-[12%]">Rate</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-center w-[10%]">GST %</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-center w-[16%]">Discount Type/Val</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-right w-[12%]">Line Total</TableHead>
                        <TableHead className="text-foreground text-xs font-bold text-right px-4 w-[2%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.length > 0 ? (
                        invoiceItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            
                            {/* Product dropdown selection */}
                            <td className="px-4 py-3.5 text-xs font-semibold">
                              <div className="space-y-1">
                                <SearchableSelect
                                  options={products.map(p => ({ id: p.id, label: p.productName }))}
                                  value={item.productId}
                                  onChange={(val) => handleRowItemChange(item.id, "productId", val)}
                                  placeholder="Select item"
                                  required
                                />
                                <Input
                                  value={item.description}
                                  onChange={(e) => handleRowItemChange(item.id, "description", e.target.value)}
                                  placeholder="Provide optional details..."
                                  className="bg-transparent border-0 border-b border-border hover:border-primary focus-visible:ring-0 rounded-none h-6 text-[10px] text-muted-foreground font-medium px-1"
                                />
                              </div>
                            </td>

                            {/* Qty Input */}
                            <td className="py-3.5">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleRowItemChange(item.id, "quantity", parseInt(e.target.value) || 1)}
                                className="bg-background border-border rounded-xl h-9 text-xs font-bold font-mono text-center w-20 mx-auto"
                              />
                            </td>

                            {/* Unit */}
                            <td className="py-3.5">
                              <Input
                                value={item.unit}
                                onChange={(e) => handleRowItemChange(item.id, "unit", e.target.value)}
                                className="bg-background border-border rounded-xl h-9 text-xs font-bold text-center w-20 mx-auto"
                              />
                            </td>

                            {/* Price/Rate */}
                            <td className="py-3.5">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold font-mono">
                                  {currency === "INR" ? "₹" : "$"}
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.unitPrice}
                                  onChange={(e) => handleRowItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                  className="pl-6 bg-background border-border rounded-xl h-9 text-xs font-bold font-mono text-right"
                                />
                              </div>
                            </td>

                            {/* GST Selection */}
                            <td className="py-3.5 px-2">
                              <Select value={item.gstPercent.toString()} onValueChange={(val) => handleRowItemChange(item.id, "gstPercent", parseInt(val) || 0)}>
                                <SelectTrigger className="mx-auto bg-background border border-border rounded-lg h-9 px-2 text-xs font-extrabold text-foreground outline-none text-center flex w-[72px]">
                                  <SelectValue placeholder="0%" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="12">12%</SelectItem>
                                  <SelectItem value="18">18%</SelectItem>
                                  <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>

                            {/* Discount Type & Value */}
                            <td className="py-3.5 px-2">
                              <div className="flex gap-1.5 items-center w-36 mx-auto">
                                <div className="w-[64px]">
                                  <Select value={item.discountType} onValueChange={(val) => handleRowItemChange(item.id, "discountType", val)}>
                                    <SelectTrigger className="bg-background border border-border rounded-lg h-9 px-2 text-[10px] font-bold text-foreground outline-none flex w-full [&>span]:truncate">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Percentage">%</SelectItem>
                                      <SelectItem value="Flat">Val</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.discountValue}
                                  onChange={(e) => handleRowItemChange(item.id, "discountValue", parseFloat(e.target.value) || 0)}
                                  className="bg-background border-border rounded-xl h-9 text-xs font-bold font-mono text-right flex-1 min-w-[50px] w-auto"
                                />
                              </div>
                            </td>

                            {/* Line Total */}
                            <td className="py-3.5 text-right font-mono font-black text-xs text-foreground px-2">
                              {currency === "INR" ? "₹" : "$"}
                              {item.lineTotal.toFixed(2)}
                            </td>

                            {/* Remove row */}
                            <td className="py-3.5 text-right px-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItemRow(item.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>

                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td colSpan={8} className="text-center py-10 text-xs text-muted-foreground font-semibold">
                            No product rows drafted yet. Add line items to compute dynamic calculations.
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* SECTION 3: SUMMARY DETAILS & PAYMENT INFORMATION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-border">
                
                {/* Notes & Terms Conditions block */}
                <div className="space-y-4 lg:col-span-1">
                  {/* Notes Remarks */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formNotes" className="text-xs font-bold text-foreground/80">Notes / Remarks</Label>
                    <textarea
                      id="formNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Provide optional invoice remarks..."
                      rows={2}
                      className="p-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl w-full text-xs font-medium outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formTerms" className="text-xs font-bold text-foreground/80">Terms & Conditions</Label>
                    <textarea
                      id="formTerms"
                      value={termsConditions}
                      onChange={(e) => setTermsConditions(e.target.value)}
                      placeholder="Specify company terms..."
                      rows={3}
                      className="p-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl w-full text-xs font-medium outline-none resize-none font-mono transition-all"
                    />
                  </div>
                </div>

                {/* SECTION 4: PAYMENT TRACKING SECTION */}
                <div className="space-y-3 bg-muted/20 border border-border p-5 rounded-2xl shadow-inner lg:col-span-1">
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>3. Payment Information Section</span>
                  </div>

                  {/* Paid Amount */}
                  <div className="space-y-1.5">
                    <Label htmlFor="paidAmtInput" className="text-xs font-bold text-foreground/80">Payment Received (Paid Amount) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-muted-foreground">
                        {currency === "INR" ? "₹" : "$"}
                      </span>
                      <Input
                        id="paidAmtInput"
                        type="number"
                        min={0}
                        max={activeSummary.grandTotal}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="pl-7 bg-background border-border rounded-xl h-10 text-xs font-bold font-mono text-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="payModeSelect" className="text-xs font-bold text-foreground/80">Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={(val: any) => setPaymentMode(val)}>
                      <SelectTrigger id="payModeSelect" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-semibold text-foreground outline-none">
                        <SelectValue placeholder="Select Payment Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None (Unpaid / Pending)</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI (GPay/PhonePe/UTR)</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS)</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transaction Ref */}
                  <div className="space-y-1.5">
                    <Label htmlFor="txnRefInput" className="text-xs font-bold text-foreground/80">Transaction Ref No (UTR / Cheque No)</Label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="txnRefInput"
                        placeholder="e.g. UTR1839201948"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono text-foreground font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Summary Section Calculation values */}
                <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3 font-semibold text-xs text-foreground shadow-sm lg:col-span-1">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest pb-1 border-b border-border">
                    4. Summary Calculations
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-foreground">
                      {currency === "INR" ? "₹" : "$"}
                      {activeSummary.subTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount Total */}
                  <div className="flex justify-between text-red-500">
                    <span>Discounts Total sum:</span>
                    <span className="font-mono">
                      - {currency === "INR" ? "₹" : "$"}
                      {activeSummary.discountAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* GST calculations */}
                  {activeSummary.isIGST ? (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Interstate IGST (18%):</span>
                      <span className="font-mono text-foreground">
                        {currency === "INR" ? "₹" : "$"}
                        {activeSummary.gstAmount.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>CGST (Intrastate - 9%):</span>
                        <span className="font-mono text-foreground">
                          {currency === "INR" ? "₹" : "$"}
                          {(activeSummary.gstAmount / 2).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>SGST (Intrastate - 9%):</span>
                        <span className="font-mono text-foreground">
                          {currency === "INR" ? "₹" : "$"}
                          {(activeSummary.gstAmount / 2).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Shipping Charges */}
                  <div className="flex justify-between text-muted-foreground items-center">
                    <span>Shipping Charges:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                        {currency === "INR" ? "₹" : "$"}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={shippingCharges}
                        onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                        className="pl-5 bg-background border-border rounded-xl h-8 text-xs font-bold font-mono text-right"
                      />
                    </div>
                  </div>

                  {/* Round Off */}
                  {activeSummary.roundOff !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Round Off diff:</span>
                      <span className="font-mono text-foreground">
                        {activeSummary.roundOff > 0 ? `+ ₹${activeSummary.roundOff}` : `- ₹${Math.abs(activeSummary.roundOff)}`}
                      </span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex justify-between text-base font-black text-primary border-t border-border pt-2">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono text-sm">
                      {currency === "INR" ? "₹" : "$"}
                      {activeSummary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Paid Amount */}
                  <div className="flex justify-between text-emerald-500 font-bold border-t border-border pt-1">
                    <span>Amount Received:</span>
                    <span className="font-mono">
                      {currency === "INR" ? "₹" : "$"}
                      {paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Balance Amount outstanding */}
                  <div className="flex justify-between text-red-500 font-black border-t-2 border-dashed border-border pt-1.5">
                    <span>Remaining Balance Due:</span>
                    <span className="font-mono">
                      {currency === "INR" ? "₹" : "$"}
                      {activeSummary.balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 bg-muted/10 border-t border-border shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-xl text-xs w-full sm:w-auto"
              >
                Close Editor
              </Button>
              
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs px-4 h-9 border-0 shadow-sm transition-all w-full sm:w-auto"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Save Invoice & Track
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: PREVIEW TAX INVOICE / PRINT VIEW */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
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
            /* Expand paddings slightly in print to match larger fonts */
            #print-only-layout .p-3 { padding: 1rem !important; }
            #print-only-layout .p-4 { padding: 1.25rem !important; }
            #print-only-layout .h-\\[90px\\] { height: 120px !important; }
          }
        `}</style>
        <DialogContent className="bg-card border-none text-foreground !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 w-full h-[100dvh] max-w-none max-h-none rounded-none shadow-none overflow-hidden p-0 flex flex-col print:block print:static print:transform-none print:overflow-visible print:max-h-none print:h-auto print:w-full print:border-none print:shadow-none print:bg-transparent print:p-0 print:m-0">
          <div className="px-6 py-5 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between print:hidden">
            <div>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <span>{isChallanMode ? "Delivery Challan Preview" : "GST Tax Invoice Preview"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Standard format for Indian businesses with dynamic CGST/SGST/IGST tax rates.
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrintInvoice}
                variant="outline"
                className="bg-card text-foreground font-semibold rounded-xl border border-border h-9 px-3 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print
              </Button>

              <Button
                onClick={handleDownloadPDF}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-9 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export as PDF
              </Button>

              <Button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#1ebd5b] text-white font-semibold rounded-xl border-0 h-9 px-3 text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp Share
              </Button>

              <Button
                onClick={handleEmailClient}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl border-0 h-9 px-3 text-xs"
              >
                <Mail className="w-3.5 h-3.5 mr-1" /> Send to Client
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsViewOpen(false)}
                className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Non-scrolling wrapper, making the invoice stretch top to bottom */}
          <div className="flex-1 min-h-0 overflow-hidden print:block print:overflow-visible print:h-auto bg-white">
            {selectedInvoice && (
              <div className="w-full h-full print-zoom-reset">
                <Card id="print-only-layout" className="mx-auto bg-white text-black p-0 font-sans w-full h-full border-0 shadow-none rounded-none print:border-none print:shadow-none relative overflow-hidden print:overflow-visible flex flex-col">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                  <span className="text-[120px] font-black uppercase tracking-tighter -rotate-45 text-black text-center leading-[0.8]">
                    {OUR_COMPANY.name}
                  </span>
                </div>

                <div className="relative z-10">
                  {/* Top Banner */}
                  <div className="bg-slate-900 text-white text-center py-2 print:bg-black print:text-white print:-webkit-print-color-adjust-exact print:color-adjust-exact">
                    <h1 className="text-xl font-black tracking-widest uppercase">{isChallanMode ? "DELIVERY CHALLAN" : "TAX INVOICE"}</h1>
                  </div>

                  {/* Company Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 p-4 print:border-black">
                    <div className="max-w-[60%]">
                      <h2 className="text-2xl font-black text-slate-900 print:text-black uppercase">{OUR_COMPANY.name}</h2>
                      <p className="text-xs text-slate-700 print:text-black mt-1 leading-relaxed">
                        {OUR_COMPANY.address}, {OUR_COMPANY.city}<br/>
                        State: {OUR_COMPANY.state} | Pincode: {OUR_COMPANY.pincode}<br/>
                        Phone: {OUR_COMPANY.phone} | Email: {OUR_COMPANY.email}
                      </p>
                      <p className="text-sm font-bold mt-2 text-slate-900 print:text-black">
                        GSTIN: <span className="font-mono">{OUR_COMPANY.gstin}</span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="text-xs text-slate-700 print:text-black space-y-1 text-right mb-2">
                        <span className="block text-[10px] font-bold text-slate-500 print:text-gray-600 uppercase">{isChallanMode ? "Challan No" : "Invoice No"}</span>
                        <span className="block text-lg font-black text-slate-900 print:text-black font-mono">{selectedInvoice.invoiceNumber}</span>
                        
                        <span className="block text-[10px] font-bold text-slate-500 print:text-gray-600 uppercase mt-2">{isChallanMode ? "Dispatch Date" : "Invoice Date"}</span>
                        <span className="block text-sm font-bold text-slate-900 print:text-black">{selectedInvoice.invoiceDate}</span>
                        
                        {!isChallanMode && (
                          <>
                            <span className="block text-[10px] font-bold text-slate-500 print:text-gray-600 uppercase mt-2">Due Date</span>
                            <span className="block text-sm font-bold text-slate-900 print:text-black">{selectedInvoice.dueDate}</span>
                          </>
                        )}
                      </div>
                      {!isChallanMode && (
                        <span className="inline-block text-[10px] font-bold border border-slate-400 px-2 py-0.5 rounded uppercase mt-2">
                          Original for Recipient
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Billed To / Shipped To */}
                  <div className="grid grid-cols-2 border-b-2 border-slate-900 print:border-black text-xs">
                    <div className="border-r-2 border-slate-900 print:border-black p-4 space-y-1">
                      <span className="block text-[10px] font-black text-slate-900 print:text-black uppercase underline mb-2">Billed To</span>
                      <span className="block font-black text-slate-900 print:text-black text-sm uppercase">{selectedInvoice.customerName}</span>
                      <span className="block text-slate-800 print:text-black whitespace-pre-line">{selectedInvoice.customerAddress}</span>
                      <span className="block text-slate-800 print:text-black">Contact: {selectedInvoice.contactPerson} ({selectedInvoice.customerPhone})</span>
                      <span className="block text-slate-800 print:text-black mt-2 font-bold">
                        GSTIN: <span className="font-mono">{selectedInvoice.customerGSTIN || "Unregistered"}</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="block text-[10px] font-black text-slate-900 print:text-black uppercase underline mb-2">Shipped To</span>
                      <span className="block text-slate-800 print:text-black whitespace-pre-line">{selectedInvoice.shippingAddress || "Same as Billing Address"}</span>
                      <span className="block text-slate-800 print:text-black mt-2">
                        Place of Supply: <span className="font-bold">{selectedInvoice.customerState}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tabular Data with strict borders - Scrolls internally on screen so header/footer stay locked! */}
                  <div className="flex-1 overflow-y-auto print:overflow-visible border-b-2 border-slate-900 print:border-black min-h-[150px]">
                    <table className="w-full text-xs text-slate-900 print:text-black border-collapse relative">
                      <thead className="sticky top-0 z-10 border-b-2 border-slate-900 print:border-black bg-slate-100 print:bg-gray-100 print:-webkit-print-color-adjust-exact print:color-adjust-exact">
                        <tr>
                          <th className="p-2 border-r border-slate-400 print:border-black w-[5%] text-center font-black">#</th>
                          <th className="p-2 border-r border-slate-400 print:border-black w-[35%] text-left font-black">Item Description</th>
                          <th className="p-2 border-r border-slate-400 print:border-black w-[8%] text-center font-black">HSN/SAC</th>
                          <th className="p-2 border-r border-slate-400 print:border-black w-[8%] text-center font-black">Qty</th>
                          <th className="p-2 border-r border-slate-400 print:border-black w-[8%] text-center font-black">Unit</th>
                          {!isChallanMode && <th className="p-2 border-r border-slate-400 print:border-black w-[12%] text-right font-black">Rate</th>}
                          {!isChallanMode && <th className="p-2 border-r border-slate-400 print:border-black w-[10%] text-center font-black">GST</th>}
                          {!isChallanMode && <th className="p-2 w-[14%] text-right font-black">Amount</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-300 print:border-gray-400 last:border-b-0 h-10">
                            <td className="p-2 border-r border-slate-400 print:border-black text-center align-top">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-400 print:border-black align-top">
                              <span className="block font-bold">{item.productName}</span>
                              <span className="block text-[9px] text-slate-600 print:text-gray-700 italic">{item.description}</span>
                            </td>
                            <td className="p-2 border-r border-slate-400 print:border-black text-center align-top font-mono">--</td>
                            <td className="p-2 border-r border-slate-400 print:border-black text-center align-top font-mono font-bold">{item.quantity}</td>
                            <td className="p-2 border-r border-slate-400 print:border-black text-center align-top">{item.unit}</td>
                            {!isChallanMode && (
                              <td className="p-2 border-r border-slate-400 print:border-black text-right align-top font-mono">
                                {item.unitPrice.toFixed(2)}
                              </td>
                            )}
                            {!isChallanMode && <td className="p-2 border-r border-slate-400 print:border-black text-center align-top">{item.gstPercent}%</td>}
                            {!isChallanMode && (
                              <td className="p-2 text-right align-top font-mono font-bold">
                                {item.lineTotal.toFixed(2)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & Summary */}
                  {!isChallanMode && (
                    <div className="grid grid-cols-[1fr_300px] border-b-2 border-slate-900 print:border-black text-xs">
                      {/* Left: Amount in words & Bank Details */}
                      <div className="border-r-2 border-slate-900 print:border-black p-4 flex flex-col justify-between">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 print:text-gray-600 uppercase">Amount Chargeable (in words)</span>
                          <span className="block text-sm font-black text-slate-900 print:text-black italic leading-normal mt-1 capitalize">
                            {selectedInvoice.currency} {numberToWords(selectedInvoice.grandTotal)} Only
                          </span>
                        </div>
                        
                        <div className="mt-6 border border-slate-300 print:border-gray-400 p-3 bg-slate-50 print:bg-transparent rounded">
                          <span className="block text-[10px] font-bold text-slate-900 print:text-black uppercase border-b border-slate-300 print:border-gray-400 pb-1 mb-2">Company Bank Details</span>
                          <table className="w-full text-[10px] text-slate-800 print:text-black">
                            <tbody>
                              <tr><td className="w-[100px] py-0.5">Bank Name</td><td className="font-bold">: HDFC BANK LTD</td></tr>
                              <tr><td className="py-0.5">A/c No.</td><td className="font-bold font-mono">: 50200012345678</td></tr>
                              <tr><td className="py-0.5">Branch & IFSC</td><td className="font-bold font-mono">: MUMBAI - HDFC0001234</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Totals */}
                      <div className="p-0 text-slate-900 print:text-black">
                        <table className="w-full h-full text-xs">
                          <tbody>
                            <tr>
                              <td className="p-2 text-right">Taxable Amount</td>
                              <td className="p-2 text-right font-mono w-[120px]">{selectedInvoice.subTotal.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-slate-200 print:border-gray-300">
                              <td className="p-2 text-right text-red-600 print:text-black">Discount</td>
                              <td className="p-2 text-right font-mono text-red-600 print:text-black">- {selectedInvoice.discountAmount.toFixed(2)}</td>
                            </tr>
                            {selectedInvoice.customerState === OUR_COMPANY.state ? (
                              <>
                                <tr className="border-t border-slate-200 print:border-gray-300">
                                  <td className="p-2 text-right">CGST</td>
                                  <td className="p-2 text-right font-mono">{(selectedInvoice.gstAmount / 2).toFixed(2)}</td>
                                </tr>
                                <tr className="border-t border-slate-200 print:border-gray-300">
                                  <td className="p-2 text-right">SGST</td>
                                  <td className="p-2 text-right font-mono">{(selectedInvoice.gstAmount / 2).toFixed(2)}</td>
                                </tr>
                              </>
                            ) : (
                              <tr className="border-t border-slate-200 print:border-gray-300">
                                <td className="p-2 text-right">IGST</td>
                                <td className="p-2 text-right font-mono">{selectedInvoice.gstAmount.toFixed(2)}</td>
                              </tr>
                            )}
                            <tr className="border-t border-slate-200 print:border-gray-300">
                              <td className="p-2 text-right">Shipping Charges</td>
                              <td className="p-2 text-right font-mono">{selectedInvoice.shippingCharges.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-slate-200 print:border-gray-300">
                              <td className="p-2 text-right">Round Off</td>
                              <td className="p-2 text-right font-mono">{selectedInvoice.roundOff.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t-2 border-slate-900 print:border-black bg-slate-100 print:bg-gray-100 print:-webkit-print-color-adjust-exact print:color-adjust-exact">
                              <td className="p-3 text-right font-black text-sm">Grand Total ({selectedInvoice.currency})</td>
                              <td className="p-3 text-right font-black font-mono text-sm">{selectedInvoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Declaration & Signature */}
                  <div className="grid grid-cols-[1fr_250px] text-xs">
                    <div className="p-4 border-r-2 border-slate-900 print:border-black">
                      <span className="block text-[10px] font-bold text-slate-900 print:text-black uppercase underline mb-1">Declaration:</span>
                      <p className="text-[9px] text-slate-700 print:text-black leading-relaxed">
                        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.<br/>
                        {selectedInvoice.termsConditions}
                      </p>
                      {selectedInvoice.notes && (
                        <div className="mt-2 text-[9px] text-slate-700 print:text-black">
                          <span className="font-bold">Remarks: </span> {selectedInvoice.notes}
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col justify-end items-center text-center h-[90px]">
                      <span className="block text-[10px] font-bold text-slate-900 print:text-black">For {OUR_COMPANY.name}</span>
                      <div className="flex-1 flex items-center justify-center w-full my-2">
                        {workspaceSettings?.authorizedSignature ? (
                          <img src={workspaceSettings.authorizedSignature} alt="Signature" className="max-h-12 object-contain" />
                        ) : (
                          <div className="h-full w-full border-b border-slate-400 print:border-black opacity-50"></div>
                        )}
                      </div>
                      <span className="block text-[10px] font-bold text-slate-900 print:text-black uppercase">Authorized Signatory</span>
                    </div>
                  </div>

                </div>
              </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6 animate-bounce" />
            </div>
            <DialogTitle className="text-lg font-bold text-center text-foreground">Delete Invoice Record?</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete tax invoice <span className="text-foreground font-bold">{selectedInvoice?.invoiceNumber}</span>? This action will reverse cash registry entries.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-border mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsDeleteOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={() => {
                if (!selectedInvoice) return
                
                // Inventory Restoration Logic
                let updatedProducts = [...products];
                selectedInvoice.items.forEach(oldItem => {
                  const productIdx = updatedProducts.findIndex(p => p.id.toString() === oldItem.productId.toString());
                  if (productIdx !== -1) {
                    updatedProducts[productIdx] = { ...updatedProducts[productIdx], stockQuantity: updatedProducts[productIdx].stockQuantity + oldItem.quantity };
                  }
                });
                setProducts(updatedProducts);
                localStorage.setItem("invoice_management_products", JSON.stringify(updatedProducts));

                const updated = invoices.filter(i => i.id !== selectedInvoice.id)
                saveInvoices(updated)
                setIsDeleteOpen(false)
                toast.success(`${selectedInvoice.invoiceNumber} deleted successfully!`)
                setSelectedInvoice(null)
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 border-0 shadow-sm w-full sm:w-auto"
            >
              Yes, Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* 4. LOGISTICS / TRACKING MODAL */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {isTrackingOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm print:hidden">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Dispatch Tracking
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">Invoice: {selectedInvoice.invoiceNumber}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsTrackingOpen(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSaveTracking} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Dispatch Status</Label>
                <Select value={trackingStatus} onValueChange={(val: any) => setTrackingStatus(val)}>
                  <SelectTrigger className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:bg-background text-sm font-bold transition-colors [&>span]:truncate flex">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">🕒 Pending Setup</SelectItem>
                    <SelectItem value="Packed">📦 Packed / Ready</SelectItem>
                    <SelectItem value="Dispatched">🚚 Dispatched</SelectItem>
                    <SelectItem value="In Transit">🗺️ In Transit</SelectItem>
                    <SelectItem value="Delivered">✅ Delivered</SelectItem>
                    <SelectItem value="Returned">↩️ Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Courier / Transport Name</Label>
                <Input 
                  placeholder="e.g. DTDC, BlueDart, Own Vehicle" 
                  value={courierPartner} 
                  onChange={(e) => setCourierPartner(e.target.value)} 
                  className="h-11 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Tracking Number (LR/AWB)</Label>
                <Input 
                  placeholder="e.g. AWB123456789" 
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)} 
                  className="h-11 rounded-xl text-sm font-bold font-mono tracking-widest uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Dispatch Date</Label>
                <Input 
                  type="date"
                  value={dispatchDate} 
                  onChange={(e) => setDispatchDate(e.target.value)} 
                  className="h-11 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border mt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Save Tracking Details
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleWhatsAppTracking(selectedInvoice as Invoice)}
                  className="w-full h-12 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Notify Customer on WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* 5. PAYMENT RECORD MODAL */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {isPaymentRecordOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm print:hidden">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-emerald-500/10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                  <IndianRupee className="w-5 h-5" /> Payment & Receipts
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">Invoice: {selectedInvoice.invoiceNumber} • Balance Due: ₹{selectedInvoice.balanceAmount.toLocaleString("en-IN")}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPaymentRecordOpen(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Form Side */}
              <div className="space-y-5">
                <h3 className="font-bold border-b border-border pb-2 text-sm uppercase tracking-wider text-muted-foreground">Record New Payment</h3>
                <form id="payment-form" onSubmit={handleSavePaymentRecord} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Amount Received (₹)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      max={selectedInvoice.balanceAmount}
                      value={payAmountInput} 
                      onChange={(e) => setPayAmountInput(e.target.value)} 
                      className="h-11 rounded-xl text-lg font-bold font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Mode</Label>
                      <Select value={payModeInput} onValueChange={(val: any) => setPayModeInput(val)}>
                        <SelectTrigger className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm font-bold transition-colors [&>span]:truncate flex">
                          <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Bank Transfer">NEFT/IMPS</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Date</Label>
                      <Input 
                        type="date"
                        required
                        value={payDateInput} 
                        onChange={(e) => setPayDateInput(e.target.value)} 
                        className="h-11 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Reference No. (Optional)</Label>
                    <Input 
                      placeholder="Transaction ID / Cheque No." 
                      value={payRefInput} 
                      onChange={(e) => setPayRefInput(e.target.value)} 
                      className="h-10 rounded-xl text-xs font-mono tracking-wider"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Notes (Optional)</Label>
                    <Input 
                      placeholder="Any additional remarks..." 
                      value={payNotesInput} 
                      onChange={(e) => setPayNotesInput(e.target.value)} 
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>
                </form>
              </div>

              {/* History Side */}
              <div className="space-y-5 flex flex-col h-full border-l border-border pl-0 md:pl-8">
                <h3 className="font-bold border-b border-border pb-2 text-sm uppercase tracking-wider text-muted-foreground">Payment History</h3>
                <div className="flex-1 overflow-y-auto space-y-3 min-h-[250px]">
                  {(!selectedInvoice.paymentHistory || selectedInvoice.paymentHistory.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50 p-6">
                      <IndianRupee className="w-8 h-8 text-muted-foreground" />
                      <p className="text-xs font-semibold">No payments recorded yet.</p>
                    </div>
                  ) : (
                    selectedInvoice.paymentHistory.map((pmt, idx) => (
                      <div key={pmt.id} className="p-3 bg-muted/40 rounded-xl border border-border space-y-2 relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm text-foreground">₹{pmt.amount.toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{new Date(pmt.date).toLocaleDateString("en-IN")} • {pmt.mode}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-indigo-500 hover:bg-indigo-500/10 rounded"
                            onClick={() => handlePrintReceipt(pmt, selectedInvoice)}
                            title="Print Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        {pmt.referenceId && <p className="text-[9px] bg-background border border-border px-1.5 py-0.5 rounded w-max font-mono">Ref: {pmt.referenceId}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
              <Button 
                type="submit" 
                form="payment-form"
                disabled={selectedInvoice.balanceAmount <= 0}
                className="w-full md:w-auto h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-emerald-500/20"
              >
                {selectedInvoice.balanceAmount <= 0 ? "Fully Paid" : "Save Payment & Update Balance"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}









