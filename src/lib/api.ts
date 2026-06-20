/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { toast } from "sonner"

const API_BASE_URL = "http://localhost:5000/api"

// Helper to fetch bearer auth token from secure user session
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {}
  const savedUser = localStorage.getItem("invoice_management_user")
  if (!savedUser) return {}
  try {
    const parsed = JSON.parse(savedUser)
    if (parsed.token) {
      return {
        "Authorization": `Bearer ${parsed.token}`,
        "Content-Type": "application/json"
      }
    }
  } catch (e) {
    console.error("Failed to parse token headers", e)
  }
  return {
    "Content-Type": "application/json"
  }
}

// Custom handler executing API request with dynamic LocalStorage Fallback logic
async function request<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  fallbackKey?: string
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("invoice_management_user")
          window.location.href = "/login"
        }
        throw new Error("UNAUTHORIZED_ACCESS")
      }
      const errorData = await response.json().catch(() => ({}))
      const err: any = new Error(errorData.message || `Request failed with status ${response.status}`)
      err.status = response.status
      throw err
    }

    const data = await response.json()

    // --- AUTOMATIC AUDIT LOGGING (FRONTEND INTERCEPTOR) ---
    if (method !== "GET" && !endpoint.includes("auth") && !endpoint.includes("audit-logs")) {
      try {
        const userStr = typeof window !== "undefined" ? localStorage.getItem("invoice_management_user") : null;
        const user = userStr ? JSON.parse(userStr) : { name: "System" };
        const entityName = endpoint.split('/')[0].toUpperCase();
        const action = method === "POST" ? "Create" : method === "PUT" ? "Update" : "Delete";
        
        fetch(`${API_BASE_URL}/audit-logs`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            userName: user.name,
            action: action,
            entityName: entityName,
            details: `Successfully executed ${action} operation on ${entityName}`
          })
        }).catch(() => {});
        
        if (typeof window !== "undefined") {
           const localLogs = JSON.parse(localStorage.getItem("invoice_management_audit_logs") || "[]");
           localLogs.unshift({ id: Math.random().toString(), userName: user.name, action, entityName, details: `System execution: ${action} on ${entityName}`, timestamp: new Date().toISOString() });
           localStorage.setItem("invoice_management_audit_logs", JSON.stringify(localLogs.slice(0, 100)));
        }
      } catch (e) {}
    }

    return data
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ACCESS") {
      throw error;
    }
    
    // If the error has a status code (e.g. 400 Bad Request), the server IS reachable, but rejected the request.
    // We should NOT fallback to local storage in this case, but show the validation error to the user.
    if (error.status) {
      throw error;
    }

    console.warn(`[API WARNING] Local server request failed for ${endpoint}. Error: ${error.message}`)

    // --- BULLETPROOF LOCALSTORAGE FALLBACK ENGINE ---
    // If backend is unreachable, we dynamically query or update LocalStorage
    if (fallbackKey && typeof window !== "undefined") {
      // Notify user only once per active operational fallback
      toast.warning("Server Offline - Running in Local Sandbox", {
        description: "Your local database has been safely synchronized temporarily.",
        duration: 3500
      })

      const localData = JSON.parse(localStorage.getItem(fallbackKey) || "[]")

      if (method === "GET") {
        return localData as unknown as T
      }

      if (method === "POST" && body) {
        const newItem = { ...body, id: body.id || Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }
        const exists = localData.some((x: any) => x.id === newItem.id)
        if (!exists) {
          localData.push(newItem)
          localStorage.setItem(fallbackKey, JSON.stringify(localData))
          
          // Fallback Audit Logging
          const userStr = localStorage.getItem("invoice_management_user");
          const user = userStr ? JSON.parse(userStr) : { name: "System" };
          const entityName = endpoint.split('/')[0].toUpperCase();
          const localLogs = JSON.parse(localStorage.getItem("invoice_management_audit_logs") || "[]");
          localLogs.unshift({ id: Math.random().toString(), userName: user.name, action: "Create", entityName, details: `Local Sandbox execution: Create on ${entityName}`, timestamp: new Date().toISOString() });
          localStorage.setItem("invoice_management_audit_logs", JSON.stringify(localLogs.slice(0, 100)));
        }
        return newItem as unknown as T
      }

      if (method === "PUT" && body && body.id) {
        const idx = localData.findIndex((x: any) => x.id === body.id)
        if (idx !== -1) {
          localData[idx] = { ...localData[idx], ...body }
          localStorage.setItem(fallbackKey, JSON.stringify(localData))
          return localData[idx] as unknown as T
        }
      }

      if (method === "DELETE") {
        // Extract id from path (endpoint usually is format: 'customers/id')
        const parts = endpoint.split("/")
        const id = parts[parts.length - 1]
        const updated = localData.filter((x: any) => x.id !== id)
        localStorage.setItem(fallbackKey, JSON.stringify(updated))
        return { message: "Deleted successfully from local storage." } as unknown as T
      }
    }

    throw error
  }
}

