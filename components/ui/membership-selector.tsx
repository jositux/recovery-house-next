'use client'

import { useState, useEffect } from 'react'
import { MembershipCard } from '@/components/ui/membership-card'
import type { MembershipTag } from '@/services/membership-service'

interface MembershipSelectorProps {
  memberships: MembershipTag[]
  onSelectionChange: (selectedId: string | "") => void
  defaultSelectedId?: string
}

export function MembershipSelector({ 
  memberships,
  onSelectionChange,
  defaultSelectedId = ''
}: MembershipSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null)

  useEffect(() => {
    setSelectedId(defaultSelectedId || null)
  }, [defaultSelectedId])

  const handleSelect = (id: string) => {
    const newSelection = selectedId === id ? "" : id
    setSelectedId(newSelection)
    onSelectionChange(newSelection)
  }

  // Orden personalizado por nombre
  const membershipOrder = ['bronze', 'silver', 'gold']

  const sortedMemberships = [...memberships].sort((a, b) => {
    const indexA = membershipOrder.indexOf(a.name.toLowerCase())
    const indexB = membershipOrder.indexOf(b.name.toLowerCase())

    // Si no se encuentra el nombre en el arreglo, se coloca al final
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Tipo de membresia</h2>
      <div className="space-y-4">
        {sortedMemberships.map((membership) => (
          <MembershipCard
            key={membership.id}
            {...membership}
            isSelected={selectedId === membership.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}
