"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Package, 
  FileText, 
  FileCheck, 
  Coins, 
  X, 
  LogOut,
  Settings as SettingsIcon,
  LayoutDashboard,
  BarChart,
  ShieldCheck,
  Search,
  Zap,
  Sparkles,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { initSyncEngine } from "@/lib/sync"

interface UserProfile {
  email: string;
  name: string;
  token: string;
  role?: string;
  permissions?: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState("")
  const [sidebarColor, setSidebarColor] = useState<string>("")

  useEffect(() => {
    // Auto-close sidebar on mobile devices when component mounts
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false)
    }

    if (typeof window !== "undefined") {
      // Boot up database synchronization hooks
      initSyncEngine()

      const user = localStorage.getItem("invoice_management_user")
      if (!user) {
        window.location.href = "/login"
        return
      }
      try {
        const parsed = JSON.parse(user)
        requestAnimationFrame(() => {
          setCurrentUser(parsed)
        })
      } catch (e) {
        console.error(e)
      }

      // Load custom sidebar color
      const savedColor = localStorage.getItem("sidebar_color")
      if (savedColor) {
        setSidebarColor(savedColor)
      }

      const handleLocalColorChange = () => {
         const clr = localStorage.getItem("sidebar_color");
         if (clr) setSidebarColor(clr);
      }
      window.addEventListener("sidebar_color_changed", handleLocalColorChange)
    }

    // Set up Ctrl+K / Cmd+K listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("invoice_management_user")
    toast.success("Successfully logged out!")
    window.location.href = "/login"
  }

  const handleColorChange = (color: string) => {
    setSidebarColor(color)
    localStorage.setItem("sidebar_color", color)
  }

  const hasPermission = (requiredPerms: string[]) => {
    if (!currentUser || !currentUser.permissions) return true // Fallback or super admin
    if (currentUser.role === "Super Admin" || currentUser.role === "Administrator") return true
    
    const userPerms = currentUser.permissions.split(",")
    return requiredPerms.some(p => userPerms.includes(p))
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard, category: "Core Navigation", perms: ["Dashboard.Full", "Dashboard.Limited", "Dashboard.View"] },
    { href: "/customers", label: "Customer Management", icon: Users, category: "Business Desk", perms: ["Customers.CRUD", "Customers.View"] },
    { href: "/products", label: "Product Management", icon: Package, category: "Business Desk", perms: ["Products.CRUD", "Products.View"] },
    { href: "/quotations", label: "Quotation Management", icon: FileText, category: "Business Desk", perms: ["Quotations.CRUD", "Quotations.Approve", "Quotations.View"] },
    { href: "/invoices", label: "Invoice Management", icon: FileCheck, category: "Business Desk", perms: ["Invoices.CRUD", "Invoices.View"] },
    { href: "/payments", label: "Payment Management", icon: Coins, category: "Business Desk", perms: ["Payments.CRUD", "Payments.View"] },
    { href: "/reports", label: "Business Reports", icon: BarChart, category: "Analytics", perms: ["Reports.Full", "Reports.View"] },
    { href: "/users", label: "User Management", icon: Users, category: "Administration", perms: ["Users.CRUD"] },
    { href: "/roles", label: "Role Management", icon: ShieldCheck, category: "Administration", perms: ["Roles.CRUD"] },
    { href: "/audit-logs", label: "Audit Trail", icon: Activity, category: "Administration", perms: ["Settings.CRUD", "Roles.CRUD"] },
    { href: "/settings", label: "Settings", icon: SettingsIcon, category: "Administration", perms: ["Settings.CRUD"] },
  ].filter(item => hasPermission(item.perms))

  const filteredPaletteItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(paletteQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(paletteQuery.toLowerCase())
  )

  const handlePaletteSelect = (href: string) => {
    setIsPaletteOpen(false)
    setPaletteQuery("")
    window.location.href = href
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden print:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border/20 w-64 md:w-72 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Branding header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-border/20 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M12 11h4" />
              <path d="M12 16h4" />
              <path d="M8 11h.01" />
              <path d="M8 16h.01" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
              Invoice
            </span>
            <span className="block text-[10px] text-primary uppercase tracking-widest font-semibold">
              Management
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">
          Core Modules
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="block">
              <button
                className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group border ${
                  isActive 
                    ? "bg-primary/10 text-primary border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border/20 bg-muted/5 space-y-3">
        

        <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 shrink-0">
            {currentUser?.name ? currentUser.name.split(" ").map((n: string) => n[0]).join("") : "US"}
          </div>
          <div className="overflow-hidden flex-1">
            <span className="block text-xs font-semibold text-foreground truncate">{currentUser?.name || "User"}</span>
            <span className="block text-[9px] text-muted-foreground truncate font-mono">{currentUser?.email || "user@vyapaar.pro"}</span>
            <span className="block mt-1 w-fit px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-primary/20 text-primary">
              {currentUser?.role || "System"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 h-9 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Floating command palette overlay */}
      <Dialog open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <DialogContent className="bg-card/90 backdrop-blur-xl border-border text-foreground max-w-lg rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
            <Search className="w-5 h-5 text-primary animate-pulse" />
            <Input 
              placeholder="Search workspaces & quick actions... (type 'Settings', 'Invoice', etc.)" 
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-sm font-semibold placeholder:text-muted-foreground/60 h-10 w-full bg-transparent px-0"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filteredPaletteItems.length > 0 ? (
              filteredPaletteItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => handlePaletteSelect(item.href)}
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between hover:bg-primary/10 hover:text-primary transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <div>
                        <span className="text-xs font-extrabold block">{item.label}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{item.category}</span>
                      </div>
                    </div>
                    <Zap className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-muted-foreground/40" />
                No shortcuts found. Try searching for other modules.
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border bg-muted/10 text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest flex justify-between px-5">
            <span>Navigation Desk</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
    </>
  )
}
