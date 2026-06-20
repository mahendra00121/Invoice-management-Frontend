"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Settings as SettingsIcon,
  Building,
  CreditCard,
  Palette,
  Save,
  Menu,
  Moon,
  Sun,
  ShieldCheck,
  Download
} from "lucide-react"

import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("company")
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Settings State
  const [companyName, setCompanyName] = useState("Acme Corp Ltd.")
  const [taxId, setTaxId] = useState("27AADCB2230M1Z2")
  const [address, setAddress] = useState("123 Business Avenue, Tech Park")
  const [contactEmail, setContactEmail] = useState("billing@acmecorp.com")
  
  const [currency, setCurrency] = useState("INR")
  const [invoicePrefix, setInvoicePrefix] = useState("INV-")
  const [paymentTerms, setPaymentTerms] = useState("Net 15")

  const [companyLogo, setCompanyLogo] = useState("")
  const [authorizedSignature, setAuthorizedSignature] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankIfscCode, setBankIfscCode] = useState("")
  const [upiId, setUpiId] = useState("")

  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [sidebarColor, setSidebarColor] = useState<string>("#ffffff")

  useEffect(() => {
    // Load settings from local storage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("invoice_management_theme") as "light" | "dark" | null
      if (savedTheme) setTheme(savedTheme)

      const savedSidebarColor = localStorage.getItem("sidebar_color")
      if (savedSidebarColor) setSidebarColor(savedSidebarColor)

      api.settings.get().then((parsed: any) => {
        if (parsed) {
          if (parsed.companyName) setCompanyName(parsed.companyName)
          if (parsed.taxId) setTaxId(parsed.taxId)
          if (parsed.address) setAddress(parsed.address)
          if (parsed.contactEmail) setContactEmail(parsed.contactEmail)
          if (parsed.currency) setCurrency(parsed.currency)
          if (parsed.invoicePrefix) setInvoicePrefix(parsed.invoicePrefix)
          if (parsed.paymentTerms) setPaymentTerms(parsed.paymentTerms)
          if (parsed.companyLogo !== undefined) setCompanyLogo(parsed.companyLogo)
          if (parsed.authorizedSignature !== undefined) setAuthorizedSignature(parsed.authorizedSignature)
          if (parsed.bankName !== undefined) setBankName(parsed.bankName)
          if (parsed.bankAccountNumber !== undefined) setBankAccountNumber(parsed.bankAccountNumber)
          if (parsed.bankIfscCode !== undefined) setBankIfscCode(parsed.bankIfscCode)
          if (parsed.upiId !== undefined) setUpiId(parsed.upiId)
        }
      }).catch(err => {
        console.warn("Failed to load settings from backend", err)
      })
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const root = window.document.documentElement
      if (theme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
      localStorage.setItem("invoice_management_theme", theme)

      const settingsObj = {
        companyName, taxId, address, contactEmail, currency, invoicePrefix, paymentTerms, companyLogo, authorizedSignature, bankName, bankAccountNumber, bankIfscCode, upiId
      }
      
      await api.settings.update(settingsObj)

      toast.success("Settings Saved Successfully", {
        description: "Your workspace preferences have been updated in the database."
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSidebarColorChange = (color: string) => {
    setSidebarColor(color)
    localStorage.setItem("sidebar_color", color)
    window.dispatchEvent(new Event("sidebar_color_changed"))
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const [customers, products, invoices, quotations, payments, settings] = await Promise.all([
        api.customers.getAll().catch(() => []),
        api.products.getAll().catch(() => []),
        api.invoices.getAll().catch(() => []),
        api.quotations.getAll().catch(() => []),
        api.payments.getAll().catch(() => []),
        api.settings.get().catch(() => null)
      ])

      // Dynamically import jsPDF to prevent SSR issues
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(30, 41, 59)
      doc.text("Business Data Snapshot", 14, 20)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)

      // Divider
      doc.setDrawColor(226, 232, 240)
      doc.line(14, 32, 196, 32)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42)
      doc.text("Company Profile", 14, 45)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(71, 85, 105)
      doc.text(`Business Name: ${settings?.companyName || companyName}`, 14, 53)
      doc.text(`Tax ID / GSTIN: ${settings?.taxId || taxId}`, 14, 60)
      doc.text(`Contact Email: ${settings?.contactEmail || contactEmail}`, 14, 67)

      // Divider
      doc.setDrawColor(226, 232, 240)
      doc.line(14, 75, 196, 75)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42)
      doc.text("Database Records Overview", 14, 88)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      
      const records = [
        { name: "Customers Directory", count: customers.length },
        { name: "Products & Services", count: products.length },
        { name: "Generated Invoices", count: invoices.length },
        { name: "Sales Quotations", count: quotations.length },
        { name: "Payment Receipts", count: payments.length }
      ]

      let yPos = 98
      records.forEach(rec => {
        doc.setTextColor(71, 85, 105)
        doc.text(rec.name, 14, yPos)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(15, 23, 42)
        doc.text(rec.count.toString(), 100, yPos)
        doc.setFont("helvetica", "normal")
        yPos += 8
      })

      // Footer
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text("This is an automatically generated system snapshot PDF. Keep it secure.", 105, 280, { align: "center" })

      doc.save(`Business_Snapshot_${new Date().toISOString().split("T")[0]}.pdf`)

      toast.success("PDF Snapshot Downloaded Successfully", {
        description: "Your business summary has been exported as a PDF file."
      })
    } catch (err: any) {
      toast.error("Failed to export PDF: " + (err.message || "Unknown error"))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 shrink-0 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Workspace Settings
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                Configure your business profile & preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs h-10 px-3 md:px-6 rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              <Save className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> 
              <span className="hidden md:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
            
            <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 pb-8 md:pb-0 relative">
              <div className="mb-4 px-2 hidden md:block">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Settings Menu</h3>
              </div>
              
              <button
                onClick={() => setActiveTab("company")}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  activeTab === "company" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "bg-transparent text-foreground hover:bg-muted/80"
                }`}
              >
                <Building className={`w-5 h-5 ${activeTab === "company" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                Company Profile
                {activeTab === "company" && <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>
              
              <button
                onClick={() => setActiveTab("preferences")}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  activeTab === "preferences" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "bg-transparent text-foreground hover:bg-muted/80"
                }`}
              >
                <CreditCard className={`w-5 h-5 ${activeTab === "preferences" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                Preferences & Billing
                {activeTab === "preferences" && <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  activeTab === "appearance" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "bg-transparent text-foreground hover:bg-muted/80"
                }`}
              >
                <Palette className={`w-5 h-5 ${activeTab === "appearance" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                Workspace Appearance
                {activeTab === "appearance" && <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab("data")}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  activeTab === "data" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "bg-transparent text-foreground hover:bg-muted/80"
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${activeTab === "data" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                Data & Security
                {activeTab === "data" && <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              
              {activeTab === "company" && (
                <>
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-foreground">Brand Identity</h2>
                        <p className="text-sm text-muted-foreground mt-1">Configure your official company logo and signature for documents.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Company Logo</Label>
                        <div className="relative group rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-transparent hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center p-6 h-48 cursor-pointer">
                          {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                <Building className="w-6 h-6" />
                              </div>
                              <span className="text-sm font-bold text-foreground">Click to upload logo</span>
                              <span className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setCompanyLogo(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}/>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Digital Signature</Label>
                        <div className="relative group rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 bg-transparent hover:bg-emerald-500/5 transition-all duration-300 flex flex-col items-center justify-center p-6 h-48 cursor-pointer">
                          {authorizedSignature ? (
                            <img src={authorizedSignature} alt="Signature" className="max-w-full max-h-full object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              </div>
                              <span className="text-sm font-bold text-foreground">Upload signature</span>
                              <span className="text-xs text-muted-foreground">Transparent PNG recommended</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setAuthorizedSignature(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-black text-foreground mb-6">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Business Name</Label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-12 rounded-xl text-sm font-bold bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Tax ID / GSTIN</Label>
                        <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="h-12 rounded-xl text-sm font-bold font-mono bg-transparent border-border focus:bg-background transition-colors uppercase" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Registered Address</Label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-12 rounded-xl text-sm font-bold bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Contact Email</Label>
                        <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="h-12 rounded-xl text-sm font-bold bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <h2 className="text-2xl font-black text-foreground mb-1">Financial Defaults</h2>
                    <p className="text-sm text-muted-foreground mb-8">Set defaults for new invoices and document formatting.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Default Currency</Label>
                        <div className="relative">
                          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-transparent focus:bg-background text-sm font-bold appearance-none transition-colors">
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Invoice Prefix</Label>
                        <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="h-12 rounded-xl text-sm font-bold font-mono bg-transparent border-border focus:bg-background transition-colors uppercase" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Default Payment Terms</Label>
                        <div className="relative">
                          <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-transparent focus:bg-background text-sm font-bold appearance-none transition-colors">
                            <option value="Due on Receipt">Due on Receipt (Immediate)</option>
                            <option value="Net 15">Net 15 Days</option>
                            <option value="Net 30">Net 30 Days</option>
                            <option value="Net 60">Net 60 Days</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-black text-foreground mb-6">Banking & UPI Setup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Bank Name</Label>
                        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" className="h-12 rounded-xl text-sm font-bold bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Account Number</Label>
                        <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="50100200300400" className="h-12 rounded-xl text-sm font-bold font-mono tracking-widest bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">IFSC Code</Label>
                        <Input value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} placeholder="HDFC0001234" className="h-12 rounded-xl text-sm font-bold font-mono uppercase bg-transparent border-border focus:bg-background transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">UPI ID (VPA)</Label>
                        <div className="relative">
                          <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@bank" className="h-12 rounded-xl text-sm font-bold bg-transparent border-border focus:bg-background transition-colors pl-10" />
                          <svg className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "appearance" && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                  <h2 className="text-2xl font-black text-foreground mb-1">Visual Theme</h2>
                  <p className="text-sm text-muted-foreground mb-8">Personalize your workspace layout and colors.</p>
                  
                  <div className="grid grid-cols-2 gap-6 max-w-lg">
                    <button onClick={() => setTheme("light")} className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${theme === "light" ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-105" : "border-border bg-muted/20 hover:bg-muted"}`}>
                      {theme === "light" && <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 shadow-inner flex items-center justify-center">
                        <Sun className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <span className="text-base font-black">Light Mode</span>
                    </button>

                    <button onClick={() => setTheme("dark")} className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${theme === "dark" ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-105" : "border-border bg-muted/20 hover:bg-muted"}`}>
                      {theme === "dark" && <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner flex items-center justify-center border border-slate-600">
                        <Moon className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <span className="text-base font-black">Dark Mode</span>
                    </button>
                  </div>

                  <div className="mt-8 border-t border-border pt-8">
                    <h3 className="text-xl font-black text-foreground mb-6">Sidebar Appearance</h3>
                    <div className="flex items-center gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest">Sidebar Background Color</Label>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/20 w-fit">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border cursor-pointer shadow-sm">
                            <input 
                              type="color" 
                              value={sidebarColor} 
                              onChange={(e) => handleSidebarColorChange(e.target.value)}
                              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                              title="Choose Sidebar Color"
                            />
                          </div>
                          <span className="text-sm font-bold text-muted-foreground font-mono uppercase bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">{sidebarColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
                  <h2 className="text-2xl font-black text-foreground mb-1">Data & Privacy</h2>
                  <p className="text-sm text-muted-foreground mb-8">Export your financial records or manage account security.</p>
                  
                  <div className="p-8 rounded-3xl border border-border bg-gradient-to-br from-muted/30 to-background flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Download className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-foreground">Export Vault</h3>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        Download a complete PDF summary snapshot of all your databases including counts of Customers, Invoices, Quotations, and Settings.
                      </p>
                    </div>
                    <Button onClick={handleExportData} disabled={isExporting} className="bg-foreground hover:bg-foreground/90 text-background font-black rounded-2xl h-14 px-8 shadow-xl shadow-foreground/20 w-full md:w-auto transition-transform active:scale-95">
                      {isExporting ? "Archiving Data..." : "Download Snapshot"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
