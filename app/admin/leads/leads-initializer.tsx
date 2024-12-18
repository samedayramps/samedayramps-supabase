"use client"

import { useEffect } from "react"
import { useLeadsStore } from "./use-leads-store"
import { RentalRequest } from "../crm/types"

interface LeadsInitializerProps {
  leads: RentalRequest[]
}

export function LeadsInitializer({ leads }: LeadsInitializerProps) {
  const setLeads = useLeadsStore((state) => state.setLeads)

  useEffect(() => {
    console.log('LeadsInitializer: Setting leads:', leads)
    
    if (Array.isArray(leads)) {
      setLeads(leads)
    }
  }, [leads, setLeads])

  console.log('LeadsInitializer: Current leads prop:', leads)

  return null
} 