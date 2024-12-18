"use client"

import { create } from "zustand"
import { RentalRequest } from "../crm/types"

interface LeadsStore {
  leads: RentalRequest[]
  setLeads: (leads: RentalRequest[]) => void
  updateLead: (id: string, updates: Partial<RentalRequest>) => void
}

export const useLeadsStore = create<LeadsStore>((set) => ({
  leads: [],
  setLeads: (leads) => {
    console.log('useLeadsStore: Setting leads:', leads)
    set({ leads })
  },
  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      ),
    })),
})) 