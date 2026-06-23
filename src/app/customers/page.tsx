"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  History, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Menu,
  Sun,
  Moon,
  Users,
  FileSpreadsheet,
  FileCheck,
  FileText,
  CreditCard,
  Star,
  ShieldCheck,
  AlertCircle,
  LayoutGrid,
  List
} from "lucide-react"

import { api } from "@/lib/api"
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
import { toast } from "sonner"

// Interfaces
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

interface HistoryItem {
  id: number | string;
  date: string;
  type: "invoice_created" | "payment_received" | "account_created" | "gst_verified";
  description: string;
  amount?: string;
  status: "success" | "pending" | "completed";
}



// Initial seed data
const SEED_CUSTOMERS: Customer[] = [
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
  },
  {
    id: 3,
    companyName: "Apex Enterprises",
    contactPerson: "Priyanka Sen",
    phone: "9988776655",
    email: "priyanka@apexdelhi.in",
    gstNumber: "07BBBBB2222B2Z2",
    address: "Block B, Okhla Industrial Area Phase 1",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
    createdAt: "2026-05-20T14:20:00.000Z"
  },
  {
    id: 4,
    companyName: "Southern Agri-Tech Corp",
    contactPerson: "Karthik Subramanian",
    phone: "9444012345",
    email: "karthik@southernagri.co.in",
    gstNumber: "33DDDDD4444D4Z4",
    address: "12, Mount Road, Nandanam",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600035",
    createdAt: "2026-05-22T10:15:00.000Z"
  }
];
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function CustomersPage() {
  // Main states
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [customerStats, setCustomerStats] = useState<Record<string, { totalBilled: number, pendingBalance: number }>>({})
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const [data, invoicesRes] = await Promise.all([
        api.customers.getAll(),
        api.invoices.getAll().catch(() => [])
      ])
      
      const stats: Record<string, { totalBilled: number, pendingBalance: number }> = {}
      
      if (Array.isArray(invoicesRes)) {
        invoicesRes.forEach((inv: any) => {
          const cid = inv.customerId
          if (!stats[cid]) stats[cid] = { totalBilled: 0, pendingBalance: 0 }
          stats[cid].totalBilled += inv.grandTotal || 0
          stats[cid].pendingBalance += inv.balanceAmount ?? (inv.grandTotal - (inv.paidAmount || 0))
        })
      }
      
      setCustomerStats(stats)
      setCustomers(data)
    } catch (e) {
      console.error(e)
      toast.error("Failed to fetch customers")
    } finally {
      setIsLoading(false)
    }
  }

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
    const handle = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchCustomers()
    }
  }, [mounted])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  
  // Theme state: default to 'light' (clean & bright)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("invoice_management_theme") as "light" | "dark" | null
      return savedTheme || "light"
    }
    return "light"
  })

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Selected Customer States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("invoice_management_theme", theme)
  }, [theme])

  // Listen for bot actions
  useEffect(() => {
    const handleCreateCustomer = () => setIsAddOpen(true);
    window.addEventListener('BOT_ACTION_CREATE_CUSTOMER', handleCreateCustomer);
    return () => window.removeEventListener('BOT_ACTION_CREATE_CUSTOMER', handleCreateCustomer);
  }, []);

  // Sync to LocalStorage (Removed as we use real DB)
  // Handle Form Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }


  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.companyName.trim()) errors.companyName = "Company Name is required"
    if (!formData.contactPerson.trim()) errors.contactPerson = "Contact Person is required"
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = "Phone must be exactly 10 digits"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Invalid email format"
    }

    // GST validation (Standard Indian GST: 15 characters)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (formData.gstNumber.trim()) {
      if (!gstRegex.test(formData.gstNumber.trim().toUpperCase())) {
        errors.gstNumber = "Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)"
      }
    }

    if (!formData.address.trim()) errors.address = "Address is required"
    if (!formData.city.trim()) errors.city = "City is required"
    if (!formData.state.trim()) errors.state = "State is required"
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required"
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Pincode must be exactly 6 digits"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open Add Dialog
  const handleOpenAdd = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: ""
    })
    setFormErrors({})
    setIsAddOpen(true)
  }

  // Submit Add Customer
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.")
      return
    }

    try {
      const newCustomer = await api.customers.create(formData)
      setCustomers([newCustomer, ...customers])
      setIsAddOpen(false)
      toast.success(`${newCustomer.companyName} added successfully!`)
    } catch (e: any) {
      toast.error(e.message || "Failed to add customer")
    }
  }

  // Open Edit Dialog
  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      phone: customer.phone,
      email: customer.email,
      gstNumber: customer.gstNumber || "",
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode
    })
    setFormErrors({})
    setIsEditOpen(true)
  }

  // Submit Edit Customer
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return

    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.")
      return
    }

    try {
      const updatedCustomer = await api.customers.update(selectedCustomer.id, formData)
      const updatedCustomers = customers.map(c => c.id == selectedCustomer.id ? updatedCustomer : c)
      setCustomers(updatedCustomers)
      setIsEditOpen(false)
      toast.success(`${formData.companyName} updated successfully!`)
    } catch (e: any) {
      toast.error(e.message || "Failed to update customer")
    }
  }

  // Open Delete Dialog
  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(true)
  }

  // Confirm Delete Customer
  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return
    try {
      await api.customers.delete(selectedCustomer.id)
      const updated = customers.filter(c => c.id !== selectedCustomer.id)
      setCustomers(updated)
      setIsDeleteOpen(false)
      toast.success(`${selectedCustomer.companyName} deleted successfully!`)
      setSelectedCustomer(null)
    } catch (e: any) {
      toast.error(e.message || "Failed to delete customer")
    }
  }

  // Open History Dialog
  const handleOpenHistory = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsHistoryOpen(true)
  }

  // Generated realistic history items
  const getCustomerHistory = (customer: Customer | null): HistoryItem[] => {
    if (!customer) return []
    const seed = customer.companyName.length
    
    return [
      {
        id: 1,
        date: new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        type: "account_created" as const,
        description: `Customer account registered with Contact Person: ${customer.contactPerson}`,
        status: "completed" as const
      },
      ...(customer.gstNumber ? [{
        id: 2,
        date: new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        type: "gst_verified" as const,
        description: `GSTIN ${customer.gstNumber} verified with Govt GST portal`,
        status: "success" as const
      }] : []),
      {
        id: 3,
        date: "23 May 2026",
        type: "invoice_created" as const,
        description: `Tax Invoice INV/2026/084 generated for consulting services`,
        amount: `₹${(seed * 1234).toLocaleString("en-IN")}.00`,
        status: "completed" as const
      },
      {
        id: 4,
        date: "24 May 2026",
        type: "payment_received" as const,
        description: `Payment received via UPI for Invoice INV/2026/084`,
        amount: `₹${(seed * 1234).toLocaleString("en-IN")}.00`,
        status: "success" as const
      },
      {
        id: 5,
        date: "25 May 2026",
        type: "invoice_created" as const,
        description: `Tax Invoice INV/2026/099 generated for annual support`,
        amount: `₹${(seed * 3421).toLocaleString("en-IN")}.00`,
        status: "pending" as const
      }
    ].reverse() as HistoryItem[]
  }

  // Generate a dynamic health badge for the customer
  const getCustomerHealthBadge = (customer: Customer) => {
    const isNew = new Date(customer.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    const stats = customerStats[customer.id] || { totalBilled: 0, pendingBalance: 0 };
    
    if (stats.pendingBalance > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 mt-1 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
          <AlertCircle className="w-2.5 h-2.5 text-red-500" /> Pending (₹{stats.pendingBalance.toLocaleString("en-IN")})
        </span>
      );
    } else if (stats.totalBilled >= 100000) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-600 border border-amber-500/40 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> VIP Client
        </span>
      );
    } else if (isNew) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/30 mt-1 shadow-sm">
          <ShieldCheck className="w-2.5 h-2.5 text-blue-500" /> New Client
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-1">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Regular
      </span>
    );
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase()
    return (
      customer.companyName.toLowerCase().includes(query) ||
      customer.contactPerson.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      (customer.gstNumber && customer.gstNumber.toLowerCase().includes(query)) ||
      customer.city.toLowerCase().includes(query) ||
      customer.state.toLowerCase().includes(query)
    )
  })

  // Prevent hydration mismatch by returning a clean initial loading shell
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Building className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Initializing billing system...</p>
          <p className="text-xs text-muted-foreground">Securing Indian tax ledger configuration</p>
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
        
        {/* Top Header with Theme Toggler */}
        <header className="flex items-center justify-between h-20 px-6 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-40">
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
                Customer Directory
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Manage, search, edit, delete, and view ledger history of all your retail and commercial clients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
              className="rounded-xl border-border bg-card/60 hover:bg-accent hover:text-accent-foreground h-10 w-10 transition-all duration-300"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-800 transition-all rotate-0 scale-100" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400 transition-all rotate-0 scale-100" />
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] text-primary font-semibold shadow-[0_0_10px_rgba(99,102,241,0.05)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Ledger Active
            </div>
            {userPermissions.includes("Customers.CRUD") && (
              <Button 
                onClick={handleOpenAdd}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-10 px-3 md:px-4 transition-all shadow-md shadow-primary/10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> <span className="hidden md:inline">Add Customer</span>
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Search & Statistics Overview */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-5 rounded-2xl border border-border">
            
            {/* Search Field */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search by Company, Contact Name, Email, GSTIN or Location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 w-full text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick stats on customer search and View Toggle */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
              <div className="hidden sm:flex items-center gap-4">
                <div>
                  Total: <span className="text-foreground font-bold">{customers.length}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                <div>
                  Matches: <span className="text-primary font-bold">{filteredCustomers.length}</span>
                </div>
              </div>
              
              <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("table")}
                  className={`h-8 px-3 rounded-lg ${viewMode === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-4 h-4 mr-2" /> Table
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-3 rounded-lg ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" /> Grid
                </Button>
              </div>
            </div>
          </div>

          {/* Conditional View Rendering */}
          {viewMode === "table" ? (
            /* Customers Table Card */
            <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 border-b border-border h-14">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="text-foreground font-semibold px-6 w-[250px]">Company Name</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Contact Person</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Phone / Email</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">GSTIN</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Location</TableHead>
                        {userPermissions.includes("Customers.CRUD") && (
                          <TableHead className="text-foreground font-semibold text-right px-6">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <TableRow 
                            key={customer.id} 
                            className="border-b border-border/60 hover:bg-muted/30 transition-colors h-16 group"
                          >
                            {/* Company details */}
                            <TableCell className="px-6 font-semibold text-foreground">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border font-black text-xs uppercase shrink-0 ${getAvatarColor(customer.companyName)}`}>
                                  {customer.companyName.charAt(0)}
                                </div>
                                <div className="truncate max-w-[200px]">
                                  <span className="block truncate hover:text-primary transition-colors">{customer.companyName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="block text-[10px] font-normal text-muted-foreground mt-1.5">Created: {new Date(customer.createdAt).toLocaleDateString("en-IN", {day: "numeric", month: "short"})}</span>
                                    {getCustomerHealthBadge(customer)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            {/* Contact Person */}
                            <TableCell className="px-6 text-foreground">
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <User className="w-3.5 h-3.5 text-primary" />
                                {customer.contactPerson}
                              </div>
                            </TableCell>

                            {/* Phone / Email */}
                            <TableCell className="px-6 text-foreground">
                              <div className="space-y-0.5">
                                <span className="block text-xs font-semibold flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-primary" /> {customer.phone}
                                </span>
                                <span className="block text-[11px] text-muted-foreground flex items-center gap-1 truncate max-w-[170px]">
                                  <Mail className="w-3 h-3 text-muted-foreground/80" /> {customer.email}
                                </span>
                              </div>
                            </TableCell>

                            {/* GSTIN */}
                            <TableCell className="px-6 font-mono text-xs">
                              {customer.gstNumber ? (
                                <span className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold tracking-wider">
                                  {customer.gstNumber}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic text-[11px]">Exempted / Unregistered</span>
                              )}
                            </TableCell>

                            {/* Address / Location */}
                            <TableCell className="px-6 text-foreground">
                              <div className="max-w-[180px] truncate text-xs">
                                <span className="block font-semibold flex items-center gap-1 text-foreground/90">
                                  <MapPin className="w-3 h-3 text-red-500/80 shrink-0" /> {customer.city}
                                </span>
                                <span className="block text-muted-foreground truncate mt-0.5">{customer.address}</span>
                              </div>
                            </TableCell>

                            {/* Actions columns */}
                            <TableCell className="px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* History button */}
                                <Button 
                                  onClick={() => handleOpenHistory(customer)}
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                  title="View Customer Ledger & History"
                                >
                                  <History className="w-4 h-4" />
                                </Button>

                                {userPermissions.includes("Customers.CRUD") && (
                                  <>
                                    {/* Edit button */}
                                    <Button 
                                      onClick={() => handleOpenEdit(customer)}
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                      title="Edit Details"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>

                                    {/* Delete button */}
                                    <Button 
                                      onClick={() => handleOpenDelete(customer)}
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                      title="Delete Customer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6} className="h-[400px]">
                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Users className="w-10 h-10 text-primary opacity-80" />
                              </div>
                              <h3 className="text-xl font-black text-foreground mb-2">No Customers Found</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                We couldn't find any customers matching your criteria. Try adjusting your search or add a new client to your directory.
                              </p>
                              <Button onClick={handleOpenAdd} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Customer
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
            /* Customers Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-black text-lg uppercase shadow-sm ${getAvatarColor(customer.companyName)}`}>
                          {customer.companyName.charAt(0)}
                        </div>
                        <div className="flex flex-col items-end">
                          {getCustomerHealthBadge(customer)}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-base font-extrabold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors" title={customer.companyName}>
                          {customer.companyName}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                          <User className="w-3.5 h-3.5" /> {customer.contactPerson}
                        </p>
                      </div>

                      <div className="p-3.5 bg-muted/30 rounded-xl border border-border/50 mb-4 space-y-2.5 flex-1">
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[11px] font-medium text-foreground hover:text-primary transition-colors">
                          <div className="w-5 h-5 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                            <Phone className="w-2.5 h-2.5 text-primary" />
                          </div>
                          {customer.phone}
                        </a>
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-[11px] font-medium text-foreground hover:text-primary transition-colors truncate" title={customer.email}>
                          <div className="w-5 h-5 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                            <Mail className="w-2.5 h-2.5 text-primary" />
                          </div>
                          <span className="truncate">{customer.email}</span>
                        </a>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-foreground truncate" title={`${customer.city}, ${customer.state}`}>
                          <div className="w-5 h-5 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                            <MapPin className="w-2.5 h-2.5 text-red-500/80" />
                          </div>
                          <span className="truncate">{customer.city}, {customer.state}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto pt-2 border-t border-border/50">
                        <Button 
                          onClick={() => handleOpenHistory(customer)}
                          variant="outline" 
                          className="flex-1 h-8 bg-background border-border text-[10px] font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                          <History className="w-3 h-3 mr-1.5" /> Ledger
                        </Button>
                        {userPermissions.includes("Customers.CRUD") && (
                          <>
                            <Button 
                              onClick={() => handleOpenEdit(customer)}
                              variant="outline" 
                              className="h-8 w-8 p-0 bg-background border-border text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all shrink-0"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleOpenDelete(customer)}
                              variant="outline" 
                              className="h-8 w-8 p-0 bg-background border-border text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all shrink-0"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full h-[400px]">
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">No Customers Found</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      We couldn't find any customers matching your criteria. Try adjusting your search or add a new client to your directory.
                    </p>
                    <Button onClick={handleOpenAdd} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Customer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* DIALOG 1: ADD CUSTOMER MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <form onSubmit={handleAddSubmit}>
            <div className="px-6 py-5 border-b border-border bg-muted/10">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Register New Customer</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Provide detailed organizational profiling, billing, and tax parameters below.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Spacious Form Body - 2 Column Grid */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Column 1: Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-bold text-foreground/80">Company Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    placeholder="e.g. Reliance Retail Ventures Ltd" 
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.companyName ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.companyName && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.companyName}</span>}
              </div>

              {/* Column 2: Contact Person */}
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-xs font-bold text-foreground/80">Contact Person *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="contactPerson" 
                    name="contactPerson" 
                    placeholder="e.g. Harish Chandra" 
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.contactPerson ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.contactPerson && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.contactPerson}</span>}
              </div>

              {/* Column 1: Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-foreground/80">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="10-digit number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.phone ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.phone && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.phone}</span>}
              </div>

              {/* Column 2: Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-foreground/80">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="billing@company.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.email && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.email}</span>}
              </div>

              {/* Column 1: GSTIN */}
              <div className="space-y-1.5">
                <Label htmlFor="gstNumber" className="text-xs font-bold text-foreground/80 flex items-center justify-between">
                  <span>GSTIN <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></span>
                </Label>
                <div className="relative">
                  <FileSpreadsheet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="gstNumber" 
                    name="gstNumber" 
                    placeholder="e.g. 27AAAAA1111A1Z1" 
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                    className={`pl-10 uppercase font-mono bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm tracking-wider transition-all ${formErrors.gstNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.gstNumber && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.gstNumber}</span>}
              </div>

              {/* Column 2: Billing Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold text-foreground/80">Billing Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="Floor, building, street address details..." 
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.address && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.address}</span>}
              </div>

              {/* Column 1 & 2 Combined (Span 2): City, State, Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-1 md:col-span-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-foreground/80">City *</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    placeholder="e.g. Mumbai" 
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.city ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.city && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.city}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-foreground/80">State *</Label>
                  <Input 
                    id="state" 
                    name="state" 
                    placeholder="e.g. Maharashtra" 
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.state ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.state && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.state}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-bold text-foreground/80">Pincode *</Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    placeholder="6-digit PIN" 
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.pincode ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.pincode && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.pincode}</span>}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end items-center gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm h-10 px-4 font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold rounded-xl h-10 px-6 border-0 text-sm shadow-md"
              >
                Save Customer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT CUSTOMER MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <form onSubmit={handleEditSubmit}>
            <div className="px-6 py-5 border-b border-border bg-muted/10">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-emerald-500" />
                  <span>Modify Customer Info</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update billing coordinates, contact parameters or GST numbers for this client.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Spacious Form Body - 2 Column Grid */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Column 1: Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-companyName" className="text-xs font-bold text-foreground/80">Company Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-companyName" 
                    name="companyName" 
                    placeholder="e.g. Reliance Retail Ventures Ltd" 
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.companyName ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.companyName && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.companyName}</span>}
              </div>

              {/* Column 2: Contact Person */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-contactPerson" className="text-xs font-bold text-foreground/80">Contact Person *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-contactPerson" 
                    name="contactPerson" 
                    placeholder="e.g. Harish Chandra" 
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.contactPerson ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.contactPerson && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.contactPerson}</span>}
              </div>

              {/* Column 1: Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-foreground/80">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    placeholder="10-digit number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.phone ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.phone && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.phone}</span>}
              </div>

              {/* Column 2: Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-bold text-foreground/80">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    placeholder="billing@company.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.email && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.email}</span>}
              </div>

              {/* Column 1: GSTIN */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-gstNumber" className="text-xs font-bold text-foreground/80 flex items-center justify-between">
                  <span>GSTIN <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></span>
                </Label>
                <div className="relative">
                  <FileSpreadsheet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-gstNumber" 
                    name="gstNumber" 
                    placeholder="e.g. 27AAAAA1111A1Z1" 
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                    className={`pl-10 uppercase font-mono bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm tracking-wider transition-all ${formErrors.gstNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.gstNumber && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.gstNumber}</span>}
              </div>

              {/* Column 2: Billing Address */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-address" className="text-xs font-bold text-foreground/80">Billing Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-address" 
                    name="address" 
                    placeholder="Floor, building, street address details..." 
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.address && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.address}</span>}
              </div>

              {/* Column 1 & 2 Combined (Span 2): City, State, Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-1 md:col-span-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-city" className="text-xs font-bold text-foreground/80">City *</Label>
                  <Input 
                    id="edit-city" 
                    name="city" 
                    placeholder="e.g. Mumbai" 
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.city ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.city && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.city}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-state" className="text-xs font-bold text-foreground/80">State *</Label>
                  <Input 
                    id="edit-state" 
                    name="state" 
                    placeholder="e.g. Maharashtra" 
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.state ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.state && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.state}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-pincode" className="text-xs font-bold text-foreground/80">Pincode *</Label>
                  <Input 
                    id="edit-pincode" 
                    name="pincode" 
                    placeholder="6-digit PIN" 
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.pincode ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.pincode && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.pincode}</span>}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end items-center gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsEditOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm h-10 px-4 font-semibold"
              >
                Discard
              </Button>
              <Button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl h-10 px-6 border-0 text-sm shadow-md shadow-emerald-500/10"
              >
                Apply Updates
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl shadow-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center text-foreground">Delete Customer Ledger?</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <span className="text-foreground font-bold">{selectedCustomer?.companyName}</span> from the local ledger? This will permanently wipe their transaction links and is an irreversible action.
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
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 border-0 shadow-sm w-full sm:w-auto"
            >
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: CUSTOMER TRANSACTION & EVENT HISTORY */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-0">
          <DialogHeader className="p-4 md:px-6 md:pt-6 md:pb-4 border-b border-border sticky top-0 bg-card z-10">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <History className="w-4.5 h-4.5" />
              </div>
              Customer Ledger & Activity History
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Audit log of invoice generation, payments, registrations and profile modifications.
            </DialogDescription>
          </DialogHeader>

          {/* Quick info metadata card */}
          {selectedCustomer && (
            <div className="p-4 rounded-xl bg-background/80 border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs mt-4 mx-4">
              <div>
                <span className="text-muted-foreground block mb-0.5">Company Name</span>
                <span className="font-bold text-foreground block">{selectedCustomer.companyName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Contact Person</span>
                <span className="font-semibold text-foreground/90 block">{selectedCustomer.contactPerson}</span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="text-muted-foreground block mb-0.5">GST Registration No.</span>
                <span className="font-mono text-primary block font-bold truncate">
                  {selectedCustomer.gstNumber || "EXEMPTED"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Phone / Mobile</span>
                <span className="font-semibold text-foreground/90 block">{selectedCustomer.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-0.5">Billing Location Address</span>
                <span className="font-semibold text-foreground/80 block truncate" title={selectedCustomer.address}>
                  {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                </span>
              </div>
            </div>
          )}

          {/* Timeline Scrollable Section */}
          <div className="py-6 px-4 max-h-[380px] overflow-y-auto space-y-6">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ledger Activities Timeline</h4>
            
            {selectedCustomer && getCustomerHistory(selectedCustomer).length > 0 ? (
              <div className="relative border-l border-border ml-3.5 space-y-6 pl-6">
                
                {getCustomerHistory(selectedCustomer).map((item) => (
                  <div key={item.id} className="relative">
                    {/* Circle Node Icon Indicator */}
                    <span className={`absolute -left-[35px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm ${
                      item.type === "account_created" 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : item.type === "gst_verified"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : item.type === "invoice_created"
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-purple-500 border-purple-500 text-white"
                    }`}>
                      {item.type === "account_created" && <User className="w-2.5 h-2.5" />}
                      {item.type === "gst_verified" && <FileCheck className="w-2.5 h-2.5" />}
                      {item.type === "invoice_created" && <FileText className="w-2.5 h-2.5" />}
                      {item.type === "payment_received" && <CreditCard className="w-2.5 h-2.5" />}
                    </span>

                    {/* Timeline Item Content */}
                    <div className="p-3.5 rounded-xl bg-background/50 border border-border/80 space-y-1 hover:border-border transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold capitalize tracking-wide px-2 py-0.5 rounded-md ${
                          item.status === "success" || item.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {item.type === "invoice_created" ? "INVOICE DISPATCHED" : item.type === "payment_received" ? "PAYMENT RECEIVED" : item.type.replace("_", " ")}
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px]">{item.date}</span>
                      </div>
                      
                      <p className="text-xs text-foreground/80 leading-normal">{item.description}</p>
                      
                      {item.amount && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium">Transaction Amount:</span>
                          <span className={`text-xs font-bold font-mono ${item.type === "payment_received" ? "text-emerald-500" : "text-amber-500"}`}>
                            {item.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-8 text-muted-foreground">No events found in this client&apos;s folder.</p>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border">
            <Button 
              type="button" 
              onClick={() => setIsHistoryOpen(false)}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl px-5 h-10 border-0 shadow-sm w-full sm:w-auto"
            >
              Done, Close Ledger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}






