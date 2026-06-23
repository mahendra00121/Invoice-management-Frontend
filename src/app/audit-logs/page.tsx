"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Menu,
  Activity,
  Search,
  Filter,
  UserCheck,
  FileText,
  Trash2,
  Edit,
  PlusCircle,
  Database,
  ArrowRight
} from "lucide-react"

import Sidebar from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  if (!name) return "bg-slate-500";
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500", 
    "bg-amber-500", "bg-pink-500", "bg-indigo-500", "bg-rose-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AuditLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("All")

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await api.auditLogs.getAll()
      setLogs(data)
    } catch (e) {
      toast.error("Failed to fetch audit logs")
      // fallback mock data if table doesn't exist yet
      if (logs.length === 0) {
          setLogs([
              { id: 1, userName: "Admin", action: "Create", entityName: "Invoice", entityId: "INV-001", details: "Created invoice for $500", timestamp: new Date().toISOString() },
              { id: 2, userName: "Sales Exec", action: "Update", entityName: "Customer", entityId: "CUST-10", details: "Updated email address", timestamp: new Date(Date.now() - 3600000).toISOString() },
              { id: 3, userName: "Manager", action: "Delete", entityName: "Quotation", entityId: "QT-005", details: "Deleted invalid quote", timestamp: new Date(Date.now() - 7200000).toISOString() },
          ])
      }
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
        const perms = userObj.permissions ? userObj.permissions.split(',') : []
        if (!perms.includes("AuditLogs.View")) {
          window.location.href = "/" // Redirect if no permission
          return
        }
      } catch (e) {}
    }
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = actionFilter === "All" || log.action?.toLowerCase() === actionFilter.toLowerCase();
    
    return matchesSearch && matchesAction;
  })

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return <PlusCircle className="w-4 h-4 text-emerald-500" />
      case "update": return <Edit className="w-4 h-4 text-blue-500" />
      case "delete": return <Trash2 className="w-4 h-4 text-red-500" />
      case "login": return <UserCheck className="w-4 h-4 text-indigo-500" />
      default: return <Database className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "update": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "delete": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      case "login": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
      default: return "bg-muted/50 text-muted-foreground border-border"
    }
  }

  // --- Analytics Calculations ---
  const totalEvents = logs.length;
  const criticalActions = logs.filter(log => log.action?.toLowerCase() === "delete").length;
  const todayEvents = logs.filter(log => {
    if (!log.timestamp) return false;
    const logDate = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 shrink-0 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Audit Trail
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                System Activity & Security Logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 rounded-xl font-bold border-border shadow-sm text-xs" onClick={fetchLogs}>
              Refresh Logs
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/5">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* System Health Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Events */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-blue-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Events</span>
                    <span className="text-3xl font-black text-foreground tracking-tight block">{totalEvents}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Critical Actions */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-red-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Critical (Deletions)</span>
                    <span className="text-3xl font-black text-red-500 tracking-tight block">{criticalActions}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Today's Activity */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-emerald-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Today's Activity</span>
                    <span className="text-3xl font-black text-emerald-500 tracking-tight block">{todayEvents}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Stats & Filters */}
            <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Activity Feed</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md font-medium">
                      Monitor user actions, data changes, and security events in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="relative w-full sm:w-80 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by user, action, or details..." 
                      className="pl-9 h-11 rounded-xl bg-transparent border-border focus:bg-background transition-colors w-full text-sm font-semibold"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={actionFilter !== "All" ? "default" : "outline"} size="icon" className={`h-11 w-11 rounded-xl border-border ${actionFilter !== "All" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}>
                        <Filter className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuCheckboxItem 
                        checked={actionFilter === "All"}
                        onCheckedChange={() => setActionFilter("All")}
                        className="font-semibold cursor-pointer"
                      >
                        All Actions
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={actionFilter === "Create"}
                        onCheckedChange={() => setActionFilter("Create")}
                        className="font-semibold cursor-pointer"
                      >
                        Create
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={actionFilter === "Update"}
                        onCheckedChange={() => setActionFilter("Update")}
                        className="font-semibold cursor-pointer"
                      >
                        Update
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={actionFilter === "Delete"}
                        onCheckedChange={() => setActionFilter("Delete")}
                        className="font-semibold cursor-pointer"
                      >
                        Delete
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={actionFilter === "Login"}
                        onCheckedChange={() => setActionFilter("Login")}
                        className="font-semibold cursor-pointer"
                      >
                        Login / Auth
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Feed */}
            <div className="bg-card border border-border rounded-3xl shadow-sm p-4 sm:p-8">
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-sm font-bold text-muted-foreground animate-pulse">
                  Loading system logs...
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="relative border-l-2 border-muted-foreground/20 ml-4 sm:ml-6 space-y-8 pb-4">
                  {filteredLogs.map((log, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div key={log.id} className={`relative pl-8 sm:pl-10 transition-all duration-300 hover:translate-x-1 group`}>
                        {/* Timeline Node */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10 ${getAvatarColor(log.userName || 'System')} ${isFirst ? 'scale-110 ring-2 ring-primary/30 ring-offset-2 ring-offset-background' : ''}`}>
                          {getInitials(log.userName || 'System')}
                        </div>
                        
                        {/* Content Card */}
                        <div className="bg-muted/10 hover:bg-muted/30 border border-border rounded-2xl p-4 sm:p-5 transition-colors overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                                {getActionIcon(log.action)}
                                {log.action}
                              </span>
                              <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="break-all">{log.entityName}</span> {log.entityId && <span className="text-muted-foreground font-semibold shrink-0">#{log.entityId}</span>}
                              </span>
                            </div>
                            <time className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
                              {new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').toLocaleString("en-IN", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " •")}
                            </time>
                          </div>
                          
                          <p className="text-sm text-foreground/80 font-medium mb-3 break-words">
                            {log.details || `Performed ${log.action} operation on ${log.entityName}`}
                          </p>

                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${getAvatarColor(log.userName || 'System')}`}>
                              {getInitials(log.userName || 'System')}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                              Executed by <span className="text-foreground">{log.userName || "System / Unknown"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border shadow-sm border-dashed">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-foreground">No results found</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We couldn't find any system activity matching your search criteria. Try adjusting your filters or search terms.
                    </p>
                  </div>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="bg-background hover:bg-muted text-xs font-bold rounded-xl mt-2 border-border shadow-sm"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
