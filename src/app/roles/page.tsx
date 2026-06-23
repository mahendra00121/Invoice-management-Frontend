"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Menu,
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Check,
  Copy,
  Search,
  Lock,
  Users
} from "lucide-react"

import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

const PERMISSION_MODULES = [
  {
    module: "Dashboard",
    description: "Access to system overview and metrics.",
    permissions: [
      { id: "Dashboard.View", label: "Read Only" },
      { id: "Dashboard.Limited", label: "Limited Access" },
      { id: "Dashboard.Full", label: "Full Access" }
    ]
  },
  {
    module: "Customers",
    description: "Manage client database and contacts.",
    permissions: [
      { id: "Customers.View", label: "View Only" },
      { id: "Customers.CRUD", label: "Manage (Create/Edit/Delete)" }
    ]
  },
  {
    module: "Products",
    description: "Manage inventory and pricing.",
    permissions: [
      { id: "Products.View", label: "View Only" },
      { id: "Products.CRUD", label: "Manage (Create/Edit/Delete)" }
    ]
  },
  {
    module: "Quotations",
    description: "Create and send price estimates.",
    permissions: [
      { id: "Quotations.View", label: "View Only" },
      { id: "Quotations.CRUD", label: "Manage (Create/Edit/Delete)" },
      { id: "Quotations.Approve", label: "Approve Quotes" }
    ]
  },
  {
    module: "Invoices",
    description: "Manage billing and tax invoices.",
    permissions: [
      { id: "Invoices.View", label: "View Only" },
      { id: "Invoices.CRUD", label: "Manage (Create/Edit/Delete)" }
    ]
  },
  {
    module: "Payments",
    description: "Record and track transactions.",
    permissions: [
      { id: "Payments.View", label: "View Only" },
      { id: "Payments.CRUD", label: "Manage (Create/Edit/Delete)" }
    ]
  },
  {
    module: "Reports",
    description: "Financial and business analytics.",
    permissions: [
      { id: "Reports.View", label: "View Only" },
      { id: "Reports.Full", label: "Full Access" }
    ]
  },
  {
    module: "Administration",
    description: "System-level configurations.",
    permissions: [
      { id: "Users.CRUD", label: "User Management" },
      { id: "Roles.CRUD", label: "Role Management" },
      { id: "Settings.CRUD", label: "System Settings" }
    ]
  },
  {
    module: "Audit Logs",
    description: "Track system activity and user actions.",
    permissions: [
      { id: "AuditLogs.View", label: "View Audit Trail" }
    ]
  }
]

