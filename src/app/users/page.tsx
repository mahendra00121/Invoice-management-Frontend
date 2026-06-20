"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Plus, 
  Search, 
  Trash2, 
  Menu,
  ShieldCheck,
  AlertCircle,
  Users,
  Power,
  Key,
  Eye,
  EyeOff
} from "lucide-react"

import Sidebar from "@/components/Sidebar"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogTitle 
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface User {
  id: number | string;
  name: string;
  email: string;
  roleId?: string;
  roleName?: string;
  createdAt: string;
  isActive?: boolean;
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [availableRoles, setAvailableRoles] = useState<any[]>([])

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({ name: "", email: "", password: "", roleId: "" })

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null)
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const fetchUsersAndRoles = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        api.users.getAll().catch(() => []),
        api.roles.getAll().catch(() => [])
      ])
      setUsers(usersData)
      setAvailableRoles(rolesData)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load users")
    }
  }

  useEffect(() => {
    fetchUsersAndRoles()
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let hasErr = false
    const errs = { name: "", email: "", password: "", roleId: "" }

    if (!name) { errs.name = "Name is required"; hasErr = true }
    if (!email) { errs.email = "Email is required"; hasErr = true }
    if (!editingUserId && (!password || password.length < 6)) { 
      errs.password = "Password must be at least 6 characters"; 
      hasErr = true 
    }
    if (editingUserId && password && password.length < 6) {
      errs.password = "Password must be at least 6 characters"; 
      hasErr = true 
    }

    if (hasErr) {
      setFormErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = { name, email, roleId: roleId || null }
      if (password) payload.password = password

      if (editingUserId) {
        await api.users.update(editingUserId, payload)
        toast.success("User updated successfully!")
      } else {
        await api.users.create(payload)
        toast.success("User created successfully!")
      }
      setIsDialogOpen(false)
      setName("")
      setEmail("")
      setPassword("")
      setRoleId("")
      setEditingUserId(null)
      fetchUsersAndRoles()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${editingUserId ? 'update' : 'create'} user`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number | string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await api.users.delete(id)
        toast.success("User deleted successfully!")
        fetchUsersAndRoles()
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user")
      }
    }
  }

  const handleToggleStatus = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} ${user.name}?`)) {
      try {
        const payload = {
          name: user.name,
          email: user.email,
          roleId: user.roleId || null,
          isActive: !user.isActive
        }
        await api.users.update(user.id, payload)
        toast.success(`User ${!user.isActive ? 'activated' : 'suspended'} successfully!`)
        fetchUsersAndRoles()
      } catch (err: any) {
        toast.error(err.message || "Failed to update user status")
      }
    }
  }

  const handleResetPassword = async () => {
    if (!resetTargetUser || !newAdminPassword || newAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      const payload = {
        name: resetTargetUser.name,
        email: resetTargetUser.email,
        roleId: resetTargetUser.roleId || null,
        password: newAdminPassword
      }
      await api.users.update(resetTargetUser.id, payload)
      toast.success(`Password reset successfully for ${resetTargetUser.name}`)
      setIsResetPasswordOpen(false)
      setNewAdminPassword("")
      setResetTargetUser(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    }
  }

  const openCreateDialog = () => {
    setEditingUserId(null)
    setName("")
    setEmail("")
    setPassword("")
    setRoleId("")
    setFormErrors({ name: "", email: "", password: "", roleId: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: any) => {
    setEditingUserId(user.id)
    setName(user.name)
    setEmail(user.email)
    setPassword("") // Empty string to not change password by default
    setRoleId(user.roleId || "")
    setFormErrors({ name: "", email: "", password: "", roleId: "" })
    setIsDialogOpen(true)
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
                User Management
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                Manage system access & credentials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs h-10 px-3 md:px-4 rounded-xl shadow-lg shadow-primary/20 transition-all">
              <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-1.5" /> <span className="hidden md:inline">New User</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-background border-border rounded-xl text-xs font-semibold focus-visible:ring-1 focus-visible:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Created At</TableHead>
                    <TableHead className="text-right font-bold w-[130px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold">{u.name}</TableCell>
                        <TableCell className="font-mono text-xs">{u.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {u.roleName || "No Role"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.isActive === false ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span> Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.createdAt || "").toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="ghost" size="icon" 
                            className={`w-8 h-8 rounded-lg transition-all ${u.isActive === false ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'}`}
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive === false ? "Activate User" : "Suspend User"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                            onClick={() => openEditDialog(u)}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                            onClick={() => {
                              setResetTargetUser(u)
                              setNewAdminPassword("")
                              setIsResetPasswordOpen(true)
                            }}
                            title="Force Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                            onClick={() => handleDelete(u.id, u.name)}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm font-medium">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>

      {/* Create User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-sm font-extrabold tracking-wider uppercase">
              {editingUserId ? "Edit User Details" : "Add New User"}
            </DialogTitle>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground/80 uppercase tracking-widest">Full Name</Label>
              <Input 
                value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({...p, name: ""})) }}
                className={`h-11 rounded-xl text-xs font-semibold ${formErrors.name ? "border-red-500" : ""}`}
                placeholder="e.g. Rahul Sharma"
              />
              {formErrors.name && <span className="text-[10px] text-red-500 font-bold">{formErrors.name}</span>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground/80 uppercase tracking-widest">Email Address</Label>
              <Input 
                type="email"
                value={email} onChange={(e) => { setEmail(e.target.value); setFormErrors(p => ({...p, email: ""})) }}
                className={`h-11 rounded-xl text-xs font-semibold ${formErrors.email ? "border-red-500" : ""}`}
                placeholder="name@company.com"
                disabled={!!editingUserId} // Usually, we don't allow changing email, or we can allow it
              />
              {formErrors.email && <span className="text-[10px] text-red-500 font-bold">{formErrors.email}</span>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground/80 uppercase tracking-widest">
                Password {editingUserId && <span className="text-[10px] text-muted-foreground normal-case">(Leave blank to keep unchanged)</span>}
              </Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={password} onChange={(e) => { setPassword(e.target.value); setFormErrors(p => ({...p, password: ""})) }}
                  className={`h-11 pr-10 rounded-xl text-xs font-semibold ${formErrors.password ? "border-red-500" : ""}`}
                  placeholder={editingUserId ? "•••••••• (unchanged)" : "••••••••"}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && <span className="text-[10px] text-red-500 font-bold">{formErrors.password}</span>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground/80 uppercase tracking-widest">Assign Role</Label>
              <select 
                value={roleId} onChange={(e) => setRoleId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm font-semibold outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No Role (Restricted Access)</option>
                {availableRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-10 text-xs font-bold rounded-xl w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 text-xs font-bold rounded-xl px-6 w-full sm:w-auto">
                {isSubmitting ? "Saving..." : (editingUserId ? "Update User" : "Create User")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: DIRECT PASSWORD RESET */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-card border-border shadow-2xl p-6">
          <DialogTitle className="text-xl font-black text-foreground">Reset Password</DialogTitle>
          <div className="py-2 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Set a new password for <span className="font-bold text-foreground text-sm">{resetTargetUser?.name}</span>. They will be able to log in with this new password immediately without requiring an email reset link.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">New Password</Label>
              <div className="relative">
                <Input 
                  type={showResetPassword ? "text" : "password"} 
                  placeholder="min. 6 characters" 
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="h-11 pr-10 rounded-xl bg-background border-border"
                />
                <button 
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border mt-4 pt-4 flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsResetPasswordOpen(false)} className="text-xs font-bold rounded-xl w-full sm:w-auto h-10">
              Cancel
            </Button>
            <Button type="button" onClick={handleResetPassword} className="bg-primary text-primary-foreground text-xs font-bold rounded-xl w-full sm:w-auto h-10 shadow-sm border-0">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}






