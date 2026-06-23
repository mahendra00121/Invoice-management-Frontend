"use client"
// Trigger rebuild
import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Menu,
  Sun,
  Moon,
  Package,
  Layers,
  IndianRupee,
  AlertTriangle,
  Tag,
  Hash,
  Scale,
  LayoutGrid,
  List,
  Monitor,
  Paperclip,
  Briefcase,
  Wrench,
  Box,
  ShoppingBag
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

// Interfaces
interface Product {
  id: number | string;
  productName: string;
  categoryName: number | string; // Category Name
  hsnCode: string;
  barcode?: string;
  unitPrice: number;
  gstPercent: number; // e.g. 18
  stockQuantity: number;
  unit: string; // e.g. Pcs, Kgs, Ltr, Mtr, Box, Hrs
  description: string;
  createdAt: string;
}

// Initial seed data
const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    productName: "HP ProBook 450 G10 Laptop",
    categoryName: "Electronics",
    hsnCode: "84713010",
    barcode: "890123456789",
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
  },
  {
    id: 3,
    productName: "Premium Ergonomic Office Chair",
    categoryName: "Office Supplies",
    hsnCode: "94033000",
    unitPrice: 8500.00,
    gstPercent: 12,
    stockQuantity: 8,
    unit: "Pcs",
    description: "High back mesh executive chair with multi-level adjustable armrests and lumbar support.",
    createdAt: "2026-05-15T15:10:00.000Z"
  },
  {
    id: 4,
    productName: "Software Architecture Consulting Service",
    categoryName: "Services",
    hsnCode: "99831100",
    unitPrice: 4500.00,
    gstPercent: 18,
    stockQuantity: 100,
    unit: "Hrs",
    description: "Enterprise grade cloud solution design, cost optimization, and review services.",
    createdAt: "2026-05-20T10:00:00.000Z"
  }
];

// Available Product Categories
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Raw Materials",
  "Office Supplies",
  "Services",
  "Machinery",
  "Packaging",
  "Finished Goods",
  "Others"
];

// Available GST Percentages
const GST_PERCENTAGES = [0, 5, 12, 18, 28];

// Available Measurement Units
const MEASUREMENT_UNITS = ["Pcs", "Kgs", "Ltr", "Mtr", "Box", "Hrs", "Bag", "Set"];