export default function RolesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const data = await api.roles.getAll()
      setRoles(data)
    } catch (e) {
      toast.error("Failed to fetch roles")
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
        if (!perms.includes("Roles.CRUD")) {
          window.location.href = "/" // Redirect if no permission
          return
        }
      } catch (e) {}
    }
    fetchRoles()
  }, [])

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateDialog = () => {
    setEditingRole(null)
    setName("")
    setDescription("")
    setSelectedPerms([])
    setIsDialogOpen(true)
  }

  const openEditDialog = (role: any) => {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description || "")
    setSelectedPerms(role.permissions ? role.permissions.split(",") : [])
    setIsDialogOpen(true)
  }

  const handleDuplicateRole = (role: any) => {
    setEditingRole(null) // It's a new role
    setName(role.name + " (Copy)")
    setDescription("Copy of " + role.name)
    setSelectedPerms(role.permissions ? role.permissions.split(",") : [])
    setIsDialogOpen(true)
  }

  const togglePermission = (permId: string) => {
    if (selectedPerms.includes(permId)) {
      setSelectedPerms(selectedPerms.filter(p => p !== permId))
    } else {
      setSelectedPerms([...selectedPerms, permId])
    }
  }

  const toggleModulePermissions = (modulePerms: any[], isChecked: boolean) => {
    const permIds = modulePerms.map(p => p.id)
    if (isChecked) {
      // Add all missing
      const toAdd = permIds.filter(id => !selectedPerms.includes(id))
      setSelectedPerms([...selectedPerms, ...toAdd])
    } else {
      // Remove all
      setSelectedPerms(selectedPerms.filter(p => !permIds.includes(p)))
    }
  }

  const handleSave = async () => {
    if (!name) return toast.error("Role Name is required")
    
    const payload = {
      name,
      description,
      permissions: selectedPerms.join(",")
    }

    try {
      if (editingRole) {
        await api.roles.update(editingRole.id, payload)
        toast.success("Role updated successfully")
      } else {
        await api.roles.create(payload)
        toast.success("New role created successfully")
      }
      setIsDialogOpen(false)
      fetchRoles()
    } catch (e: any) {
      toast.error(e.message || "Failed to save role")
    }
  }

  const handleDelete = async (id: number | string, isSystemRole: boolean) => {
    if (isSystemRole) {
      return toast.error("Cannot delete core system roles")
    }
    
    if (window.confirm("Are you sure you want to delete this role? Users assigned to this role will lose their privileges.")) {
      try {
        await api.roles.delete(id)
        toast.success("Role deleted successfully")
        fetchRoles()
      } catch (e: any) {
        toast.error(e.message || "Failed to delete role. It might be assigned to active users.")
      }
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
              <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Role Management
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                Define access control profiles & permissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl h-10 px-3 md:px-5 shadow-lg shadow-primary/20 transition-all">
              <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Create Role</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Stats & Filters Card */}
            <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Access Control</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Manage security policies and control what features your team members can access across the platform.
                  </p>
                </div>
                
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roles..." 
                    className="pl-9 h-11 rounded-xl bg-transparent border-border focus:bg-background transition-colors w-full text-sm font-semibold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Roles Table */}
            <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="font-extrabold text-xs uppercase tracking-widest py-5 pl-8">Role Identity</TableHead>
                      <TableHead className="font-extrabold text-xs uppercase tracking-widest py-5">Description</TableHead>
                      <TableHead className="font-extrabold text-xs uppercase tracking-widest py-5">Status</TableHead>
                      <TableHead className="font-extrabold text-xs uppercase tracking-widest py-5 text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-sm font-bold text-muted-foreground">Loading Roles...</TableCell>
                      </TableRow>
                    ) : filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => {
                        const permCount = role.permissions ? role.permissions.split(',').filter(Boolean).length : 0;
                        return (
                          <TableRow key={role.id} className="hover:bg-muted/10 transition-colors border-border/50 group">
                            <TableCell className="pl-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.isSystemRole ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                  {role.isSystemRole ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                                    {role.name}
                                    {role.isSystemRole && <Lock className="w-3 h-3 text-muted-foreground" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-medium mt-0.5">
                                    {permCount} privileges assigned
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className="text-sm font-medium text-muted-foreground">{role.description || "-"}</span>
                            </TableCell>
                            <TableCell className="py-5">
                              {role.isSystemRole ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                  System Built-in
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  Custom Role
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-5 pr-8 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleDuplicateRole(role)} className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg" title="Duplicate Role">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)} className="h-8 px-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg" title="Edit Permissions">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {!role.isSystemRole && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id, role.isSystemRole)} className="h-8 px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete Role">
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
                        <TableCell colSpan={4} className="h-64 text-center border-b-0">
                          <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border shadow-sm">
                              <ShieldAlert className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="text-base font-bold text-foreground">No roles found</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                We couldn't find any roles matching "{searchQuery}". Try adjusting your keywords or create a new custom role.
                              </p>
                            </div>
                            <Button 
                              onClick={openCreateDialog}
                              variant="outline"
                              className="bg-background hover:bg-muted text-xs font-bold rounded-xl mt-2 border-border shadow-sm"
                            >
                              <Plus className="w-4 h-4 mr-1.5" /> Create Custom Role
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

          </div>
        </div>
      </main>

      {/* Role Editor Slide-over / Dialog (Sheet Style) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl border border-border shadow-2xl">
          
          <div className="shrink-0 border-b border-border p-6 sm:px-8 bg-muted/10">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              {editingRole ? "Modify Role Permissions" : "Create Custom Role"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm font-medium">
              Configure fine-grained access control for this role across the platform.
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="space-y-8">
              
              {/* Role Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-foreground/70 uppercase tracking-widest">Role Name</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={editingRole?.isSystemRole} 
                    className="font-bold h-12 bg-transparent border-border rounded-xl px-4" 
                    placeholder="e.g. Area Manager" 
                  />
                  {editingRole?.isSystemRole && <p className="text-[10px] text-orange-500 font-bold mt-1">* System role name cannot be changed</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-foreground/70 uppercase tracking-widest">Description</label>
                  <Input 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    disabled={editingRole?.isSystemRole} 
                    className="font-semibold h-12 bg-transparent border-border rounded-xl px-4 text-muted-foreground" 
                    placeholder="Brief description of responsibilities" 
                  />
                </div>
              </div>

              {/* Permission Matrix */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Permission Matrix</h3>
                  <div className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                    {selectedPerms.length} Privileges Active
                  </div>
                </div>
                
                <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-1/3 py-4 pl-6 font-extrabold text-xs uppercase tracking-widest text-foreground">Module</TableHead>
                        <TableHead className="py-4 font-extrabold text-xs uppercase tracking-widest text-foreground">Privileges</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERMISSION_MODULES.map((mod, idx) => {
                        const modulePermIds = mod.permissions.map(p => p.id);
                        const allSelected = modulePermIds.every(id => selectedPerms.includes(id));
                        const someSelected = modulePermIds.some(id => selectedPerms.includes(id));
                        
                        return (
                          <TableRow key={idx} className="border-border hover:bg-muted/10 transition-colors group">
                            <TableCell className="pl-6 py-5 align-top">
                              <div className="flex items-start gap-3">
                                <Switch 
                                  checked={allSelected}
                                  onCheckedChange={(checked) => toggleModulePermissions(mod.permissions, checked)}
                                  className="mt-0.5 data-[state=checked]:bg-primary"
                                />
                                <div>
                                  <div className="font-bold text-sm text-foreground">{mod.module}</div>
                                  <div className="text-[11px] font-medium text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                                    {mod.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                {mod.permissions.map(perm => {
                                  const isChecked = selectedPerms.includes(perm.id);
                                  return (
                                    <button
                                      key={perm.id}
                                      onClick={() => togglePermission(perm.id)}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                                        isChecked 
                                          ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                                          : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:border-border/80 hover:text-foreground'
                                      }`}
                                    >
                                      <div className={`w-3 h-3 rounded-full flex items-center justify-center border transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-transparent'}`}>
                                        {isChecked && <Check className="w-2 h-2 text-primary-foreground" strokeWidth={4} />}
                                      </div>
                                      {perm.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          </div>

          <div className="shrink-0 border-t border-border p-6 bg-muted/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-semibold text-muted-foreground hidden sm:block">
              Changes apply instantly to all users assigned to this role.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold rounded-xl h-11 px-6 w-full sm:w-auto hover:bg-muted">Cancel</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 font-bold rounded-xl h-11 px-8 w-full sm:w-auto">
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  )
}
