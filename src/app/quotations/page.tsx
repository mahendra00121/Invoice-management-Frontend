"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Search, 
  Trash2, 
  Menu,
  Sun,
  Moon,
  Package,
  IndianRupee,
  FileText,
  Calendar,
  Eye,
  CheckCircle,
  Printer,
  RefreshCw,
  Coins,
  ShieldCheck,
  FileImage,
  UploadCloud,
  Layers,
  Sparkles,
  ArrowLeftRight,
  Copy,
  Mail,
  Send,
  X,
  Kanban,
  List,
  ChevronDown,
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
import { api } from "@/lib/api"

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
  unitPrice: number;
  gstPercent: number;
  stockQuantity: number;
  unit: string;
  description: string;
  createdAt: string;
}

interface QuotationItem {
  id: number | string;
  productId: number | string;
  productName: string;
  description: string; // Optional custom description per row
  quantity: number;
  unit: string;
  unitPrice: number;
  gstPercent: number;
  discountType: "Percentage" | "Flat";
  discountValue: number;
  lineTotal: number;
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
  status: "Draft" | "Sent" | "Approved" | "Rejected" | "Invoiced" | "Expired";
  notes: string;
  termsConditions: string;
  createdBy: string;
  createdAt: string;
  items: QuotationItem[];
  attachedFiles?: string[];
}

// Default Constants
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

// Seed Customers if empty
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

// Seed Products if empty
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

// High Fidelity Seed Invoices / Quotations matching structural schema
const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 1,
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
    currency: "INR",
    quotationDate: "2026-05-22",
    expiryDate: "2026-06-22",
    subTotal: 104498.10,
    discountAmount: 5499.90,
    gstAmount: 18809.66,
    shippingCharges: 150,
    roundOff: 0.14,
    grandTotal: 117958.00,
    status: "Approved",
    notes: "Delivery within 7 working days.",
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
    ],
    attachedFiles: ["corporate_brochure.pdf"]
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