const getCategoryStyling = (cat: string) => {
  switch (cat) {
    case "Electronics": return { bg: "bg-blue-500/10 border-blue-500/20 text-blue-500", icon: Monitor };
    case "Raw Materials": return { bg: "bg-amber-500/10 border-amber-500/20 text-amber-500", icon: Layers };
    case "Office Supplies": return { bg: "bg-purple-500/10 border-purple-500/20 text-purple-500", icon: Paperclip };
    case "Services": return { bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500", icon: Briefcase };
    case "Machinery": return { bg: "bg-rose-500/10 border-rose-500/20 text-rose-500", icon: Wrench };
    case "Packaging": return { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", icon: Box };
    default: return { bg: "bg-primary/10 border-primary/20 text-primary", icon: Package };
  }
}

export default function ProductsPage() {
  // Main states
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await api.products.getAll()
      setProducts(data)
    } catch (e) {
      console.error(e)
      toast.error("Failed to fetch products")
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
      fetchProducts()
    }
  }, [mounted])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  
  // Theme state: default to 'light'
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

  // Selected Product State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    productName: "",
    categoryName: "Electronics",
    hsnCode: "",
    barcode: "",
    unitPrice: "",
    gstPercent: "18",
    stockQuantity: "",
    unit: "Pcs",
    description: ""
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
    const handleCreateProduct = () => setIsAddOpen(true);
    window.addEventListener('BOT_ACTION_CREATE_PRODUCT', handleCreateProduct);
    return () => window.removeEventListener('BOT_ACTION_CREATE_PRODUCT', handleCreateProduct);
  }, []);

  // Handle Form Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    if (!formData.productName.trim()) errors.productName = "Product Name is required"
    if (!formData.categoryName.trim()) errors.categoryName = "Category is required"
    
    // HSN Code validation (Standard Indian HSN: 2 to 8 digits)
    const hsnRegex = /^[0-9]{2,8}$/
    if (!formData.hsnCode.trim()) {
      errors.hsnCode = "HSN/SAC Code is required"
    } else if (!hsnRegex.test(formData.hsnCode.trim())) {
      errors.hsnCode = "HSN Code must be 2 to 8 digits"
    }

    // Unit Price validation
    const price = parseFloat(formData.unitPrice)
    if (!formData.unitPrice.trim()) {
      errors.unitPrice = "Unit Price is required"
    } else if (isNaN(price) || price < 0) {
      errors.unitPrice = "Price must be a positive number"
    }

    // Stock Quantity validation
    const stock = parseInt(formData.stockQuantity)
    if (!formData.stockQuantity.trim()) {
      errors.stockQuantity = "Stock Quantity is required"
    } else if (isNaN(stock) || stock < 0) {
      errors.stockQuantity = "Stock must be a non-negative integer"
    }

    if (!formData.unit.trim()) errors.unit = "Unit of measurement is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open Add Dialog
  const handleOpenAdd = () => {
    setFormData({
      productName: "",
      categoryName: "Electronics",
      hsnCode: "",
      barcode: "",
      unitPrice: "",
      gstPercent: "18",
      stockQuantity: "",
      unit: "Pcs",
      description: ""
    })
    setFormErrors({})
    setIsAddOpen(true)
  }

  // Submit Add Product
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.")
      return
    }

    const payload = {
      productName: formData.productName.trim(),
      categoryName: formData.categoryName,
      hsnCode: formData.hsnCode.trim(),
      barcode: formData.barcode?.trim() || "",
      unitPrice: parseFloat(formData.unitPrice),
      gstPercent: parseInt(formData.gstPercent),
      stockQuantity: parseInt(formData.stockQuantity),
      unit: formData.unit,
      description: formData.description.trim()
    }

    try {
      await api.products.create(payload)
      setIsAddOpen(false)
      toast.success(`${payload.productName} added successfully!`)
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message || "Failed to add product")
    }
  }

  // Open Edit Dialog
  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      productName: product.productName,
      categoryName: String(product.categoryName),
      hsnCode: product.hsnCode,
      barcode: product.barcode || "",
      unitPrice: product.unitPrice.toString(),
      gstPercent: product.gstPercent.toString(),
      stockQuantity: product.stockQuantity.toString(),
      unit: product.unit,
      description: product.description
    })
    setFormErrors({})
    setIsEditOpen(true)
  }

  // Submit Edit Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.")
      return
    }

    const payload = {
      productName: formData.productName.trim(),
      categoryName: formData.categoryName,
      hsnCode: formData.hsnCode.trim(),
      barcode: formData.barcode?.trim() || "",
      unitPrice: parseFloat(formData.unitPrice),
      gstPercent: parseInt(formData.gstPercent),
      stockQuantity: parseInt(formData.stockQuantity),
      unit: formData.unit,
      description: formData.description.trim()
    }

    try {
      await api.products.update(selectedProduct.id, payload)
      setIsEditOpen(false)
      toast.success(`${payload.productName} updated successfully!`)
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message || "Failed to update product")
    }
  }

  // Open Delete Dialog
  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  // Confirm Delete Product
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    try {
      await api.products.delete(selectedProduct.id)
      setIsDeleteOpen(false)
      toast.success(`${selectedProduct.productName} deleted successfully!`)
      setSelectedProduct(null)
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product")
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase()
    return (
      product.productName.toLowerCase().includes(query) ||
      String(product.categoryName).toLowerCase().includes(query) ||
      product.hsnCode.includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  })

  // Statistics Computations
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.unitPrice), 0)
  const lowStockCount = products.filter(p => p.stockQuantity < 10).length

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Package className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Initializing inventory system...</p>
          <p className="text-xs text-muted-foreground">Syncing tax-compliant goods ledger</p>
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
                Product Inventory
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Configure your service catalogue, wholesale items, HSN tax classifications, dynamic category tags and base price logs.
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
            
            {userPermissions.includes("Products.CRUD") && (
              <Button 
                onClick={handleOpenAdd}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl border-0 h-10 px-3 md:px-4 transition-all shadow-md shadow-primary/10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> <span className="hidden md:inline">Add Product</span>
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Key Inventory Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Stat 1: Total Products */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Products</span>
                  <span className="text-2xl font-black text-foreground tracking-tight block">{products.length} Items</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2: Total Inventory Value */}
            <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Stock Valuation</span>
                  <span className="text-2xl font-black text-foreground tracking-tight block">
                    ₹{totalInventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 3: Low Stock Warnings */}
            <Card className={`bg-card border-border hover:border-primary/20 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${lowStockCount > 0 ? "border-amber-500/30" : ""}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Low Stock Alerts</span>
                  <span className={`text-2xl font-black tracking-tight block ${lowStockCount > 0 ? "text-amber-500" : "text-foreground"}`}>
                    {lowStockCount} Products
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? "bg-amber-500/10 border border-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-5 rounded-2xl border border-border">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search by Product Name, HSN Code, Category or details..." 
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

            {/* Total count and View Toggle */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
              <div className="hidden sm:flex items-center gap-4">
                <div>
                  Total: <span className="text-foreground font-bold">{products.length}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                <div>
                  Matches: <span className="text-primary font-bold">{filteredProducts.length}</span>
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
            /* Product Ledger Table */
            <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 border-b border-border h-14">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="text-foreground font-semibold px-6 w-[250px]">Product Name</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Category</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">HSN / SAC</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Unit Price</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">GST %</TableHead>
                        <TableHead className="text-foreground font-semibold px-6">Stock Level</TableHead>
                        {userPermissions.includes("Products.CRUD") && (
                          <TableHead className="text-foreground font-semibold text-right px-6">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow 
                            key={product.id} 
                            className="border-b border-border/60 hover:bg-muted/30 transition-colors h-16 group"
                          >
                            {/* Product Details */}
                            <TableCell className="px-6 font-semibold text-foreground">
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const { bg, icon: CatIcon } = getCategoryStyling(String(product.categoryName));
                                  return (
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${bg}`}>
                                      <CatIcon className="w-4 h-4" />
                                    </div>
                                  )
                                })()}
                                <div className="truncate max-w-[200px]">
                                  <span className="block truncate hover:text-primary transition-colors">{product.productName}</span>
                                  <span className="block text-[10px] font-normal text-muted-foreground truncate">{product.description || "No description provided"}</span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Category Tag */}
                            <TableCell className="px-6 text-foreground">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted border border-border text-foreground/80">
                                <Tag className="w-3 h-3 text-primary/70 shrink-0" />
                                {product.categoryName}
                              </span>
                            </TableCell>

                            {/* HSN Code */}
                            <TableCell className="px-6 text-foreground font-mono text-xs">
                              <span className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold tracking-wider">
                                {product.hsnCode}
                              </span>
                            </TableCell>

                            {/* Unit Price */}
                            <TableCell className="px-6 text-foreground font-semibold font-mono text-sm">
                              ₹{product.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>

                            {/* GST Rate */}
                            <TableCell className="px-6 text-foreground font-extrabold font-mono text-xs text-primary/95">
                              {product.gstPercent}% GST
                            </TableCell>

                            {/* Stock Quantity / Level */}
                            <TableCell className="px-6 text-foreground">
                              <div className="flex flex-col gap-1.5 items-start w-full">
                                <span className="text-sm font-bold font-mono text-foreground">
                                  {product.stockQuantity} {product.unit}
                                </span>
                                
                                {/* Stock Mini Progress Bar */}
                                <div className="w-24 h-1 bg-muted rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      product.stockQuantity === 0 ? 'w-full bg-red-500/50' : 
                                      product.stockQuantity <= 10 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'
                                    }`} 
                                    style={{ width: product.stockQuantity === 0 ? '100%' : `${Math.min(100, product.stockQuantity * 2)}%` }}
                                  ></div>
                                </div>

                                {product.stockQuantity === 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                    <AlertTriangle className="w-3 h-3" /> Out of Stock
                                  </span>
                                ) : product.stockQuantity <= 10 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" /> Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            {userPermissions.includes("Products.CRUD") && (
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Button */}
                                  <Button 
                                    onClick={() => handleOpenEdit(product)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                    title="Edit Product Details"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>

                                  {/* Delete Button */}
                                  <Button 
                                    onClick={() => handleOpenDelete(product)}
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={7} className="h-[400px]">
                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Package className="w-10 h-10 text-primary opacity-80" />
                              </div>
                              <h3 className="text-xl font-black text-foreground mb-2">No Products Found</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                There are no products matching your filters. Try tweaking your search or add a new product to your catalogue.
                              </p>
                              <Button onClick={handleOpenAdd} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Product
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
            /* Product Ledger Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col group overflow-hidden relative">
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        {(() => {
                          const { bg, icon: CatIcon } = getCategoryStyling(String(product.categoryName));
                          return (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${bg}`}>
                              <CatIcon className="w-5 h-5" />
                            </div>
                          )
                        })()}
                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted border border-border text-foreground/80">
                            <Tag className="w-3 h-3 text-primary/70 shrink-0" />
                            {product.categoryName}
                          </span>
                          <span className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold tracking-wider text-[10px] font-mono">
                            HSN: {product.hsnCode}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <h3 className="text-base font-extrabold text-foreground leading-tight line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                          {product.productName}
                        </h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {product.description || "No description provided."}
                        </p>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 mb-4 space-y-3">
                        <div className="flex items-end justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Price</span>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-black text-foreground font-mono leading-none">
                              ₹{product.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-bold text-primary/80 mt-1">+{product.gstPercent}% GST</span>
                          </div>
                        </div>
                        
                        <div className="h-px w-full bg-border/50"></div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Stock Level</span>
                          {product.stockQuantity === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" /> 0 {product.unit}
                            </span>
                          ) : product.stockQuantity <= 10 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" /> {product.stockQuantity} {product.unit}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {product.stockQuantity} {product.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {userPermissions.includes("Products.CRUD") && (
                        <div className="flex gap-2 mt-auto">
                          <Button 
                            onClick={() => handleOpenEdit(product)}
                            variant="outline" 
                            className="flex-1 h-9 bg-background border-border text-xs font-bold hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                          </Button>
                          <Button 
                            onClick={() => handleOpenDelete(product)}
                            variant="outline" 
                            className="h-9 w-9 p-0 bg-background border-border text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full h-[400px]">
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">No Products Found</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      There are no products matching your filters. Try tweaking your search or add a new product to your catalogue.
                    </p>
                    <Button onClick={handleOpenAdd} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* DIALOG 1: ADD PRODUCT MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <form onSubmit={handleAddSubmit}>
            <div className="px-6 py-5 border-b border-border bg-muted/10">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Register New Product</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Provide detailed catalog profiling, pricing structure, HSN classification, and stock metrics.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Spacious Form Body - 2 Column Grid */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="productName" className="text-xs font-bold text-foreground/80">Product Name *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="productName" 
                    name="productName" 
                    placeholder="e.g. Ultra-Grade Stainless Rods" 
                    value={formData.productName}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.productName ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.productName && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.productName}</span>}
              </div>

              {/* Category Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="categoryName" className="text-xs font-bold text-foreground/80">Category *</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 z-10" />
                  <Select value={formData.categoryName} onValueChange={(val) => handleInputChange({ target: { name: 'categoryName', value: val } } as any)}>
                    <SelectTrigger className="pl-10 pr-4 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* HSN Code */}
              <div className="space-y-1.5">
                <Label htmlFor="hsnCode" className="text-xs font-bold text-foreground/80">HSN / SAC Code *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="hsnCode" 
                    name="hsnCode" 
                    placeholder="e.g. 84713010" 
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.hsnCode ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.hsnCode && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.hsnCode}</span>}
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <Label htmlFor="barcode" className="text-xs font-bold text-foreground/80">Barcode / SKU (Optional)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="barcode" 
                    name="barcode" 
                    placeholder="Scan or type barcode" 
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all"
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice" className="text-xs font-bold text-foreground/80">Unit Price (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="unitPrice" 
                    name="unitPrice" 
                    placeholder="e.g. 2400.00" 
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.unitPrice ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.unitPrice && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.unitPrice}</span>}
              </div>

              {/* GST Percent Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="gstPercent" className="text-xs font-bold text-foreground/80">GST Rate (%) *</Label>
                <Select value={formData.gstPercent} onValueChange={(val) => handleInputChange({ target: { name: 'gstPercent', value: val } } as any)}>
                  <SelectTrigger className="px-3.5 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                    <SelectValue placeholder="Select GST Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_PERCENTAGES.map(gst => (
                      <SelectItem key={gst} value={gst.toString()}>{gst}% GST</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="stockQuantity" className="text-xs font-bold text-foreground/80">Stock Quantity *</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="stockQuantity" 
                    name="stockQuantity" 
                    placeholder="e.g. 150" 
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.stockQuantity ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.stockQuantity && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.stockQuantity}</span>}
              </div>

              {/* Unit of Measurement Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-bold text-foreground/80">Unit of Measurement *</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 z-10" />
                  <Select value={formData.unit} onValueChange={(val) => handleInputChange({ target: { name: 'unit', value: val } } as any)}>
                    <SelectTrigger className="pl-10 pr-4 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="description" className="text-xs font-bold text-foreground/80">Description / Technical Specifications (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Provide unique product parameters, dimension, grade, or notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl p-3 w-full text-sm transition-all outline-none resize-none text-foreground"
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/10 border-t border-border mt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl px-5 border-0 shadow-sm"
              >
                Register Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT PRODUCT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <form onSubmit={handleEditSubmit}>
            <div className="px-6 py-5 border-b border-border bg-muted/10">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Update Product Ledger Details</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update wholesale prices, tax classifications, dynamic stock levels, or dimensions.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Spacious Form Body - 2 Column Grid */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-productName" className="text-xs font-bold text-foreground/80">Product Name *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-productName" 
                    name="productName" 
                    placeholder="e.g. Ultra-Grade Stainless Rods" 
                    value={formData.productName}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.productName ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.productName && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.productName}</span>}
              </div>

              {/* Category Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-categoryName" className="text-xs font-bold text-foreground/80">Category *</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 z-10" />
                  <Select value={formData.categoryName} onValueChange={(val) => handleInputChange({ target: { name: 'categoryName', value: val } } as any)}>
                    <SelectTrigger className="pl-10 pr-4 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* HSN Code */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-hsnCode" className="text-xs font-bold text-foreground/80">HSN / SAC Code *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-hsnCode" 
                    name="hsnCode" 
                    placeholder="e.g. 84713010" 
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.hsnCode ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.hsnCode && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.hsnCode}</span>}
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-barcode" className="text-xs font-bold text-foreground/80">Barcode / SKU (Optional)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-barcode" 
                    name="barcode" 
                    placeholder="Scan or type barcode" 
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all"
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-unitPrice" className="text-xs font-bold text-foreground/80">Unit Price (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-unitPrice" 
                    name="unitPrice" 
                    placeholder="e.g. 2400.00" 
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.unitPrice ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.unitPrice && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.unitPrice}</span>}
              </div>

              {/* GST Percent Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-gstPercent" className="text-xs font-bold text-foreground/80">GST Rate (%) *</Label>
                <Select value={formData.gstPercent} onValueChange={(val) => handleInputChange({ target: { name: 'gstPercent', value: val } } as any)}>
                  <SelectTrigger className="px-3.5 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                    <SelectValue placeholder="Select GST Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_PERCENTAGES.map(gst => (
                      <SelectItem key={gst} value={gst.toString()}>{gst}% GST</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-stockQuantity" className="text-xs font-bold text-foreground/80">Stock Quantity *</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input 
                    id="edit-stockQuantity" 
                    name="stockQuantity" 
                    placeholder="e.g. 150" 
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className={`pl-10 bg-background border-border hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 w-full text-sm transition-all ${formErrors.stockQuantity ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                {formErrors.stockQuantity && <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{formErrors.stockQuantity}</span>}
              </div>

              {/* Unit of Measurement Dropdown Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-unit" className="text-xs font-bold text-foreground/80">Unit of Measurement *</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 z-10" />
                  <Select value={formData.unit} onValueChange={(val) => handleInputChange({ target: { name: 'unit', value: val } } as any)}>
                    <SelectTrigger className="pl-10 pr-4 bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl h-10 w-full text-sm outline-none text-foreground">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-description" className="text-xs font-bold text-foreground/80">Description / Technical Specifications (Optional)</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  placeholder="Provide unique product parameters, dimension, grade, or notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-background border border-border hover:border-border/80 focus:ring-1 focus:ring-primary rounded-xl p-3 w-full text-sm transition-all outline-none resize-none text-foreground"
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/10 border-t border-border mt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsEditOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl px-5 border-0 shadow-sm"
              >
                Save Updates
              </Button>
            </DialogFooter>
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
            <DialogTitle className="text-lg font-bold text-center text-foreground">Delete Product Item?</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <span className="text-foreground font-bold">{selectedProduct?.productName}</span> from your ledger inventory? This action is irreversible.
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

    </div>
  )
}






