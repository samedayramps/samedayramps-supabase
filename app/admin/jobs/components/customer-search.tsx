"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { searchCustomers } from "../actions/search-actions"
import type { Database } from "@/database.types"

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void
  initialValue?: Customer | null
}

export function CustomerSearch({ onSelect, initialValue }: CustomerSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(initialValue ?? null)
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setSelectedCustomer(initialValue ?? null)
  }, [initialValue])

  const fetchCustomers = React.useCallback(async (searchTerm: string) => {
    try {
      setLoading(true)
      const data = await searchCustomers(searchTerm)
      setCustomers(data)
    } catch (error) {
      console.error("Error searching customers:", error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(search)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, fetchCustomers])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer ? (
            `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
          ) : (
            "Select customer..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search customers..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && customers.length === 0 && (
              <CommandEmpty>No customers found.</CommandEmpty>
            )}
            {!loading && customers.length > 0 && (
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      setSelectedCustomer(customer)
                      onSelect(customer)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.first_name} {customer.last_name}</span>
                      <span className="text-sm text-muted-foreground">{customer.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 