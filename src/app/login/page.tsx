/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Activity,
  AlertCircle,
  Sun,
  Moon,
  FileCheck,
  Zap,
  CheckCircle2,
  LockKeyhole
} from "lucide-react"

// Shadcn UI components
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Theme control
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("invoice_management_theme") as "light" | "dark" | null
      return savedTheme || "light"
    }
    return "light"
  })

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [formErrors, setFormErrors] = useState({ email: "", password: "" })

  // Forgot Password Flow States
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0) // 0: Hidden, 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("invoice_management_theme", theme)
  }, [theme])

  useEffect(() => {
    // If user is already logged in, take them to dashboard home
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("invoice_management_user")
      if (savedUser) {
        router.push("/dashboard")
      }
    }
    const handle = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    let hasErr = false
    const errs = { email: "", password: "" }
    
    if (!email) {
      errs.email = "Email address is required"
      hasErr = true
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email"
      hasErr = true
    }

    if (!password) {
      errs.password = "Password is required"
      hasErr = true
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters"
      hasErr = true
    }

    if (hasErr) {
      setFormErrors(errs)
      toast.error("Form Validation Failed", {
        description: "Please inspect your credentials and try again."
      })
      return
    }

    // Authenticate
    setIsLoading(true)
    setLoadingStep(1) // Step 1: Matching credentials in database

    try {
      const userData = await api.auth.login(email, password)
      
      setLoadingStep(2) // Step 2: Generating OAuth signature keys
      
      setTimeout(() => {
        setLoadingStep(3) // Step 3: Bootstrapping localized workspace files

        setTimeout(() => {
          localStorage.setItem("invoice_management_user", JSON.stringify(userData))
          toast.success("Authentication Completed!", {
            description: `Welcome back, ${userData.name}. Redirecting to system...`
          })
          
          router.push("/dashboard")
          router.refresh()
        }, 600)
      }, 600)
    } catch (err: any) {
      setIsLoading(false)
      toast.error("Authentication Failed", {
        description: err.message || "Invalid credentials. Please inspect passcode requirements."
      })
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      toast.error("Please enter your registered email.")
      return
    }
    setIsResetLoading(true)
    try {
      await api.auth.forgotPassword(resetEmail)
      toast.success("OTP Sent!", { description: "If the email is registered, an OTP has been sent." })
      setForgotPasswordStep(2)
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.")
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetOtp) {
      toast.error("Please enter the OTP.")
      return
    }
    setIsResetLoading(true)
    try {
      await api.auth.verifyOtp(resetEmail, resetOtp)
      toast.success("OTP Verified!")
      setForgotPasswordStep(3)
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP.")
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setIsResetLoading(true)
    try {
      await api.auth.resetPassword(resetEmail, resetOtp, newPassword)
      toast.success("Password Reset Successfully!", { description: "You can now login with your new password." })
      setForgotPasswordStep(0)
      setResetEmail("")
      setResetOtp("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.")
    } finally {
      setIsResetLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <Activity className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">Securing Workspace Connections...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary/20 relative flex overflow-hidden">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#6366f1]/10 dark:bg-[#6366f1]/5 rounded-full blur-[160px] -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#a855f7]/10 dark:bg-[#a855f7]/5 rounded-full blur-[160px] -z-10 pointer-events-none"></div>

      {/* DUAL PANE SPLIT CONTAINER */}
      <div className="w-full flex">
        
        {/* LEFT PANE: Premium Marketing & Branding Panel (Visible on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-card/20 dark:bg-card/5 border-r border-border/50 items-center justify-center p-12 overflow-hidden">
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          {/* Left panel dynamic graphics */}
          <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-gradient-to-tr from-[#6366f1]/20 to-[#a855f7]/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="max-w-md w-full relative z-10 space-y-10">
            
            {/* Top Logo branding */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
                  Invoice
                </span>
                <span className="block text-[10px] text-primary uppercase tracking-widest font-semibold mt-[-2px]">
                  Management
                </span>
              </div>
            </div>

            {/* Title / Hero text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Smart & Automated <br />
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Billing Workspace</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock high-fidelity estimates, secure payments, compliance audits, and clean financial reports instantly. Designed for modern high-velocity growth desks.
              </p>
            </div>

            {/* Visual Checklist items */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 group">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5 group-hover:scale-110 transition-all">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Rapid Quotations & Invoicing</h4>
                  <p className="text-[11px] text-muted-foreground">Draft calculations, configure taxes, and sync PDF sheets in seconds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5 group-hover:scale-110 transition-all">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Secure Payment Verifications</h4>
                  <p className="text-[11px] text-muted-foreground">Integrate offline/online ledgers, monitor balances, and record UTR entries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5 group-hover:scale-110 transition-all">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">100% Compliance Compliant</h4>
                  <p className="text-[11px] text-muted-foreground">Automate local SGST, CGST, IGST rules with real-time customer matching.</p>
                </div>
              </div>
            </div>

            {/* Bottom mini disclaimer */}
            <div className="pt-6 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              SYSTEM SECURITY ENCRYPTED DESK // OAUTH2 VALIDATION CORE
            </div>

          </div>

        </div>

        {/* RIGHT PANE: Modern Glassmorphism Login Card Pane */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          <div className="w-full max-w-md space-y-6">
            
            {/* Logo and header branding (Visible ONLY on mobile/tablet) */}
            <div className="flex lg:hidden items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] shadow-md text-white">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight text-foreground">Invoice</span>
                  <span className="block text-[9px] text-primary uppercase font-bold tracking-widest mt-[-3px]">Management</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-xl border border-border bg-card/40 text-foreground hover:bg-muted transition-all h-9 w-9"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>

            {/* Desktop Theme Toggle Placement */}
            <div className="hidden lg:flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-xl border border-border bg-card/30 text-foreground hover:bg-muted transition-all h-10 w-10 shadow-sm"
              >
                {theme === "light" ? <Moon className="w-[1.1rem] h-[1.1rem]" /> : <Sun className="w-[1.1rem] h-[1.1rem] text-amber-400" />}
              </Button>
            </div>

            {/* FORGOT PASSWORD FLOW */}
            {forgotPasswordStep > 0 ? (
              <Card className="border border-border/80 bg-card/60 dark:bg-card/45 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300">
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
                
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setForgotPasswordStep(0)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-widest mb-4 transition-colors"
                    >
                      ← Back to Login
                    </button>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      {forgotPasswordStep === 1 ? "Reset Password" : forgotPasswordStep === 2 ? "Enter OTP" : "New Password"}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {forgotPasswordStep === 1 ? "Enter your registered email address to receive a secure One-Time Password." : 
                       forgotPasswordStep === 2 ? `Enter the 6-digit OTP sent to ${resetEmail}.` : 
                       "Create a strong new password for your account."}
                    </p>
                  </div>

                  {/* Step 1: Email */}
                  {forgotPasswordStep === 1 && (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">Email Address</Label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-500 transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="pl-10 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-amber-500 rounded-xl h-11 text-xs font-semibold"
                            required
                          />
                        </div>
                      </div>
                      <Button disabled={isResetLoading} type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 font-black text-xs h-11 rounded-xl shadow-lg mt-2">
                        {isResetLoading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: OTP */}
                  {forgotPasswordStep === 2 && (
                    <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">6-Digit OTP</Label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-500 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <Input
                            type="text"
                            placeholder="123456"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            className="pl-10 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-amber-500 rounded-xl h-11 text-center tracking-[0.5em] font-mono font-bold text-lg"
                            required
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <Button disabled={isResetLoading} type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 font-black text-xs h-11 rounded-xl shadow-lg mt-2">
                        {isResetLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </form>
                  )}

                  {/* Step 3: New Password */}
                  {forgotPasswordStep === 3 && (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">New Password</Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-amber-500 rounded-xl h-11 text-xs font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">Confirm Password</Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-amber-500 rounded-xl h-11 text-xs font-semibold"
                          required
                        />
                      </div>
                      <Button disabled={isResetLoading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 rounded-xl shadow-lg mt-2">
                        {isResetLoading ? "Saving..." : "Save New Password"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
            <Card className="border border-border/80 bg-card/60 dark:bg-card/45 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300">
              
              {/* Dynamic decorative line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-primary"></div>

              {/* Secure loader overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-3 max-w-xs">
                    <p className="text-base font-extrabold text-foreground tracking-tight">Authenticating Desk Profile...</p>
                    <div className="space-y-1.5 font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                      <p className={loadingStep >= 1 ? "text-emerald-500 font-bold" : "text-muted-foreground/50"}>
                        {loadingStep >= 1 ? "✓ Credentials matched" : "• Verifying business address"}
                      </p>
                      <p className={loadingStep >= 2 ? "text-emerald-500 font-bold" : "text-muted-foreground/50"}>
                        {loadingStep >= 2 ? "✓ Handshake key signed" : "• Structuring security tokens"}
                      </p>
                      <p className={loadingStep >= 3 ? "text-emerald-500 font-bold" : "text-muted-foreground/50"}>
                        {loadingStep >= 3 ? "✓ Workspace launched" : "• Synchronizing workspace logs"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="p-8 space-y-6">
                
                {/* Greeting headers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <LockKeyhole className="w-3.5 h-3.5" />
                    <span>Secure Desk Verification</span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Sign In to Dashboard</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Provide verified corporate credentials to access customer profiles, tax estimates, invoices and payments history.
                  </p>
                </div>

                {/* Form controls */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">
                      Email
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setFormErrors(prev => ({ ...prev, email: "" }))
                        }}
                        className={`pl-10 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : "border-slate-200 focus-visible:ring-primary"} rounded-xl h-11 text-xs font-semibold outline-none focus:bg-white transition-all`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle className="w-3 h-3 shrink-0 animate-bounce" />
                        <span>{formErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="passcode" className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest">
                        Password
                      </Label>
                      <button 
                        type="button"
                        onClick={() => setForgotPasswordStep(1)}
                        className="text-[10px] text-primary font-bold hover:underline cursor-pointer tracking-wider outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="passcode"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setFormErrors(prev => ({ ...prev, password: "" }))
                        }}
                        className={`pl-10 pr-10 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 border ${formErrors.password ? "border-destructive focus-visible:ring-destructive" : "border-slate-200 focus-visible:ring-primary"} rounded-xl h-11 text-xs font-semibold outline-none focus:bg-white transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground outline-none transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle className="w-3 h-3 shrink-0 animate-bounce" />
                        <span>{formErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Authenticate Trigger Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs h-11 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group transition-all pt-0.5 mt-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                </form>

              </CardContent>

            </Card>
            )}

            {/* Bottom audit notice */}
            <p className="text-center text-[10px] text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
              Secure desktop access audited internally. Powered by corporate database ledger protocols.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}