export default function QuotationsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  
  // Data lists loaded from local storage
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
    return SEED_QUOTATIONS
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [quoRes, custRes, prodRes, settingsRes] = await Promise.all([
          api.quotations.getAll(),
          api.customers.getAll(),
          api.products.getAll(),
          api.settings.get()
        ])
        let loadedQuotations = Array.isArray(quoRes) ? quoRes : [];
        const today = new Date().toISOString().split("T")[0];
        
        let hasChanges = false;
        loadedQuotations = loadedQuotations.map(q => {
          if (q.status !== "Invoiced" && q.status !== "Approved" && q.expiryDate && q.expiryDate < today) {
            hasChanges = true;
            return { ...q, status: "Expired" };
          }
          return q;
        });

        if (hasChanges) {
          localStorage.setItem("invoice_management_quotations", JSON.stringify(loadedQuotations));
        }

        setQuotations(loadedQuotations)
        setCustomers(Array.isArray(custRes) ? custRes : [])
        setProducts(Array.isArray(prodRes) ? prodRes : [])
        if (settingsRes) setWorkspaceSettings(settingsRes)
      } catch (e) {
        console.error("Failed to load initial data", e)
      }
    }
    loadData()

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
    const handle = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  // Drag and Drop handlers for Kanban Board
  const handleDragStart = (e: React.DragEvent, quoteId: number | string) => {
    e.dataTransfer.setData("quoteId", quoteId.toString());
  };

  const handleDrop = (e: React.DragEvent, newStatus: Quotation["status"]) => {
    e.preventDefault();
    const draggedQuoteId = e.dataTransfer.getData("quoteId");
    if (!draggedQuoteId) return;

    const updatedList = quotations.map(q => {
      if (q.id.toString() === draggedQuoteId && q.status !== newStatus) {
        toast.success(`Quotation ${q.quotationNumber} moved to ${newStatus}`);
        return { ...q, status: newStatus };
      }
      return q;
    });
    saveQuotations(updatedList);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
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
  const saveQuotations = (newQuotations: Quotation[]) => {
    setQuotations(newQuotations)
    localStorage.setItem("invoice_management_quotations", JSON.stringify(newQuotations))
  }

  const handleDuplicateQuotation = (q: Quotation) => {
    const newQuoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`
    const newQuote: Quotation = {
      ...q,
      id: Math.floor(Math.random() * 10000000),
      quotationNumber: newQuoteNumber,
      status: "Draft",
      createdAt: new Date().toISOString()
    }
    const updated = [newQuote, ...quotations]
    saveQuotations(updated)
    toast.success("Quotation duplicated successfully!", {
      description: `New draft ${newQuoteNumber} created.`
    })
  }

  const handleSendEmail = () => {
    setIsSendingEmail(true)
    setTimeout(() => {
      setIsSendingEmail(false)
      setIsEmailOpen(false)
      
      if (selectedQuotation) {
        if (selectedQuotation.status === "Draft") {
          const updated = quotations.map(q => q.id == selectedQuotation.id ? { ...q, status: "Sent" as Quotation["status"] } : q)
          saveQuotations(updated)
        }
      }
      
      toast.success("Quotation emailed successfully!", {
        description: `Sent to ${selectedQuotation?.customerEmail || 'customer'}.`
      })
    }, 1500)
  }

  // Dialog management states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isInvoiceConvertOpen, setIsInvoiceConvertOpen] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [convertedInvoiceNum, setConvertedInvoiceNum] = useState("")

  // Dynamic Multi-Field Quotation Create Form State variables
  const [quoteId, setQuoteId] = useState<number | string>("")
  const [quoteNumber, setQuoteNumber] = useState("")
  const [workspaceSettings, setWorkspaceSettings] = useState<any>(null)
  const [quoteCustomerId, setQuoteCustomerId] = useState<number | string>("")
  const [quoteDate, setQuoteDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [billingAddress, setBillingAddress] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [salesPerson, setSalesPerson] = useState(SALES_PERSONS[0])
  const [currency, setCurrency] = useState<"INR" | "USD">("INR")
  const [status, setStatus] = useState<Quotation["status"]>("Draft")
  
  // Array of active Quotation Items (Dynamic multiple row list)
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([])
  
  // Notes & terms
  const [notes, setNotes] = useState("Delivery within 7 working days.")
  const [termsConditions, setTermsConditions] = useState("1. Payment within 15 days.\n2. Goods once sold will not be returned.")
  
  // Shipping charge
  const [shippingCharges, setShippingCharges] = useState<number>(0)
  
  // File attachments state (mock visuals)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [mockFileNameInput, setMockFileNameInput] = useState("")

  // Form editing indicator
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  // Listen for Chatbot Events
  useEffect(() => {
    const handleBotCreate = () => {
      // Reset form fields
      setQuoteNumber(`QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`)
      setQuoteCustomerId("")
      setQuoteDate(new Date().toISOString().split("T")[0])
      
      const due = new Date()
      due.setDate(due.getDate() + 30)
      setExpiryDate(due.toISOString().split("T")[0])
      
      setBillingAddress("")
      setShippingAddress("")
      setCurrency("INR")
      setStatus("Draft")
      setQuoteItems([])
      setShippingCharges(0)
      setNotes("Delivery within 7 working days.")
      setIsEditingExisting(false)
      setQuoteId("")

      // Open Modal
      setIsCreateOpen(true)
    };

    window.addEventListener('BOT_ACTION_CREATE_QUOTATION', handleBotCreate);
    return () => window.removeEventListener('BOT_ACTION_CREATE_QUOTATION', handleBotCreate);
  }, []);

  // ----------------------------------------------------
  // Dynamic Real-time Calculations Engine (Formula-aligned)
  // ----------------------------------------------------
  const calculateFormTotals = (
    itemsList: QuotationItem[], 
    shipCharges: number, 
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

    return {
      subTotal: parseFloat(subtotalSum.toFixed(2)),
      discountAmount: parseFloat(discountSum.toFixed(2)),
      gstAmount: parseFloat(gstSum.toFixed(2)),
      shippingCharges: shipCharges,
      roundOff: parseFloat(roundOffDiff.toFixed(2)),
      grandTotal: roundedGrandTotal,
      isIGST
    }
  }

  // Active form summary trigger
  const activeSummary = calculateFormTotals(quoteItems, shippingCharges, quoteCustomerId)

  // Auto-Fill Form values when selecting a customer
  const handleCustomerSelection = (custId: number | string) => {
    setQuoteCustomerId(custId)
    const customer = customers.find(c => c.id.toString() === custId.toString())
    if (customer) {
      setBillingAddress(customer.address + ", " + customer.city + ", " + customer.state + " - " + customer.pincode)
      setShippingAddress(customer.address + ", " + customer.city + ", " + customer.state + " - " + customer.pincode)
      toast.success(`Client data loaded for ${customer.companyName}`)
    } else {
      setBillingAddress("")
      setShippingAddress("")
    }
  }

  // ----------------------------------------------------
  // Product Row Adding & Realtime Inline calculations
  // ----------------------------------------------------
  const handleAddNewItemRow = () => {
    const defaultProduct = products[0]
    if (!defaultProduct) {
      toast.error("Please register at least one product in your inventory catalogue.")
      return
    }

    const newRowItem: QuotationItem = {
      id: Math.floor(Math.random() * 10000000),
      productId: defaultProduct.id,
      productName: defaultProduct.productName,
      description: defaultProduct.description || "Standard catalog profiling",
      quantity: 1,
      unit: defaultProduct.unit || "Pcs",
      unitPrice: defaultProduct.unitPrice,
      gstPercent: defaultProduct.gstPercent,
      discountType: "Percentage",
      discountValue: 0,
      lineTotal: defaultProduct.unitPrice + (defaultProduct.unitPrice * (defaultProduct.gstPercent / 100))
    }

    setQuoteItems([...quoteItems, newRowItem])
  }

  // Handle inline row item changes & recalculates line totals immediately
  const handleRowItemChange = (itemId: number | string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = quoteItems.map(item => {
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
            updated.description = productSelected.description || "Standard item logs"
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

    setQuoteItems(updatedItems)
  }

  const handleRemoveItemRow = (itemId: number | string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== itemId))
  }

  // ----------------------------------------------------
  // Mock Attachment File upload logic
  // ----------------------------------------------------
  const handleMockFileUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mockFileNameInput.trim()) {
      toast.error("Please select or enter a valid file label.")
      return
    }
    setAttachedFiles([...attachedFiles, mockFileNameInput.trim()])
    setMockFileNameInput("")
    toast.success("Document attached to proposal successfully!")
  }

  const handleRemoveAttachment = (idx: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))
  }

  const handlePrintQuotation = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    if (!selectedQuotation) return;
    
    let phone = selectedQuotation.customerPhone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = `91${phone}`;
    }
    
    const amountStr = `${selectedQuotation.currency === "INR" ? "₹" : "$"}${selectedQuotation.grandTotal.toLocaleString("en-IN")}`;
    
    const message = `Namaste ${selectedQuotation.contactPerson || selectedQuotation.customerName},%0A%0AAapka Tax Estimate / Quotation *${selectedQuotation.quotationNumber}* taiyaar hai.%0A*Total Amount:* ${amountStr}%0A*Expiry Date:* ${selectedQuotation.expiryDate}%0A%0AKripya is message ke sath bheji gayi PDF file check karein.%0A%0ADhanyawaad,%0A*${OUR_COMPANY.name}*`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // ----------------------------------------------------
  // Open Form to Create a Brand New Quotation
  // ----------------------------------------------------
  const handleOpenCreateForm = () => {
    setIsEditingExisting(false)
    setQuoteId(Math.floor(Math.random() * 10000000))
    // Format Auto generated quotation code: QT-2026-0002
    setQuoteNumber(`QT-2026-${String(quotations.length + 1).padStart(4, "0")}`)
    setQuoteCustomerId("")
    setQuoteDate(new Date().toISOString().split("T")[0])
    
    // Set default expiry date to 30 days ahead
    const exp = new Date()
    exp.setDate(exp.getDate() + 30)
    setExpiryDate(exp.toISOString().split("T")[0])
    
    setBillingAddress("")
    setShippingAddress("")
    setSalesPerson(SALES_PERSONS[0])
    setCurrency("INR")
    setStatus("Draft")
    setQuoteItems([])
    setShippingCharges(0)
    setAttachedFiles([])
    setNotes("Delivery within 7 working days.")
    setTermsConditions("1. Payment within 15 days.\n2. Goods once sold will not be returned.")
    
    setIsCreateOpen(true)
  }

  // ----------------------------------------------------
  // Open Form to Edit an Existing Quotation
  // ----------------------------------------------------
  const handleOpenEditForm = (q: Quotation) => {
    setIsEditingExisting(true)
    setQuoteId(q.id)
    setQuoteNumber(q.quotationNumber)
    setQuoteCustomerId(q.customerId)
    setQuoteDate(q.quotationDate)
    setExpiryDate(q.expiryDate)
    setBillingAddress(q.customerAddress)
    setShippingAddress(q.shippingAddress)
    setSalesPerson(q.salesPerson)
    setCurrency(q.currency)
    setStatus(q.status)
    setQuoteItems(q.items)
    setShippingCharges(q.shippingCharges)
    setAttachedFiles(q.attachedFiles || [])
    setNotes(q.notes)
    setTermsConditions(q.termsConditions)
    
    setIsCreateOpen(true)
  }

  // Save Quotation Form (Submit Handler)
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quoteCustomerId) {
      toast.error("Validation Error: Please select a registered customer.")
      return
    }

    if (quoteItems.length === 0) {
      toast.error("Validation Error: Add at least one product row to calculate values.")
      return
    }

    const customerObj = customers.find(c => c.id.toString() === quoteCustomerId.toString())
    if (!customerObj) return

    const summaryTotals = calculateFormTotals(quoteItems, shippingCharges, quoteCustomerId)

    const quotationObj = {
      quotationNumber: quoteNumber,
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
      currency: currency,
      quotationDate: quoteDate,
      expiryDate: expiryDate,
      subTotal: summaryTotals.subTotal,
      discountAmount: summaryTotals.discountAmount,
      gstAmount: summaryTotals.gstAmount,
      shippingCharges: shippingCharges,
      roundOff: summaryTotals.roundOff,
      grandTotal: summaryTotals.grandTotal,
      status: status,
      notes: notes,
      termsConditions: termsConditions,
      items: quoteItems,
      attachedFiles: attachedFiles
    }

    try {
      if (isEditingExisting) {
        await api.quotations.update(quoteId, quotationObj)
        toast.success(`Quotation ${quoteNumber} updated successfully!`)
      } else {
        await api.quotations.create(quotationObj)
        toast.success(`New Tax Quotation ${quoteNumber} generated!`)
      }
      
      const quoRes = await api.quotations.getAll()
      setQuotations(Array.isArray(quoRes) ? quoRes : [])
      setIsCreateOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save quotation")
    }
  }

  // Convert Quotation to Invoice Action
  const handleConvertQuotationToInvoice = (q: Quotation) => {
    setSelectedQuotation(q)
    setConvertedInvoiceNum(`INV-2026-${String(Math.floor(100 + Math.random() * 900))}`)
    setIsInvoiceConvertOpen(true)
  }

  const handleApproveQuotation = (q: Quotation) => {
    const updated = quotations.map(item => {
      if (item.id == q.id) {
        return { ...item, status: "Approved" as const }
      }
      return item
    })
    saveQuotations(updated)
    toast.success(`Quotation ${q.quotationNumber} has been marked as Approved!`)
  }

  const handleConfirmConvert = () => {
    if (!selectedQuotation) return
    
    // Update status in quotation registry to Approved
    const updated = quotations.map(item => {
      if (item.id == selectedQuotation.id) {
        return { ...item, status: "Invoiced" as const }
      }
      return item
    })
    saveQuotations(updated)

    // Generate Invoice Data mapping
    const newInvoiceId = Math.floor(Math.random() * 10000000)
    const invoiceData = {
      id: newInvoiceId,
      invoiceNumber: convertedInvoiceNum,
      quotationNumber: selectedQuotation.quotationNumber,
      customerId: selectedQuotation.customerId,
      customerName: selectedQuotation.customerName,
      customerGSTIN: selectedQuotation.customerGSTIN,
      customerState: selectedQuotation.customerState,
      customerEmail: selectedQuotation.customerEmail,
      customerAddress: selectedQuotation.customerAddress,
      customerCity: selectedQuotation.customerCity,
      customerPhone: selectedQuotation.customerPhone,
      contactPerson: selectedQuotation.contactPerson,
      shippingAddress: selectedQuotation.shippingAddress,
      salesPerson: selectedQuotation.salesPerson,
      paymentTerms: "Net 15 Days",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currency: selectedQuotation.currency,
      subTotal: selectedQuotation.subTotal,
      discountAmount: selectedQuotation.discountAmount,
      gstAmount: selectedQuotation.gstAmount,
      shippingCharges: selectedQuotation.shippingCharges,
      roundOff: selectedQuotation.roundOff,
      grandTotal: selectedQuotation.grandTotal,
      paidAmount: 0.0,
      balanceAmount: selectedQuotation.grandTotal,
      paymentMode: "None",
      transactionRef: "",
      status: "Pending",
      notes: selectedQuotation.notes,
      termsConditions: selectedQuotation.termsConditions,
      createdBy: selectedQuotation.createdBy,
      createdAt: new Date().toISOString(),
      items: selectedQuotation.items.map(item => ({
        ...item,
        id: Math.floor(Math.random() * 10000000),
        invoiceId: newInvoiceId,
        quotationItemId: item.id
      }))
    }

    // Append to Invoices LocalStorage (SyncEngine will auto-push to C# API)
    try {
      const existingInvoicesStr = localStorage.getItem("invoice_management_invoices")
      const existingInvoices = existingInvoicesStr ? JSON.parse(existingInvoicesStr) : []
      
      // Prevent double click feedback loops
      if (existingInvoices.some((inv: any) => inv.quotationNumber === selectedQuotation.quotationNumber)) {
        setIsInvoiceConvertOpen(false)
        return
      }

      const updatedInvoices = [invoiceData, ...existingInvoices]
      localStorage.setItem("invoice_management_invoices", JSON.stringify(updatedInvoices))

      // Inventory/Stock Deduction Logic
      const productsStr = localStorage.getItem("invoice_management_products");
      if (productsStr) {
        let currentProducts = JSON.parse(productsStr);
        invoiceData.items.forEach((newItem: any) => {
          const productIdx = currentProducts.findIndex((p: any) => p.id.toString() === newItem.productId.toString());
          if (productIdx !== -1) {
            currentProducts[productIdx] = { 
              ...currentProducts[productIdx], 
              stockQuantity: Math.max(0, currentProducts[productIdx].stockQuantity - (newItem.quantity || 1)) 
            };
          }
        });
        localStorage.setItem("invoice_management_products", JSON.stringify(currentProducts));
        // Note: products state in quotations page is not actively used for rendering, so just updating localStorage is enough.
      }

    } catch (e) {
      console.error("Failed to generate invoice", e)
    }

    setIsInvoiceConvertOpen(false)
    toast.success(`Quotation converted to Tax Invoice ${convertedInvoiceNum} successfully! Redirecting...`)
    
    // Redirect to invoices view
    setTimeout(() => {
      router.push("/invoices")
    }, 1500)
  }

  // Status Badge highlights helper
  const getStatusClass = (statusVal: string) => {
    switch (statusVal) {
      case "Approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Draft": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Invoiced": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Expired": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  }

  // Filter & Search Quotation Table list
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.salesPerson.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" ? true : q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Top widgets stats
  const totalProposalValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0)
  const approvedProposalCount = quotations.filter(q => q.status === "Approved").length
  const totalPendingProposals = quotations.filter(q => q.status === "Draft" || q.status === "Sent").length

  // Loading Screen Shell
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <FileText className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Initializing billing workspace...</p>
          <p className="text-xs text-muted-foreground">Compiling standard invoice ledger engines</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Navigation */}
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
                <span>GST Quotation Ledger</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Tax-Compliant header section logging, dynamic multiple products line-item billing, auto currency conversions and instant invoice conversion.
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

            {userPermissions.includes("Quotations.CRUD") && (
              <Button 
                onClick={handleOpenCreateForm}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-10 px-3 md:px-4 transition-all shadow-md shadow-primary/10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> <span className="hidden md:inline">Draft Quotation</span>
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          
          {/* Dashboard Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
            
            {/* Stat 1: Total Quotation Value */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Quotation Value</span>
                  <span className="text-2xl font-black text-foreground tracking-tight block">
                    ₹{totalProposalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2: Conversion Ledger */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Approved Proposals</span>
                  <span className="text-2xl font-black text-emerald-500 tracking-tight block">
                    {approvedProposalCount} Approved
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 3: Total Pending issued */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Pending / Sent Estimates</span>
                  <span className="text-2xl font-black text-amber-500 tracking-tight block">
                    {totalPendingProposals} Pending
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Coins className="w-6 h-6" />
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
                placeholder="Search by Quotation Number, Client or Sales Employee..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border rounded-xl h-11 w-full text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Status Filter:</span>
              <div className="flex flex-wrap bg-muted p-1 rounded-lg border border-border w-full md:w-auto">
                {["All", "Draft", "Sent", "Approved", "Rejected"].map(s => (
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
              
              <div className="flex items-center bg-muted p-1 rounded-lg border border-border ml-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("table")}
                  className={`h-7 px-3 rounded-md text-xs font-semibold ${viewMode === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-3.5 h-3.5 mr-1.5" /> Table
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("kanban")}
                  className={`h-7 px-3 rounded-md text-xs font-semibold ${viewMode === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Kanban className="w-3.5 h-3.5 mr-1.5" /> Kanban
                </Button>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Table vs Kanban */}
          {viewMode === "table" ? (
            /* Main Table Ledger */
            <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl print:hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 border-b border-border h-14">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="text-foreground font-semibold px-6 w-[140px]">Estimate No</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Customer / Client</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Date</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Sales Person</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Grand Total</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Status</TableHead>
                        <TableHead className="text-foreground font-semibold text-right px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotations.length > 0 ? (
                        filteredQuotations.map((q) => (
                          <TableRow 
                            key={q.id} 
                            className="border-b border-border/60 hover:bg-muted/30 transition-colors h-16 group relative"
                          >
                            <TableCell className="px-6 font-semibold text-foreground font-mono text-sm">
                              {q.quotationNumber}
                              {(() => {
                                const today = new Date();
                                const exp = new Date(q.expiryDate);
                                const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                const isExpiringSoon = diffDays >= 0 && diffDays <= 3 && (q.status === "Draft" || q.status === "Sent");
                                return isExpiringSoon ? (
                                  <span className="block mt-1 w-max px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                                    ⏳ Expires in {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
                                  </span>
                                ) : null;
                              })()}
                            </TableCell>
                            
                            <TableCell className="px-6 font-semibold text-foreground">
                              <div>
                                <span>{q.customerName}</span>
                                <span className="block text-[10px] font-normal text-muted-foreground">{q.customerEmail}</span>
                              </div>
                            </TableCell>

                            <TableCell className="px-6 text-foreground text-xs font-mono">
                              {new Date(q.quotationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </TableCell>

                            <TableCell className="px-6 text-foreground text-sm font-medium text-muted-foreground">
                              {q.salesPerson}
                            </TableCell>

                            <TableCell className="px-6 font-semibold font-mono text-foreground text-sm">
                              {q.currency === "INR" ? "₹" : "$"}
                              {q.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>

                            <TableCell className="px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusClass(q.status)}`}>
                                {q.status}
                              </span>
                            </TableCell>

                            {/* Action Grid */}
                            <TableCell className="px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit proposal Form */}
                                {userPermissions.includes("Quotations.CRUD") && (
                                  <Button 
                                    onClick={() => handleOpenEditForm(q)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                    title="Edit Quotation Data"
                                  >
                                    <Edit2Icon className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* View invoice PDF template */}
                                <Button 
                                  onClick={() => {
                                    setSelectedQuotation(q)
                                    setIsViewOpen(true)
                                  }}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                  title="View Estimate / Print PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                {/* Send via Email */}
                                <Button 
                                  onClick={() => {
                                    setSelectedQuotation(q)
                                    setIsEmailOpen(true)
                                  }}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                                  title="Send via Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>

                                {/* WhatsApp Follow-up Reminder */}
                                {(q.status === "Draft" || q.status === "Sent") && (
                                  <Button 
                                    onClick={() => {
                                      let phone = q.customerPhone.replace(/[^0-9]/g, '');
                                      if (phone.length === 10) phone = `91${phone}`;
                                      const msg = `Namaste ${q.contactPerson || q.customerName},%0A%0AAapka Quotation (${q.quotationNumber}) ka reminder hai. Ye quotation *${q.expiryDate}* ko expire hone wala hai.%0AAgar aapka koi sawal ho ya deal final karni ho, toh kripya batayein.%0A%0AThank you!`;
                                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                    }}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all animate-pulse"
                                    title="Send WhatsApp Reminder"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Duplicate Quotation */}
                                {userPermissions.includes("Quotations.CRUD") && (
                                  <Button 
                                    onClick={() => handleDuplicateQuotation(q)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                    title="Duplicate Quotation"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Approve Quotation */}
                                {q.status !== "Approved" && q.status !== "Invoiced" && q.status !== "Expired" && userPermissions.includes("Quotations.Approve") && (
                                  <Button 
                                    onClick={() => handleApproveQuotation(q)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all"
                                    title="Approve Quotation"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Convert to Invoice trigger */}
                                {q.status !== "Invoiced" && userPermissions.includes("Quotations.Approve") && (
                                  <Button 
                                    onClick={() => handleConvertQuotationToInvoice(q)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    title="Approve & Convert to Invoice"
                                  >
                                    <ArrowLeftRight className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Delete */}
                                {userPermissions.includes("Quotations.CRUD") && (
                                  <Button 
                                    onClick={() => {
                                      setSelectedQuotation(q)
                                      setIsDeleteOpen(true)
                                    }}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Estimate log"
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
                          <TableCell colSpan={7} className="h-[400px]">
                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <FileText className="w-10 h-10 text-primary opacity-80" />
                              </div>
                              <h3 className="text-xl font-black text-foreground mb-2">No Proposals Found</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                There are no quotations matching your filters. Try tweaking your search or draft a new estimate.
                              </p>
                              <Button onClick={handleOpenCreateForm} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus className="w-4 h-4 mr-2" />
                                Draft Quotation
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
          ) : (
            /* Kanban Board View */
            <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto pb-4 h-full print:hidden min-h-[500px]">
              {["Draft", "Sent", "Approved", "Rejected"].map(colStatus => (
                <div 
                  key={colStatus} 
                  className="flex-1 min-w-[280px] sm:min-w-[300px] flex flex-col bg-muted/30 rounded-2xl border border-border/60 p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, colStatus as Quotation["status"])}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2 uppercase tracking-wide">
                      <div className={`w-2.5 h-2.5 rounded-full ${colStatus === 'Draft' ? 'bg-slate-500' : colStatus === 'Sent' ? 'bg-blue-500' : colStatus === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {colStatus}
                    </h3>
                    <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[10px] font-bold text-muted-foreground">
                      {filteredQuotations.filter(q => q.status === colStatus).length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
                    {filteredQuotations.filter(q => q.status === colStatus).map((q) => (
                      <Card 
                        key={q.id} 
                        className={`bg-card border-border shadow-sm transition-all duration-300 cursor-move border-l-4 group hover:-translate-y-1 ${
                          colStatus === 'Draft' ? 'hover:shadow-[0_8px_15px_-3px_rgba(100,116,139,0.2)]' :
                          colStatus === 'Sent' ? 'hover:shadow-[0_8px_15px_-3px_rgba(59,130,246,0.2)]' :
                          colStatus === 'Approved' ? 'hover:shadow-[0_8px_15px_-3px_rgba(16,185,129,0.2)]' :
                          'hover:shadow-[0_8px_15px_-3px_rgba(239,68,68,0.2)]'
                        }`}
                        style={{ borderLeftColor: colStatus === 'Draft' ? '#64748b' : colStatus === 'Sent' ? '#3b82f6' : colStatus === 'Approved' ? '#10b981' : '#ef4444' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, q.id)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                              {q.quotationNumber}
                            </span>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenEditForm(q)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-emerald-500"><Edit2Icon className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { setSelectedQuotation(q); setIsViewOpen(true); }} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-extrabold text-foreground text-sm line-clamp-1" title={q.customerName}>{q.customerName}</h4>
                            <p className="text-[11px] text-muted-foreground">{q.salesPerson}</p>
                          </div>

                          <div className="flex items-end justify-between pt-2 border-t border-border/50">
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-muted-foreground">Total Value</span>
                              <span className="font-mono font-bold text-foreground text-sm">
                                {q.currency === "INR" ? "₹" : "$"}
                                {q.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(q.quotationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredQuotations.filter(q => q.status === colStatus).length === 0 && (
                      <div className="h-32 mt-2 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20 opacity-70 hover:opacity-100 transition-opacity">
                        <FileText className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-xs font-semibold">Drop items here</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRINT VIEW AREA: Beautiful GST-Compliant Layout matching instructions */}
          {selectedQuotation && (
            <div className="hidden print:block bg-white text-black p-8 font-sans border-0 shadow-none text-xs w-full max-w-[800px] mx-auto">
              
              {/* Header Company detail */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-800">TAX QUOTATION</h1>
                  <span className="block text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 w-max">GST COMPLIANT PROPOSAL</span>
                  <div className="mt-4 space-y-1 text-slate-600">
                    <span className="block font-bold text-slate-800 text-sm">{OUR_COMPANY.name}</span>
                    <span className="block">{OUR_COMPANY.address}, {OUR_COMPANY.city}</span>
                    <span className="block">GSTIN: <span className="font-mono font-semibold">{OUR_COMPANY.gstin}</span></span>
                    <span className="block">State: {OUR_COMPANY.state} | Pincode: {OUR_COMPANY.pincode}</span>
                  </div>
                </div>

                <div className="text-right space-y-1 text-slate-600 text-xs">
                  <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-left min-w-[200px] space-y-1 mb-2">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Quotation Number</span>
                    <span className="block text-sm font-bold text-slate-800 font-mono">{selectedQuotation.quotationNumber}</span>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase mt-1">Date of Issue</span>
                    <span className="block text-xs font-semibold text-slate-700">{selectedQuotation.quotationDate}</span>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase mt-1">Valid Until (Expiry)</span>
                    <span className="block text-xs font-semibold text-red-600">{selectedQuotation.expiryDate}</span>
                  </div>
                  <span className="block">Email: {OUR_COMPANY.email}</span>
                  <span className="block">Phone: {OUR_COMPANY.phone}</span>
                </div>
              </div>

              {/* Billed To / Shipping / Supply */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-6">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">BILLED TO (BUYER)</span>
                  <span className="block font-bold text-slate-800 text-sm">{selectedQuotation.customerName}</span>
                  <span className="block text-slate-600 leading-relaxed">{selectedQuotation.customerAddress}</span>
                  <span className="block text-slate-600">Contact: {selectedQuotation.contactPerson} ({selectedQuotation.customerPhone})</span>
                  <span className="block text-slate-600">Email: {selectedQuotation.customerEmail}</span>
                </div>

                <div className="space-y-1 text-right">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SHIPPING ADDRESS</span>
                  <span className="block text-slate-600 leading-relaxed">{selectedQuotation.shippingAddress || "Same as Billing Address"}</span>
                  <span className="block text-slate-700 font-bold mt-2">GSTIN: <span className="font-mono">{selectedQuotation.customerGSTIN || "Exempted"}</span></span>
                  <span className="block text-slate-600">Place of Supply: {selectedQuotation.customerState}</span>
                </div>
              </div>

              {/* Sales Person & Currency log */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 mb-6">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Sales Executive</span>
                  <span className="block font-bold text-slate-700 text-xs">{selectedQuotation.salesPerson}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Billing Currency</span>
                  <span className="block font-bold text-slate-700 text-xs">{selectedQuotation.currency}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Status Code</span>
                  <span className="block font-bold text-slate-700 text-xs uppercase">{selectedQuotation.status}</span>
                </div>
              </div>

              {/* Product Line items table */}
              <div className="overflow-x-auto"><table className="w-full border-collapse min-w-[600px] text-left mb-6">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50 h-10 text-slate-800">
                    <th className="font-bold px-2 w-[4%]">#</th>
                    <th className="font-bold px-2 w-[36%]">Product Description</th>
                    <th className="font-bold px-2 w-[8%] text-center">Unit</th>
                    <th className="font-bold px-2 w-[14%] text-right">Rate</th>
                    <th className="font-bold px-2 w-[7%] text-center">Qty</th>
                    <th className="font-bold px-2 w-[7%] text-center">GST</th>
                    <th className="font-bold px-2 w-[10%] text-right">Discount</th>
                    <th className="font-bold px-2 w-[14%] text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item, idx) => (
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
                
                {/* Words Translation */}
                <div className="max-w-[45%] p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rupees In Words</span>
                  <span className="block text-[11px] font-bold text-slate-800 leading-normal mt-1">{numberToWords(selectedQuotation.grandTotal)}</span>
                  
                  {selectedQuotation.attachedFiles && selectedQuotation.attachedFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Attached Documents</span>
                      {selectedQuotation.attachedFiles.map((f, i) => (
                        <span key={i} className="block text-[9px] font-mono text-slate-600">📎 {f}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summaries values */}
                <div className="min-w-[280px] space-y-2 text-slate-600 text-[11px] font-medium">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-slate-800">₹{selectedQuotation.subTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-red-600">
                    <span>Line Discounts sum:</span>
                    <span className="font-mono">- ₹{selectedQuotation.discountAmount.toFixed(2)}</span>
                  </div>

                  {selectedQuotation.customerState === OUR_COMPANY.state ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (Intrastate - 9%):</span>
                        <span className="font-mono text-slate-800">₹{(selectedQuotation.gstAmount / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (Intrastate - 9%):</span>
                        <span className="font-mono text-slate-800">₹{(selectedQuotation.gstAmount / 2).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST (Interstate - 18%):</span>
                      <span className="font-mono text-slate-800">₹{selectedQuotation.gstAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span className="font-mono text-slate-800">₹{selectedQuotation.shippingCharges.toFixed(2)}</span>
                  </div>

                  {selectedQuotation.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Round Off diff:</span>
                      <span className="font-mono">{selectedQuotation.roundOff > 0 ? `+ ₹${selectedQuotation.roundOff}` : `- ₹${Math.abs(selectedQuotation.roundOff)}`}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t-2 border-slate-300 pt-2 text-base font-black text-slate-800">
                    <span>Grand Total:</span>
                    <span className="font-mono text-sm">₹{selectedQuotation.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Notes terms */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                <div className="space-y-2 text-slate-500">
                  <span className="block font-bold text-slate-700">Notes / Remarks:</span>
                  <p className="leading-relaxed text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line">{selectedQuotation.notes}</p>
                  
                  <span className="block font-bold text-slate-700 mt-2">Terms & Conditions:</span>
                  <p className="leading-relaxed text-[10px] text-slate-600 whitespace-pre-line">{selectedQuotation.termsConditions}</p>
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
          <form onSubmit={handleSaveQuotation} className="flex flex-col h-full overflow-hidden">
            
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span>{isEditingExisting ? `Edit Quotation Details (${quoteNumber})` : "Compose New Quotation Proposal"}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure header sections, dynamic multiple product line-item grids, custom terms & file catalogues.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex items-center gap-2 text-xs font-mono font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full shadow-inner">
                {quoteNumber}
              </div>
            </div>

            {/* Scrollable multi-section form body */}
            <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1">
              
              {/* SECTION 1: QUOTATION HEADER INFORMATION */}
              <div className="space-y-4 bg-muted/10 border border-border p-5 rounded-2xl relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Quotation Header Section</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Qtn Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="qtnNum" className="text-xs font-bold text-foreground/80">Quotation Number</Label>
                    <Input
                      id="qtnNum"
                      value={quoteNumber}
                      readOnly
                      className="bg-muted text-muted-foreground font-mono font-bold text-xs rounded-xl h-10"
                    />
                  </div>

                  {/* Qtn Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="qtnDate" className="text-xs font-bold text-foreground/80">Quotation Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="qtnDate"
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                        className="pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="expDate" className="text-xs font-bold text-foreground/80">Expiry Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="expDate"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                        className="pl-10 bg-background border-border rounded-xl h-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="qCustomer" className="text-xs font-bold text-foreground/80">Select Customer *</Label>
                    <SearchableSelect
                      options={customers.map(c => ({ id: c.id, label: `${c.companyName} (${c.state})` }))}
                      value={quoteCustomerId}
                      onChange={(val) => handleCustomerSelection(val)}
                      placeholder="-- Select Buyer --"
                      required
                    />
                  </div>

                  {/* Contact Person Auto Fill */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contactP" className="text-xs font-bold text-foreground/80">Contact Person</Label>
                    <Input
                      id="contactP"
                      placeholder="Auto Filled / Custom"
                      value={customers.find(c => c.id.toString() === quoteCustomerId.toString())?.contactPerson || ""}
                      readOnly
                      className="bg-muted text-muted-foreground rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Phone Auto Fill */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cPhone" className="text-xs font-bold text-foreground/80">Phone Number</Label>
                    <Input
                      id="cPhone"
                      placeholder="Auto Filled / Custom"
                      value={customers.find(c => c.id.toString() === quoteCustomerId.toString())?.phone || ""}
                      readOnly
                      className="bg-muted text-muted-foreground rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Email Auto Fill */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cEmail" className="text-xs font-bold text-foreground/80">Email ID</Label>
                    <Input
                      id="cEmail"
                      placeholder="Auto Filled / Custom"
                      value={customers.find(c => c.id.toString() === quoteCustomerId.toString())?.email || ""}
                      readOnly
                      className="bg-muted text-muted-foreground rounded-xl h-10 text-xs font-medium"
                    />
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

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formStatus" className="text-xs font-bold text-foreground/80">Status</Label>
                    <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                      <SelectTrigger id="formStatus" className="px-3 bg-background border border-border focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-xs font-bold text-foreground outline-none">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <span>2. Product Item Section (Most Important)</span>
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
                      {quoteItems.length > 0 ? (
                        quoteItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            
                            {/* Product dropdown catalog selection */}
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

                            {/* Unit (Editable) */}
                            <td className="py-3.5">
                              <Input
                                value={item.unit}
                                onChange={(e) => handleRowItemChange(item.id, "unit", e.target.value)}
                                className="bg-background border-border rounded-xl h-9 text-xs font-bold text-center w-20 mx-auto"
                              />
                            </td>

                            {/* Price/Rate (Editable) */}
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

                            {/* GST Selection (Editable) */}
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

                            {/* Line Total Auto fill calculated */}
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

              {/* SECTION 3: CALCULATIONS SUMMARY & TERMS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
                
                {/* Notes, Terms & Catalogue Attachments */}
                <div className="space-y-4">
                  
                  {/* Notes Remarks */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formNotes" className="text-xs font-bold text-foreground/80">Notes / Remarks (Extra information)</Label>
                    <textarea
                      id="formNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Delivery within 7 working days."
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
                      placeholder="1. Payment terms..."
                      rows={3}
                      className="p-3 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl w-full text-xs font-medium outline-none resize-none font-mono transition-all"
                    />
                  </div>

                  {/* File Upload Section (Optional Advanced) */}
                  <div className="space-y-3 bg-muted/20 border border-border p-4 rounded-xl shadow-inner">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>5. File Upload Section (Optional Advanced)</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FileImage className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. product_brochure.pdf"
                          value={mockFileNameInput}
                          onChange={(e) => setMockFileNameInput(e.target.value)}
                          className="pl-10 bg-background border-border rounded-xl h-9 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleMockFileUpload}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-xl text-xs h-9 px-3 shrink-0"
                      >
                        Attach File
                      </Button>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/40">
                        <span className="block text-[9px] font-bold text-muted-foreground uppercase">Attachments List</span>
                        <div className="flex flex-wrap gap-1.5">
                          {attachedFiles.map((f, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] px-2 py-0.5 rounded-full"
                            >
                              📎 {f}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveAttachment(i)} 
                                className="text-red-500 hover:text-red-700 ml-1 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Summary Section Calculation values */}
                <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3 font-semibold text-xs text-foreground shadow-sm">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest pb-1 border-b border-border">
                    3. Summary Section Calculations
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
                    <span>Shipping / Logistics Charges:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                        {currency === "INR" ? "₹" : "$"}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={shippingCharges}
                        onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                        className="pl-6 bg-background border-border rounded-xl h-8 text-xs font-bold font-mono text-right"
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
                  <div className="flex justify-between text-base font-black text-primary border-t border-border pt-2.5">
                    <span>Grand Total:</span>
                    <span className="font-mono text-sm">
                      {currency === "INR" ? "₹" : "$"}
                      {activeSummary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
              
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs px-4 h-9 border-0 shadow-sm transition-all w-full sm:w-auto"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Save Proposal
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: PREVIEW TAX QUOTATION / PRINT VIEW */}
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
            #print-only-layout .h-\\[120px\\] { height: 120px !important; }
          }
        `}</style>
        <DialogContent className="bg-card border-none text-foreground !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 w-full h-[100dvh] max-w-none max-h-none rounded-none shadow-none overflow-hidden p-0 flex flex-col print:block print:static print:transform-none print:overflow-visible print:max-h-none print:h-auto print:w-full print:border-none print:shadow-none print:bg-transparent print:p-0 print:m-0">
          <div className="px-6 py-5 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between print:hidden">
             <div>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>GST Tax Invoice/Quotation Preview</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Standard format for Indian businesses with dynamic CGST/SGST/IGST tax rates.
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrintQuotation}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-9 px-3 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
              </Button>

              <Button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#1ebd5b] text-white font-semibold rounded-xl border-0 h-9 px-3 text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp Share
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsViewOpen(false)}
                className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Non-scrolling wrapper, making the quotation stretch top to bottom */}
          <div className="flex-1 min-h-0 overflow-hidden print:block print:overflow-visible print:h-auto bg-white">
            {selectedQuotation && (
              <div className="w-full h-full print-zoom-reset">
                <Card id="print-only-layout" className="mx-auto bg-white text-black p-4 sm:p-8 font-sans w-full h-full border-0 shadow-none rounded-none print:border-none print:shadow-none relative overflow-hidden print:overflow-visible flex flex-col">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start border-b border-border pb-6 mb-6 gap-6">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-primary">TAX ESTIMATE</h1>
                    <span className="inline-block text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 font-mono">
                      {selectedQuotation.quotationNumber}
                    </span>
                    <div className="mt-4 space-y-1 text-xs">
                      <span className="block font-bold text-foreground text-sm">{OUR_COMPANY.name}</span>
                      <span className="block text-muted-foreground">{OUR_COMPANY.address}, {OUR_COMPANY.city}</span>
                      <span className="block text-muted-foreground">GSTIN: <span className="font-mono font-semibold">{OUR_COMPANY.gstin}</span></span>
                      <span className="block text-muted-foreground">State: {OUR_COMPANY.state} | Pincode: {OUR_COMPANY.pincode}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1 text-xs">
                    <div className="bg-muted/40 p-3 rounded-lg border border-border text-left min-w-[200px] space-y-1 mb-2">
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase">Quotation Code</span>
                      <span className="block text-sm font-bold text-foreground font-mono">{selectedQuotation.quotationNumber}</span>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase mt-1">Date Issued</span>
                      <span className="block text-xs font-semibold text-foreground">{selectedQuotation.quotationDate}</span>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase mt-1">Valid Until (Expiry)</span>
                      <span className="block text-xs font-semibold text-red-500 font-mono">{selectedQuotation.expiryDate}</span>
                    </div>
                    <span className="block text-muted-foreground">Email: {OUR_COMPANY.email}</span>
                    <span className="block text-muted-foreground">Phone: {OUR_COMPANY.phone}</span>
                  </div>
                </div>

                {/* Billed to Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-border pb-6 mb-6 text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">BILLED TO (BUYER)</span>
                    <span className="block font-bold text-foreground text-sm">{selectedQuotation.customerName}</span>
                    <span className="block text-muted-foreground leading-relaxed">{selectedQuotation.customerAddress}</span>
                    <span className="block text-muted-foreground">Contact: {selectedQuotation.contactPerson} ({selectedQuotation.customerPhone})</span>
                    <span className="block text-muted-foreground">Email: {selectedQuotation.customerEmail}</span>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SHIPPING ADDRESS</span>
                    <span className="block text-muted-foreground leading-relaxed">{selectedQuotation.shippingAddress || "Same as billing address"}</span>
                    <span className="block text-foreground font-bold mt-2">GSTIN: <span className="font-mono">{selectedQuotation.customerGSTIN || "Exempted"}</span></span>
                    <span className="block text-muted-foreground">Place of Supply: {selectedQuotation.customerState}</span>
                  </div>
                </div>

                {/* Table Data - Scrolls internally on screen so header/footer stay locked! */}
                <div className="flex-1 overflow-y-auto print:overflow-visible min-h-[150px] border-b border-border mb-6"><table className="w-full border-collapse min-w-[600px] text-left text-xs relative">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-border bg-muted/90 backdrop-blur-sm h-10">
                      <th className="font-bold text-foreground px-3 w-[5%]">#</th>
                      <th className="font-bold text-foreground px-3 w-[35%]">Product / Service</th>
                      <th className="font-bold text-foreground px-3 text-center w-[8%]">Unit</th>
                      <th className="font-bold text-foreground px-3 text-right w-[14%]">Unit Price</th>
                      <th className="font-bold text-foreground px-3 text-center w-[8%]">Qty</th>
                      <th className="font-bold text-foreground px-3 text-center w-[7%]">GST</th>
                      <th className="font-bold text-foreground px-3 text-right w-[11%]">Discount</th>
                      <th className="font-bold text-foreground px-3 text-right w-[12%]">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-border h-10 text-foreground/80">
                        <td className="px-3 font-mono">{idx + 1}</td>
                        <td className="px-3">
                          <span className="block font-bold text-foreground">{item.productName}</span>
                          <span className="block text-[10px] text-muted-foreground italic font-medium">{item.description}</span>
                        </td>
                        <td className="px-3 text-center">{item.unit}</td>
                        <td className="px-3 text-right font-mono">
                          {selectedQuotation.currency === "INR" ? "₹" : "$"}
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 text-center font-mono">{item.quantity}</td>
                        <td className="px-3 text-center font-mono">{item.gstPercent}%</td>
                        <td className="px-3 text-right font-mono text-red-500">
                          {item.discountType === "Percentage" ? `${item.discountValue}%` : `${selectedQuotation.currency === "INR" ? "₹" : "$"}${item.discountValue}`}
                        </td>
                        <td className="px-3 text-right font-mono font-semibold">
                          {selectedQuotation.currency === "INR" ? "₹" : "$"}
                          {item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>

                {/* Summary Calculations */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-start mt-8 text-xs gap-6 w-full">
                  <div className="w-full md:max-w-[45%] p-3 bg-muted/10 rounded-lg border border-border">
                    <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount In Words</span>
                    <span className="block text-xs font-bold text-foreground leading-normal mt-1">{numberToWords(selectedQuotation.grandTotal)}</span>
                    
                    {selectedQuotation.attachedFiles && selectedQuotation.attachedFiles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border space-y-1">
                        <span className="block text-[8px] font-bold text-muted-foreground uppercase">Attachments</span>
                        {selectedQuotation.attachedFiles.map((f, i) => (
                          <span key={i} className="block text-[9px] font-mono text-muted-foreground">📎 {f}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:min-w-[280px] space-y-2 text-muted-foreground text-sm">
                    <div className="flex justify-between">
                      <span>Taxable Subtotal:</span>
                      <span className="font-mono text-foreground">
                        {selectedQuotation.currency === "INR" ? "₹" : "$"}
                        {selectedQuotation.subTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-red-500">
                      <span>Total Discounts:</span>
                      <span className="font-mono">
                        - {selectedQuotation.currency === "INR" ? "₹" : "$"}
                        {selectedQuotation.discountAmount.toFixed(2)}
                      </span>
                    </div>

                    {selectedQuotation.customerState === OUR_COMPANY.state ? (
                      <>
                        <div className="flex justify-between">
                          <span>CGST (Intrastate - 9%):</span>
                          <span className="font-mono text-foreground">
                            {selectedQuotation.currency === "INR" ? "₹" : "$"}
                            {(selectedQuotation.gstAmount / 2).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST (Intrastate - 9%):</span>
                          <span className="font-mono text-foreground">
                            {selectedQuotation.currency === "INR" ? "₹" : "$"}
                            {(selectedQuotation.gstAmount / 2).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>IGST (Interstate - 18%):</span>
                        <span className="font-mono text-foreground">
                          {selectedQuotation.currency === "INR" ? "₹" : "$"}
                          {selectedQuotation.gstAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping / Freight:</span>
                      <span className="font-mono text-foreground">
                        {selectedQuotation.currency === "INR" ? "₹" : "$"}
                        {selectedQuotation.shippingCharges.toFixed(2)}
                      </span>
                    </div>

                    {selectedQuotation.roundOff !== 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Round Off:</span>
                        <span className="font-mono text-foreground">
                          {selectedQuotation.roundOff > 0 ? `+ ₹${selectedQuotation.roundOff}` : `- ₹${Math.abs(selectedQuotation.roundOff)}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-border pt-2 text-base font-black text-foreground animate-pulse">
                      <span>Grand Total:</span>
                      <span className="font-mono text-foreground">
                        {selectedQuotation.currency === "INR" ? "₹" : "$"}
                        {selectedQuotation.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes, terms and signature panels */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-border text-xs">
                  <div className="space-y-1 text-muted-foreground">
                    <span className="block font-bold text-foreground">Notes / Remarks:</span>
                    <p className="leading-relaxed text-[10px] bg-muted/30 p-2 rounded whitespace-pre-line border border-border/40 text-foreground/80">{selectedQuotation.notes}</p>
                    
                    <span className="block font-bold text-foreground mt-2">Terms & Conditions:</span>
                    <p className="leading-relaxed text-[10px] whitespace-pre-line">{selectedQuotation.termsConditions}</p>
                  </div>

                  <div className="text-right flex flex-col justify-end items-end space-y-1">
                    <span className="block text-[10px] text-muted-foreground italic">For {workspaceSettings?.companyName || OUR_COMPANY.name}</span>
                    {workspaceSettings?.authorizedSignature ? (
                      <div className="h-12 w-24 flex items-center justify-end">
                        <img src={workspaceSettings.authorizedSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-10 w-24 border-b border-border"></div>
                    )}
                    <span className="block font-bold text-foreground mt-2">Authorized Signatory</span>
                  </div>
                </div>

              </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: CONVERT TO INVOICE SUCCESS POPUP */}
      <Dialog open={isInvoiceConvertOpen} onOpenChange={setIsInvoiceConvertOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <DialogTitle className="text-lg font-bold text-center text-foreground">Convert Proposal to Tax Invoice?</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Converting quotation <span className="text-foreground font-bold">{selectedQuotation?.quotationNumber}</span> will lock calculations, register dynamic accounts, and generate tax invoice log <span className="text-primary font-bold">{convertedInvoiceNum}</span>.
            </DialogDescription>
          </DialogHeader>

          {selectedQuotation && (
            <div className="bg-muted/30 border border-border p-4 rounded-xl font-semibold text-xs space-y-2 my-2 shadow-inner">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Name:</span>
                <span className="text-foreground">{selectedQuotation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST Supply Mode:</span>
                <span className="text-foreground">{selectedQuotation.customerState === OUR_COMPANY.state ? "Intrastate (CGST/SGST)" : "Interstate (IGST)"}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1.5 text-primary text-sm font-black">
                <span>Grand Total:</span>
                <span>
                  {selectedQuotation.currency === "INR" ? "₹" : "$"}
                  {selectedQuotation.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-border mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsInvoiceConvertOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleConfirmConvert}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl px-5 border-0 shadow-sm w-full sm:w-auto"
            >
              Confirm & Convert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: EMAIL MODAL */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-2">
              <Send className={`w-6 h-6 ${isSendingEmail ? "animate-pulse translate-x-1 -translate-y-1" : ""}`} />
            </div>
            <DialogTitle className="text-lg font-bold text-center text-foreground">Email Quotation</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Send quotation <span className="font-mono text-foreground font-semibold">{selectedQuotation?.quotationNumber}</span> to <span className="font-semibold text-foreground">{selectedQuotation?.customerEmail || "customer"}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-xl border border-border text-xs text-muted-foreground my-4 space-y-2">
            <p><strong>Subject:</strong> Quotation {selectedQuotation?.quotationNumber} from {OUR_COMPANY.name}</p>
            <p><strong>Attachment:</strong> {selectedQuotation?.quotationNumber}_Estimate.pdf</p>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-center mt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsEmailOpen(false)}
              disabled={isSendingEmail}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm w-full sm:w-auto px-6"
            >
              {isSendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6 animate-bounce" />
            </div>
            <DialogTitle className="text-lg font-bold text-center text-foreground">Delete Proposal estimate?</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete quotation proposal <span className="text-foreground font-bold">{selectedQuotation?.quotationNumber}</span>? This action is irreversible.
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
                if (!selectedQuotation) return
                const updated = quotations.filter(q => q.id !== selectedQuotation.id)
                saveQuotations(updated)
                setIsDeleteOpen(false)
                toast.success(`${selectedQuotation.quotationNumber} deleted successfully!`)
                setSelectedQuotation(null)
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 border-0 shadow-sm w-full sm:w-auto"
            >
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// Inline fallback Edit icon to satisfy TypeScript compiler
function Edit2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
// Force HMR