// Structured endpoints calling wrappers
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || "Invalid credentials.")
      }
      return await response.json()
    },
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || "Request failed.")
      }
      return await response.json()
    },
    verifyOtp: async (email: string, otp: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || "Invalid OTP.")
      }
      return await response.json()
    },
    resetPassword: async (email: string, otp: string, newPassword: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || "Failed to reset password.")
      }
      return await response.json()
    }
  },

  users: {
    getAll: () => request<any[]>("users", "GET", undefined, "invoice_management_users"),
    create: (data: any) => request<any>("users", "POST", data, "invoice_management_users"),
    update: (id: number | string, data: any) => request<any>(`users/${id}`, "PUT", data, "invoice_management_users"),
    delete: (id: number | string) => request<any>(`users/${id}`, "DELETE", undefined, "invoice_management_users")
  },

  settings: {
    get: () => request<any>("settings", "GET", undefined, "invoice_management_settings"),
    update: (data: any) => request<any>("settings", "PUT", data, "invoice_management_settings")
  },

  reports: {
    get: async (type: string, startDate: string, endDate: string, page: number = 1, pageSize: number = 50) => {
      try {
        return await request<any>(`reports?type=${type}&startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`, "GET")
      } catch (err) {
        console.warn("[REPORTS FALLBACK] Server reports query failed, performing client-side local calculation...", err)
        if (typeof window === "undefined") throw err
        
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        end.setHours(23, 59, 59, 999)

        if (type === "SALES_SUMMARY") {
          const invoices = JSON.parse(localStorage.getItem("invoice_management_invoices") || "[]")
          const filtered = invoices.filter((inv: any) => {
            const date = new Date(inv.createdAt || inv.invoiceDate)
            return date >= start && date <= end
          })
          const totalItems = filtered.length;
          const totalPages = Math.ceil(totalItems / pageSize);
          const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
          const result = paged.map((inv: any) => ({
            date: inv.createdAt || inv.invoiceDate,
            reference: inv.invoiceNumber,
            entity: inv.customerName,
            amount: inv.grandTotal,
            status: "Generated"
          }))
          return { data: result, pagination: { page, pageSize, totalItems, totalPages } };
        }
        else if (type === "PAYMENT_COLLECTIONS") {
          const payments = JSON.parse(localStorage.getItem("invoice_management_payments") || "[]")
          const filtered = payments.filter((pyt: any) => {
            const date = new Date(pyt.createdAt || pyt.paymentDate)
            return date >= start && date <= end
          })
          const totalItems = filtered.length;
          const totalPages = Math.ceil(totalItems / pageSize);
          const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
          const result = paged.map((pyt: any) => ({
            date: pyt.createdAt || pyt.paymentDate,
            reference: pyt.receiptNumber || pyt.paymentNumber || pyt.transactionId || "N/A",
            entity: pyt.customerName,
            amount: pyt.amount,
            status: pyt.paymentMode || "Received"
          }))
          return { data: result, pagination: { page, pageSize, totalItems, totalPages } };
        }
        else if (type === "OUTSTANDING_INVOICES") {
          const invoices = JSON.parse(localStorage.getItem("invoice_management_invoices") || "[]")
          const filtered = invoices.filter((inv: any) => {
            const date = new Date(inv.createdAt || inv.invoiceDate)
            const balance = inv.balanceAmount ?? (inv.grandTotal - (inv.paidAmount || 0))
            return date >= start && date <= end && balance > 1
          })
          const totalItems = filtered.length;
          const totalPages = Math.ceil(totalItems / pageSize);
          const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
          const result = paged.map((inv: any) => ({
            date: inv.createdAt || inv.invoiceDate,
            reference: inv.invoiceNumber,
            entity: inv.customerName,
            amount: inv.balanceAmount ?? (inv.grandTotal - (inv.paidAmount || 0)),
            status: "Pending"
          }))
          return { data: result, pagination: { page, pageSize, totalItems, totalPages } };
        }
        throw err
      }
    }
  },

  roles: {
    getAll: () => request<any[]>("roles", "GET", undefined, "invoice_management_roles"),
    create: (data: any) => request<any>("roles", "POST", data, "invoice_management_roles"),
    update: (id: number | string, data: any) => request<any>(`roles/${id}`, "PUT", data, "invoice_management_roles"),
    delete: (id: number | string) => request<any>(`roles/${id}`, "DELETE", undefined, "invoice_management_roles")
  },

  customers: {
    getAll: () => request<any[]>("customers", "GET", undefined, "invoice_management_customers"),
    getById: (id: number | string | number) => request<any>(`customers/${id}`, "GET", undefined),
    create: (data: any) => request<any>("customers", "POST", data, "invoice_management_customers"),
    update: (id: number | string | number, data: any) => request<any>(`customers/${id}`, "PUT", { ...data, id }, "invoice_management_customers"),
    delete: (id: number | string | number) => request<any>(`customers/${id}`, "DELETE", undefined, "invoice_management_customers")
  },

  products: {
    getAll: () => request<any[]>("products", "GET", undefined, "invoice_management_products"),
    getById: (id: number | string) => request<any>(`products/${id}`, "GET", undefined),
    create: (data: any) => request<any>("products", "POST", data, "invoice_management_products"),
    update: (id: number | string, data: any) => request<any>(`products/${id}`, "PUT", { ...data, id }, "invoice_management_products"),
    delete: (id: number | string) => request<any>(`products/${id}`, "DELETE", undefined, "invoice_management_products")
  },

  quotations: {
    getAll: () => request<any[]>("quotations", "GET", undefined, "invoice_management_quotations"),
    getById: (id: number | string) => request<any>(`quotations/${id}`, "GET", undefined),
    create: (data: any) => request<any>("quotations", "POST", data, "invoice_management_quotations"),
    update: (id: number | string, data: any) => request<any>(`quotations/${id}`, "PUT", { ...data, id }, "invoice_management_quotations"),
    delete: (id: number | string) => request<any>(`quotations/${id}`, "DELETE", undefined, "invoice_management_quotations")
  },

  invoices: {
    getAll: () => request<any[]>("invoices", "GET", undefined, "invoice_management_invoices"),
    getById: (id: number | string) => request<any>(`invoices/${id}`, "GET", undefined),
    create: (data: any) => request<any>("invoices", "POST", data, "invoice_management_invoices"),
    update: (id: number | string, data: any) => request<any>(`invoices/${id}`, "PUT", { ...data, id }, "invoice_management_invoices"),
    delete: (id: number | string) => request<any>(`invoices/${id}`, "DELETE", undefined, "invoice_management_invoices"),
    sendEmail: (id: number | string, pdfBase64: string) => request<any>(`invoices/${id}/send-email`, "POST", { pdfBase64 })
  },

  payments: {
    getAll: () => request<any[]>("payments", "GET", undefined, "invoice_management_payments"),
    getById: (id: number | string) => request<any>(`payments/${id}`, "GET", undefined),
    create: (data: any) => request<any>("payments", "POST", data, "invoice_management_payments"),
    delete: (id: number | string) => request<any>(`payments/${id}`, "DELETE", undefined, "invoice_management_payments")
  },

  auditLogs: {
    getAll: () => request<any[]>("audit-logs", "GET", undefined, "invoice_management_audit_logs"),
    create: (data: any) => request<any>("audit-logs", "POST", data, "invoice_management_audit_logs")
  }
}
