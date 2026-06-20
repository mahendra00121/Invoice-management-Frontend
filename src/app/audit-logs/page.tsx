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
import { toast } from "sonner"

export default function AuditLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => 
    log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border">
                    <Filter className="w-4 h-4" />
                  </Button>
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
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center ${isFirst ? 'bg-primary shadow-lg shadow-primary/30 scale-110' : 'bg-muted-foreground/20'}`}>
                          {isFirst ? <Activity className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-card" />}
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
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {log.userName ? log.userName.charAt(0).toUpperCase() : "?"}
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
                <div className="h-40 flex flex-col items-center justify-center text-center space-y-2">
                  <Activity className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm font-bold text-muted-foreground">No activity logs found.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
