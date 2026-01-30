'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import MyCommitmentsHeader from '@/components/MyCommitmentsHeader'
import MyCommitmentsOverview from '@/components/MyCommitmentsOverview/MyCommitmentsOverview'
import CommitmentEarlyExitModal from '@/components/CommitmentEarlyExitModal/CommitmentEarlyExitModal'
import styles from './page.module.css'

// TODO: Replace with actual data from contracts
const mockCommitments = [
  {
    id: '1',
    type: 'Balanced',
    amount: '100000',
    duration: 60,
    maxLoss: 8,
    status: 'active',
    createdAt: '2024-01-15',
    expiresAt: '2024-03-15',
    currentValue: '102000',
    complianceScore: 95,
  },
  {
    id: '2',
    type: 'Safe',
    amount: '50000',
    duration: 30,
    maxLoss: 2,
    status: 'active',
    createdAt: '2024-01-20',
    expiresAt: '2024-02-20',
    currentValue: '50100',
    complianceScore: 100,
  },
]

// Mock early-exit penalty: 10% of original amount (replace with contract logic)
function getEarlyExitValues(originalAmount: string) {
  const amount = Number(originalAmount)
  const penaltyPercent = 10
  const penaltyAmount = (amount * (penaltyPercent / 100)).toFixed(0)
  const netReceive = (amount - Number(penaltyAmount)).toFixed(0)
  return {
    penaltyPercent: `${penaltyPercent}%`,
    penaltyAmount: `${penaltyAmount} XLM`,
    netReceiveAmount: `${netReceive} XLM`,
  }
}

export default function MyCommitments() {
  const router = useRouter()
  const [earlyExitCommitmentId, setEarlyExitCommitmentId] = useState<string | null>(null)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')

  const commitmentForEarlyExit = mockCommitments.find((c) => c.id === earlyExitCommitmentId)
  const earlyExitSummary = commitmentForEarlyExit
    ? getEarlyExitValues(commitmentForEarlyExit.amount)
    : null

  const openEarlyExitModal = useCallback((id: string) => {
    setEarlyExitCommitmentId(id)
    setHasAcknowledged(false)
  }, [])

  const closeEarlyExitModal = useCallback(() => {
    setEarlyExitCommitmentId(null)
    setHasAcknowledged(false)
  }, [])

  const handleConfirmEarlyExit = useCallback(() => {
    if (!earlyExitCommitmentId) return
    // Parent would perform the transaction here
    closeEarlyExitModal()
  }, [earlyExitCommitmentId, closeEarlyExitModal])

  // Stats Data (Mocked)
  const stats = useMemo(() => ({
    totalActive: 3,
    totalCommittedValue: '$461,850',
    averageComplianceScore: '86%',
    totalFeesGenerated: '$1,250',
  }), [])

  // Filtered Commitments
  const filteredCommitments = useMemo(() => {
    return mockCommitments.filter((c) => {
      const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesType = typeFilter === 'All' || c.type.toLowerCase() === typeFilter.toLowerCase()
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  return (
    <main id="main-content">
      <MyCommitmentsHeader
        onBack={() => router.push('/')}
        onCreateNew={() => router.push('/create')}
      />

      <div className={styles.container}>
        <MyCommitmentsOverview
          stats={stats}
          search={{
            searchQuery,
            onSearchChange: setSearchQuery
          }}
          filters={{
            status: statusFilter,
            type: typeFilter,
            sortBy,
            onStatusChange: setStatusFilter,
            onTypeChange: setTypeFilter,
            onSortByChange: setSortBy
          }}
        />

        <div className={styles.resultsCount}>
          {filteredCommitments.length} {filteredCommitments.length === 1 ? 'commitment' : 'commitments'} found
        </div>
      </div>

      {commitmentForEarlyExit && earlyExitSummary && (
        <CommitmentEarlyExitModal
          isOpen={true}
          commitmentId={commitmentForEarlyExit.id}
          originalAmount={`${commitmentForEarlyExit.amount} XLM`}
          penaltyPercent={earlyExitSummary.penaltyPercent}
          penaltyAmount={earlyExitSummary.penaltyAmount}
          netReceiveAmount={earlyExitSummary.netReceiveAmount}
          hasAcknowledged={hasAcknowledged}
          onChangeAcknowledged={setHasAcknowledged}
          onCancel={closeEarlyExitModal}
          onConfirm={handleConfirmEarlyExit}
          onClose={closeEarlyExitModal}
        />
      )}
    </main>
  )
}