import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'arqitech_onboarding_data';

const initialState = {
  currentStep: 1,
  clientType: null, // 'individual' or 'entity'
  safeDisclaimer: false,
  eligibility: {
    completed: false,
    noneOfAbove: false,
    checkedItems: [],
  },
  basics: {
    // Individual fields
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    citizenship: '',
    ssn: '',
    dob: '',
    // Entity fields
    legalBusinessName: '',
    hasDba: false,
    dbaName: '',
    countryOfIncorporation: '',
    stateOfIncorporation: '',
    ein: '',
    einDocumentUploaded: false,
    businessPhone: '',
    website: '',
    industry: '',
    activityDescription: '',
  },
  address: {
    country: 'US',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    hasSeparatePhysical: false,
    physicalCountry: 'US',
    physicalStreet1: '',
    physicalStreet2: '',
    physicalCity: '',
    physicalState: '',
    physicalZip: '',
  },
  ubo: {
    owners: [
      {
        id: 1,
        firstName: '',
        lastName: '',
        email: '',
        ownershipPercentage: '',
        isControlPerson: false,
        idUploaded: false,
        verified: false,
      },
    ],
    certified: false,
  },
  activity: {
    usageDescription: '',
    sourcesOfFunds: [],
    expectedTradeSize: '',
    monthlyVolume: '',
    operatingCountries: ['US'],
    highRiskAcknowledged: false,
  },
  wallet: {
    address: '',
    scanCompleted: false,
    scanResult: null,
  },
  submitted: false,
  submittedAt: null,
};

export function OnboardingProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved onboarding data:', e);
        }
      }
    }
    return initialState;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const updateBasics = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        ...updates,
      },
    }));
  }, []);

  const updateAddress = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        ...updates,
      },
    }));
  }, []);

  const updateUbo = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      ubo: {
        ...prev.ubo,
        ...updates,
      },
    }));
  }, []);

  const addOwner = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ubo: {
        ...prev.ubo,
        owners: [
          ...prev.ubo.owners,
          {
            id: Date.now(),
            firstName: '',
            lastName: '',
            email: '',
            ownershipPercentage: '',
            isControlPerson: false,
            idUploaded: false,
            verified: false,
          },
        ],
      },
    }));
  }, []);

  const updateOwner = useCallback((id, updates) => {
    setState((prev) => ({
      ...prev,
      ubo: {
        ...prev.ubo,
        owners: prev.ubo.owners.map((owner) =>
          owner.id === id ? { ...owner, ...updates } : owner
        ),
      },
    }));
  }, []);

  const removeOwner = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      ubo: {
        ...prev.ubo,
        owners: prev.ubo.owners.filter((owner) => owner.id !== id),
      },
    }));
  }, []);

  const updateActivity = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      activity: {
        ...prev.activity,
        ...updates,
      },
    }));
  }, []);

  const updateWallet = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        ...updates,
      },
    }));
  }, []);

  const updateEligibility = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        ...updates,
      },
    }));
  }, []);

  const setStep = useCallback((step) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getStepCount = useCallback(() => {
    return 8;
  }, []);

  const getStepLabel = useCallback((step) => {
    const labels = {
      1: 'Client Type',
      2: 'Eligibility',
      3: 'Basic Info',
      4: 'Address',
      5: 'Ownership',
      6: 'Activity',
      7: 'Wallet',
      8: 'Review',
    };
    return labels[step] || '';
  }, []);

  const value = {
    state,
    updateState,
    updateBasics,
    updateAddress,
    updateUbo,
    addOwner,
    updateOwner,
    removeOwner,
    updateActivity,
    updateWallet,
    updateEligibility,
    setStep,
    nextStep,
    prevStep,
    resetOnboarding,
    getStepCount,
    getStepLabel,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;
