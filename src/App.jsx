import { Routes, Route, Navigate } from 'react-router-dom';
import ClientTypeSelector from './components/ClientTypeSelector';
import EligibilityGate from './components/EligibilityGate';
import BasicsForm from './components/BasicsForm';
import AddressForm from './components/AddressForm';
import UboForm from './components/UboForm';
import ActivityForm from './components/ActivityForm';
import WalletVerification from './components/WalletVerification';
import ReviewSummary from './components/ReviewSummary';

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background gradient decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          {/* Step 1: Client Type Selection */}
          <Route path="/" element={<ClientTypeSelector />} />

          {/* Step 2: Eligibility Screening */}
          <Route path="/eligibility" element={<EligibilityGate />} />

          {/* Step 3: Basic Information */}
          <Route path="/basics" element={<BasicsForm />} />

          {/* Step 4: Address */}
          <Route path="/address" element={<AddressForm />} />

          {/* Step 5: Beneficial Ownership / Identity Verification */}
          <Route path="/ownership" element={<UboForm />} />

          {/* Step 6: Expected Activity */}
          <Route path="/activity" element={<ActivityForm />} />

          {/* Step 7: Wallet Verification */}
          <Route path="/wallet" element={<WalletVerification />} />

          {/* Step 8: Review & Submit */}
          <Route path="/review" element={<ReviewSummary />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 text-center bg-gradient-to-t from-gray-950 to-transparent pointer-events-none">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Arqitech. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
