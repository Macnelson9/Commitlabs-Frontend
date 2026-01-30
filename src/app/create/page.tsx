'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CreateCommitmentStepSelectType from '@/components/CreateCommitmentStepSelectType'
import CreateCommitmentStepReview from '@/components/CreateCommitmentStepReview';
import CommitmentCreatedModal from '@/components/modals/Commitmentcreatedmodal';

// Generate a random commitment ID (in production, this comes from the blockchain)
function generateCommitmentId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'CMT-';
  for (let i = 0; i < 7; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export default function CreateCommitment() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'safe' | 'balanced' | 'aggressive' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [commitmentId, setCommitmentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data based on selected type
  const getMockData = () => {
    switch (selectedType) {
      case 'safe':
        return {
          typeLabel: 'Safe Commitment',
          amount: '500 XLM',
          asset: 'XLM',
          durationDays: 30,
          maxLossPercent: 2,
          earlyExitPenalty: '5.00 XLM',
          estimatedFees: '0.10 XLM',
          estimatedYield: '5.2% APY',
          commitmentStart: 'Immediately',
          commitmentEnd: '2/28/2026'
        };
      case 'balanced':
        return {
          typeLabel: 'Balanced Commitment',
          amount: '1000 XLM',
          asset: 'XLM',
          durationDays: 60,
          maxLossPercent: 8,
          earlyExitPenalty: '20.00 XLM',
          estimatedFees: '0.50 XLM',
          estimatedYield: '12.5% APY',
          commitmentStart: 'Immediately',
          commitmentEnd: '3/30/2026'
        };
      case 'aggressive':
        return {
          typeLabel: 'Aggressive Commitment',
          amount: '2000 XLM',
          asset: 'XLM',
          durationDays: 90,
          maxLossPercent: 100, // Should probably handle "No protection" or similar logic in presentation if needed, but number is simpler
          earlyExitPenalty: '100.00 XLM',
          estimatedFees: '1.20 XLM',
          estimatedYield: '45.0% APY',
          commitmentStart: 'Immediately',
          commitmentEnd: '4/30/2026'
        };
      default:
        return {
          typeLabel: 'Unknown',
          amount: '0 XLM',
          asset: 'XLM',
          durationDays: 0,
          maxLossPercent: 0,
          earlyExitPenalty: '0 XLM',
          estimatedFees: '0 XLM',
          estimatedYield: '0%',
          commitmentStart: '-',
          commitmentEnd: '-'
        };
    }
  };

  const handleSelectType = (type: 'safe' | 'balanced' | 'aggressive') => {
    setSelectedType(type);
  };

  const handleNext = (type: 'safe' | 'balanced' | 'aggressive') => {
    // In production, we'd go to step 2. For now, we skip to step 3 per instructions/simplification
    // or simulate Step 2 completion.
    console.log('Selected commitment type:', type);
    setStep(3); // Skip straight to Review for this task
  };

  const handleBack = () => {
    if (step > 1) {
      // If we are on step 3 and want to go back, we might want to go to step 2 technically,
      // but since we skipped it, we go back to 1.
      setStep(1);
    } else {
      router.push('/');
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate transaction delay
    setTimeout(() => {
      setIsSubmitting(false);
      const newCommitmentId = generateCommitmentId();
      setCommitmentId(newCommitmentId);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleViewCommitment = () => {
    const numericId = commitmentId.split('-')[1] || '1';
    router.push(`/commitments/${numericId}`);
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setSelectedType(null);
    setStep(1);
    setCommitmentId('');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/commitments');
  };

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${commitmentId}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <>
      {/* Step 1 - Select Type */}
      {step === 1 && (
        <CreateCommitmentStepSelectType
          selectedType={selectedType}
          onSelectType={handleSelectType}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {/* Step 3 - Review */}
      {step === 3 && selectedType && (
        <CreateCommitmentStepReview
          {...getMockData()}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}

      {/* Success Modal */}
      <CommitmentCreatedModal
        isOpen={showSuccessModal}
        commitmentId={commitmentId}
        onViewCommitment={handleViewCommitment}
        onCreateAnother={handleCreateAnother}
        onClose={handleCloseModal}
        onViewOnExplorer={handleViewOnExplorer}
      />
    </>
  );
}
