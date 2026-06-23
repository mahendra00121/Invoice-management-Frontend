"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  Menu,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  BarChart2,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

import Sidebar from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type ReportType = "DASHBOARD_OVERVIEW" | "SALES_SUMMARY" | "PAYMENT_COLLECTIONS" | "OUTSTANDING_INVOICES" | "TOP_PRODUCTS"

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [reportType, setReportType] = useState<ReportType>("SALES_SUMMARY")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])
  
  const [reportData, setReportData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  const fetchBackendReport = async (currentPage = page) => {
    setIsLoading(true)
    try {
      const response = await api.reports.get(reportType, startDate, endDate, currentPage, pageSize)
      setReportData(response.data || [])
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages)
      }
      toast.success("Report generated successfully")
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate report from backend")
    } finally {
      setIsLoading(false)
    }
  }

  // Load all raw data for dashboard charts
  useEffect(() => {
    api.invoices.getAll().then(setAllInvoices).catch(console.error)
    api.payments.getAll().then(setAllPayments).catch(console.error)
  }, [])

  // Initial load
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }, [])

  const resetToThisMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }

  // Auto-fetch when type or dates change if they are valid
  useEffect(() => {
    if (startDate && endDate && reportType !== "DASHBOARD_OVERVIEW" && reportType !== "TOP_PRODUCTS") {
      setPage(1)
      fetchBackendReport(1)
    }
  }, [reportType, startDate, endDate, pageSize])

  // Fetch when page changes explicitly
  useEffect(() => {
    if (startDate && endDate && reportType !== "DASHBOARD_OVERVIEW" && reportType !== "TOP_PRODUCTS") {
      fetchBackendReport(page)
    }
  }, [page])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const getStatusBadgeClasses = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("paid") || s.includes("completed") || s.includes("success")) {
      return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    }
    if (s.includes("pending") || s.includes("partial")) {
      return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
    }
    if (s.includes("overdue") || s.includes("cancelled") || s.includes("failed")) {
      return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
    }
    return "bg-muted text-muted-foreground border border-border";
  }

  const handlePrint = () => {
    window.print()
  }

  // Group report data by date for the chart
  const chartData = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    // Group by date string (e.g. "Jun 12")
    const grouped = reportData.reduce((acc: any, row: any) => {
      const dateObj = new Date(row.date);
      // Format as "DD MMM"
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += row.amount || 0;
      return acc;
    }, {});

    // Sort chronologically by converting back to date, but since they are from current period, 
    // and usually reportData is sorted descending by API, let's reverse it to show chronological left-to-right.
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        // Just a simple sort since we know they are in the same year/period
        return new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime();
    });

    return sortedKeys.map(key => ({
      name: key,
      total: grouped[key]
    }));
  }, [reportData]);

  // Data for Dashboard Overview
  const dashboardData = React.useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // 1. Sales vs Collection Timeline
    const dateMap: Record<string, { sales: number; collections: number }> = {};
    
    allInvoices.forEach(inv => {
      const d = new Date(inv.invoiceDate || inv.createdAt);
      if (d >= start && d <= end) {
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dateMap[key]) dateMap[key] = { sales: 0, collections: 0 };
        dateMap[key].sales += inv.grandTotal || 0;
      }
    });

    allPayments.forEach(pay => {
      const d = new Date(pay.paymentDate || pay.createdAt);
      if (d >= start && d <= end) {
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dateMap[key]) dateMap[key] = { sales: 0, collections: 0 };
        dateMap[key].collections += pay.amount || 0;
      }
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime());
    const salesVsCollection = sortedDates.map(key => ({
      name: key,
      Sales: dateMap[key].sales,
      Collections: dateMap[key].collections
    }));

    // 2. Payment Modes
    const modeMap: Record<string, number> = {};
    allPayments.forEach(pay => {
      const d = new Date(pay.paymentDate || pay.createdAt);
      if (d >= start && d <= end) {
        const mode = pay.paymentMode || "Unknown";
        modeMap[mode] = (modeMap[mode] || 0) + (pay.amount || 0);
      }
    });
    const paymentModes = Object.keys(modeMap).map(k => ({ name: k, value: modeMap[k] }));
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'];

    // 3. Outstanding Breakdown
    let pending = 0, partial = 0, overdue = 0;
    allInvoices.forEach(inv => {
      const d = new Date(inv.invoiceDate || inv.createdAt);
      if (d >= start && d <= end && inv.balanceAmount > 0) {
        if (inv.status === "Overdue") overdue += inv.balanceAmount;
        else if (inv.status === "Partial Paid") partial += inv.balanceAmount;
        else pending += inv.balanceAmount;
      }
    });
    const outstandingBreakdown = [
      { name: "Pending", value: pending, fill: "#f59e0b" },
      { name: "Partially Paid", value: partial, fill: "#3b82f6" },
      { name: "Overdue", value: overdue, fill: "#ef4444" }
    ].filter(item => item.value > 0);

    return { salesVsCollection, paymentModes, COLORS, outstandingBreakdown };
  }, [allInvoices, allPayments, startDate, endDate]);

  // Data for Top Products Report
  const topProductsData = React.useMemo(() => {
    if (reportType !== "TOP_PRODUCTS") return [];
    
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const productMap: Record<string, { quantity: number, revenue: number }> = {};

    allInvoices.forEach(inv => {
      const d = new Date(inv.invoiceDate || inv.createdAt);
      if (d >= start && d <= end && inv.items) {
        inv.items.forEach((item: any) => {
          const name = item.productName || "Unknown Product";
          if (!productMap[name]) productMap[name] = { quantity: 0, revenue: 0 };
          productMap[name].quantity += item.quantity || 0;
          productMap[name].revenue += item.lineTotal || 0;
        });
      }
    });

    return Object.keys(productMap)
      .map(k => ({ name: k, quantity: productMap[k].quantity, revenue: productMap[k].revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [allInvoices, startDate, endDate, reportType]);

  // Top Level KPI Metrics
  const kpiMetrics = React.useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let totalInvoiced = 0;
    let totalOutstanding = 0;
    allInvoices.forEach(inv => {
      const d = new Date(inv.invoiceDate || inv.createdAt);
      if (d >= start && d <= end) {
        totalInvoiced += (inv.grandTotal || 0);
        totalOutstanding += (inv.balanceAmount || 0);
      }
    });

    let totalCollected = 0;
    allPayments.forEach(pay => {
      const d = new Date(pay.paymentDate || pay.createdAt);
      if (d >= start && d <= end) {
        totalCollected += (pay.amount || 0);
      }
    });

    return { totalInvoiced, totalCollected, totalOutstanding };
  }, [allInvoices, allPayments, startDate, endDate]);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 shrink-0 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 z-10 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Business Reports
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                Generate and export financial statements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handlePrint}
              variant="outline"
              className="font-bold text-xs h-10 px-3 md:px-4 rounded-xl border-border hover:bg-muted"
            >
              <Download className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> <span className="hidden md:inline">Export / Print</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden animate-fadeIn">
              {/* Total Invoiced */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-blue-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Invoiced</span>
                    <span className="text-3xl font-black text-foreground tracking-tight block">{formatCurrency(kpiMetrics.totalInvoiced)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Collected */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-emerald-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Collected</span>
                    <span className="text-3xl font-black text-emerald-500 tracking-tight block">{formatCurrency(kpiMetrics.totalCollected)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Outstanding */}
              <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-amber-500/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Outstanding Balance</span>
                    <span className="text-3xl font-black text-amber-500 tracking-tight block">{formatCurrency(kpiMetrics.totalOutstanding)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Controls */}
            <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden print:hidden animate-fadeIn">
              <div className="p-4 border-b border-border bg-muted/10 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">Report Parameters</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-foreground/80 uppercase tracking-widest">Report Type</label>
                    <Select value={reportType} onValueChange={(val: ReportType) => setReportType(val)}>
                      <SelectTrigger className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm font-semibold outline-none focus:ring-1 focus:ring-primary [&>span]:truncate flex">
                        <SelectValue placeholder="Select Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DASHBOARD_OVERVIEW">Dashboard Overview (Charts & Analytics)</SelectItem>
                        <SelectItem value="SALES_SUMMARY">Sales Summary (Invoices Issued)</SelectItem>
                        <SelectItem value="PAYMENT_COLLECTIONS">Payment Collections (Revenue Received)</SelectItem>
                        <SelectItem value="OUTSTANDING_INVOICES">Outstanding Balances (Pending Dues)</SelectItem>
                        <SelectItem value="TOP_PRODUCTS">Top Selling Products (Performance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Start Date</label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        onClick={(e) => {
                          try { (e.target as HTMLInputElement).showPicker() } catch(err){} 
                        }}
                        className="h-11 pl-10 pr-4 rounded-xl text-sm font-semibold cursor-pointer dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full" 
                      />
                      <Calendar className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-1">End Date</label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                        onClick={(e) => {
                          try { (e.target as HTMLInputElement).showPicker() } catch(err){} 
                        }}
                        className="h-11 pl-10 pr-4 rounded-xl text-sm font-semibold cursor-pointer dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full" 
                      />
                      <Calendar className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex sm:justify-end">
                  {reportType !== "DASHBOARD_OVERVIEW" && reportType !== "TOP_PRODUCTS" && (
                  <Button onClick={() => fetchBackendReport(page)} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-xs font-bold rounded-xl h-10 px-6 w-full sm:w-auto">
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Engine
                  </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Chart (Only for Sales Summary) */}
            {reportType === "SALES_SUMMARY" && reportData.length > 0 && (
              <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden print:hidden animate-fadeIn">
                <div className="p-6 border-b border-border bg-muted/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary" />
                      Monthly Sales Trend
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Daily revenue distribution for the selected period</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: "rgba(128, 128, 128, 0.15)" }}
                          contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Chart (For Top Products) */}
            {reportType === "TOP_PRODUCTS" && topProductsData.length > 0 && (
              <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden print:hidden animate-fadeIn">
                <div className="p-6 border-b border-border bg-muted/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary" />
                      Top 5 Products by Revenue
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Best performing items for the selected period</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `₹${val}`} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: "bold" }} width={120} />
                        <Tooltip 
                          cursor={{ fill: "rgba(128, 128, 128, 0.15)" }}
                          contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(value: any) => [formatCurrency(Number(value)), "Total Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard Overview Charts */}
            {reportType === "DASHBOARD_OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn print:hidden">
                {/* Chart 1: Sales vs Collections */}
                <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden lg:col-span-2">
                  <div className="p-6 border-b border-border bg-muted/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        Sales vs Collections
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">Comparison of invoiced amount vs actual receipts</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dashboardData.salesVsCollection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `₹${value}`} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value: any) => [formatCurrency(Number(value))]} />
                          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                          <Bar yAxisId="left" dataKey="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          <Line yAxisId="left" type="monotone" dataKey="Collections" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart 2: Payment Modes */}
                <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/5">
                    <h2 className="text-lg font-black text-foreground tracking-tight">Payment Modes</h2>
                    <p className="text-xs text-muted-foreground mt-1">Distribution of received funds</p>
                  </div>
                  <CardContent className="p-6 flex items-center justify-center">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dashboardData.paymentModes} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {dashboardData.paymentModes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={dashboardData.COLORS[index % dashboardData.COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} formatter={(value: any) => [formatCurrency(Number(value))]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart 3: Outstanding Breakdown */}
                <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/5">
                    <h2 className="text-lg font-black text-foreground tracking-tight">Outstanding Balance</h2>
                    <p className="text-xs text-muted-foreground mt-1">Status of pending payments</p>
                  </div>
                  <CardContent className="p-6 flex items-center justify-center">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dashboardData.outstandingBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {dashboardData.outstandingBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} formatter={(value: any) => [formatCurrency(Number(value))]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Generated Report View */}
            {reportType !== "DASHBOARD_OVERVIEW" && (
            <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden print:border-none print:shadow-none animate-fadeIn">
              <div className="p-6 border-b border-border bg-muted/5 flex items-center justify-between print:border-b-2 print:border-black">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">
                    {reportType === "SALES_SUMMARY" && "Sales Summary Report"}
                    {reportType === "PAYMENT_COLLECTIONS" && "Payment Collections Ledger"}
                    {reportType === "OUTSTANDING_INVOICES" && "Outstanding Dues Statement"}
                    {reportType === "TOP_PRODUCTS" && "Top Selling Products Ledger"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center print:hidden">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      {reportType === "TOP_PRODUCTS" ? (
                        <>
                          <TableHead className="font-bold py-4">Rank</TableHead>
                          <TableHead className="font-bold py-4">Product / Service</TableHead>
                          <TableHead className="font-bold py-4 text-center">Units Sold</TableHead>
                          <TableHead className="text-right font-bold py-4">Total Revenue Generated</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="font-bold py-4">Date</TableHead>
                          <TableHead className="font-bold py-4">Reference No.</TableHead>
                          <TableHead className="font-bold py-4">Customer / Entity</TableHead>
                          <TableHead className="font-bold py-4">Status / Type</TableHead>
                          <TableHead className="text-right font-bold py-4">Amount</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportType === "TOP_PRODUCTS" ? (
                      topProductsData.length > 0 ? (
                        topProductsData.map((row, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="text-xs font-bold text-muted-foreground whitespace-nowrap w-16">
                              #{idx + 1}
                            </TableCell>
                            <TableCell className="font-bold text-sm">{row.name}</TableCell>
                            <TableCell className="text-center font-semibold text-sm">
                              {row.quantity}
                            </TableCell>
                            <TableCell className="text-right font-black text-sm">
                              {formatCurrency(row.revenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-[400px]">
                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-10 h-10 text-muted-foreground opacity-50" />
                              </div>
                              <h3 className="text-xl font-black text-foreground mb-2">No Products Sold</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                There are no top-selling products matching your current date filters.
                              </p>
                              <Button onClick={resetToThisMonth} variant="outline" className="font-bold">
                                Reset to This Month
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ) : reportData.length > 0 ? (
                      reportData.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell className="font-bold text-sm">{row.reference}</TableCell>
                          <TableCell className="font-semibold text-sm max-w-[200px] truncate" title={row.entity}>{row.entity}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClasses(row.status)}`}>
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-black text-sm">
                            {formatCurrency(row.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-[400px]">
                          {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                              <span className="text-sm font-semibold text-muted-foreground animate-pulse">Running analytics engine...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5 text-center">
                              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-10 h-10 text-muted-foreground opacity-50" />
                              </div>
                              <h3 className="text-xl font-black text-foreground mb-2">No Data Available</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                Try adjusting your date filters or report type to find the records you're looking for.
                              </p>
                              <Button onClick={resetToThisMonth} variant="outline" className="font-bold">
                                Reset to This Month
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {reportType !== "TOP_PRODUCTS" && totalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between bg-card text-sm print:hidden">
                    <span className="text-muted-foreground font-semibold">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>Previous</Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Totals Footer */}
                {(reportType === "TOP_PRODUCTS" ? topProductsData : reportData).length > 0 && (
                  <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row justify-end items-center gap-2 sm:gap-6">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">
                      {reportType === "TOP_PRODUCTS" ? "Total Revenue Listed" : "Page Total Valuation"}
                    </span>
                    <span className="text-xl font-black text-primary">
                      {formatCurrency((reportType === "TOP_PRODUCTS" ? topProductsData : reportData).reduce((sum, r) => sum + ((reportType === "TOP_PRODUCTS" ? r.revenue : r.amount) || 0), 0))}
                    </span>
                  </div>
                )}
              </div>
            </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}





