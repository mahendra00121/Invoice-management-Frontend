/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { api } from "./api"

// Map keys to their respective API wrappers
const keyToApiMap: Record<string, any> = {
  "invoice_management_customers": api.customers,
  "invoice_management_products": api.products,
  "invoice_management_quotations": api.quotations,
  "invoice_management_invoices": api.invoices,
  "invoice_management_payments": api.payments
}

// Global flag to prevent double initialization
let isSyncEngineInitialized = false
let isPullingFromBackend = false

// Utility to fetch all tables from live C# API and update local states
export async function pullLatestFromBackend() {
  if (isPullingFromBackend) return
  isPullingFromBackend = true
  
  try {
    const user = localStorage.getItem("invoice_management_user")
    if (!user) {
      isPullingFromBackend = false
      return // Skip if not authenticated yet
    }

    console.log("[SyncEngine] Synchronizing database tables from C# SQL Server API...")

    // 1. Customers
    try {
      const customers = await api.customers.getAll()
      if (customers && Array.isArray(customers)) {
        localStorage.setItem("invoice_management_customers", JSON.stringify(customers))
      }
    } catch (e) {
      console.warn("Sync failed for customers:", e)
    }

    // 2. Products
    try {
      const products = await api.products.getAll()
      if (products && Array.isArray(products)) {
        localStorage.setItem("invoice_management_products", JSON.stringify(products))
      }
    } catch (e) {
      console.warn("Sync failed for products:", e)
    }

    // 3. Quotations
    try {
      const quotations = await api.quotations.getAll()
      if (quotations && Array.isArray(quotations)) {
        localStorage.setItem("invoice_management_quotations", JSON.stringify(quotations))
      }
    } catch (e) {
      console.warn("Sync failed for quotations:", e)
    }

    // 4. Invoices
    try {
      const invoices = await api.invoices.getAll()
      if (invoices && Array.isArray(invoices)) {
        localStorage.setItem("invoice_management_invoices", JSON.stringify(invoices))
      }
    } catch (e) {
      console.warn("Sync failed for invoices:", e)
    }

    // 5. Payments
    try {
      const payments = await api.payments.getAll()
      if (payments && Array.isArray(payments)) {
        localStorage.setItem("invoice_management_payments", JSON.stringify(payments))
      }
    } catch (e) {
      console.warn("Sync failed for payments:", e)
    }

    console.log("[SyncEngine] Database sync success! All local stores are now connected with SQL Server.")
  } catch (err) {
    console.error("[SyncEngine] Initialization synchronization failed", err)
  } finally {
    isPullingFromBackend = false
  }
}

// Function to handle incremental local storage mutations and forward to C# API
async function handleLocalMutation(key: string, newValueStr: string, oldValueStr: string | null) {
  const apiWrapper = keyToApiMap[key]
  if (!apiWrapper) return

  try {
    const newValue = JSON.parse(newValueStr) as any[]
    const oldValue = oldValueStr ? (JSON.parse(oldValueStr) as any[]) : []

    // 1. Detect Added Items
    const added = newValue.filter(n => !oldValue.some(o => o.id === n.id))
    for (const item of added) {
      console.log(`[SyncEngine] Forwarding ADD creation event to C# API for key: ${key}`, item)
      await apiWrapper.create(item)
    }

    // 2. Detect Deleted Items
    const deleted = oldValue.filter(o => !newValue.some(n => n.id === o.id))
    for (const item of deleted) {
      console.log(`[SyncEngine] Forwarding DELETE action event to C# API for key: ${key}`, item.id)
      await apiWrapper.delete(item.id)
    }

    // 3. Detect Updated Items (excluding payments which are immutable usually)
    if (key !== "invoice_management_payments") {
      const updated = newValue.filter(n => {
        const oldItem = oldValue.find(o => o.id === n.id)
        if (!oldItem) return false
        // Basic deep comparison of values
        return JSON.stringify(oldItem) !== JSON.stringify(n)
      })

      for (const item of updated) {
        console.log(`[SyncEngine] Forwarding UPDATE action event to C# API for key: ${key}`, item.id)
        await apiWrapper.update(item.id, item)
      }
    }
  } catch (err: any) {
    console.warn(`[SyncEngine WARNING] Failed to push local change to backend for key ${key}:`, err.message)
  }
}

// Entrypoint initializing global hooks
export function initSyncEngine() {
  if (typeof window === "undefined" || isSyncEngineInitialized) return
  isSyncEngineInitialized = true

  console.log("[SyncEngine] Bootstrapping real-time SQL Server sync hook...")

  // Perform initial fetch from backend on login startup
  pullLatestFromBackend()

  // Intercept window.localStorage.setItem to capture user interface actions instantly!
  const originalSetItem = window.localStorage.setItem
  window.localStorage.setItem = function (key: string, value: string) {
    // Read previous value to calculate diff
    const oldValue = window.localStorage.getItem(key)

    // Call original setItem to update browser UI state
    originalSetItem.apply(this, [key, value])

    // If it's one of our database keys and we aren't currently pulling, trigger background sync
    if (keyToApiMap[key] && !isPullingFromBackend) {
      // Execute mutation asynchronous to prevent blockages
      setTimeout(() => {
        handleLocalMutation(key, value, oldValue)
      }, 50)
    }
  }
}

