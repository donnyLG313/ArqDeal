import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { FiUser, FiBriefcase, FiArrowRight, FiShield } from 'react-icons/fi';

export default function ClientTypeSelector() {
  const navigate = useNavigate();
  const { state, updateState, nextStep } = useOnboarding();
  const [clientType, setClientType] = useState(state.clientType || '');
  const [safeDisclaimer, setSafeDisclaimer] = useState(state.safeDisclaimer || false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!clientType) {
      setError('Please select a client type to continue.');
      return;
    }
    if (!safeDisclaimer) {
      setError('Please acknowledge the disclaimer to continue.');
      return;
    }

    updateState({
      clientType,
      safeDisclaimer,
      currentStep: 2,
    });
    navigate('/eligibility');
  };

  const clientTypes = [
    {
      id: 'individual',
      title: 'Individual',
      subtitle: 'High-Net-Worth Person',
      description: 'Personal account for qualified individual investors',
      icon: FiUser,
    },
    {
      id: 'entity',
      title: 'Company / Entity',
      subtitle: 'Family Office / Trust',
      description: 'Business account for companies, funds, family offices, or trusts',
      icon: FiBriefcase,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo & Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/20">
          <span className="text-2xl font-bold text-white">A</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to Arqitech
        </h1>
        <p className="text-xl text-gray-400 max-w-md mx-auto">
          Institutional-grade OTC trading for digital assets
        </p>
      </div>

      {/* Client Type Cards */}
      <div className="w-full max-w-2xl space-y-4 mb-8 animate-slide-up">
        <h2 className="text-lg font-medium text-gray-300 text-center mb-6">
          Select your account type
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {clientTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = clientType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => {
                  setClientType(type.id);
                  setError('');
                }}
                className={`
                  relative p-6 rounded-xl border-2 text-left transition-all duration-300
                  ${isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900'
                  }
                `}
                aria-pressed={isSelected}
              >
                {/* Selection indicator */}
                <div
                  className={`
                    absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300
                    flex items-center justify-center
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-600 bg-transparent'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                <div
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                    ${isSelected
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-gray-800 text-gray-400'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {type.title}
                </h3>
                <p className="text-sm text-indigo-400 mb-2">
                  {type.subtitle}
                </p>
                <p className="text-sm text-gray-500">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SAFE Disclaimer */}
      <div className="w-full max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-2">
                Important Disclosure
              </h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                I acknowledge that this is not a securities offering or investment advice.
                Arqitech provides over-the-counter trading services for digital assets.
                Digital asset trading involves substantial risk of loss and is not suitable
                for all investors. Past performance is not indicative of future results.
                I confirm that I am not acting on behalf of any regulatory authority or
                government entity, and I am engaging with Arqitech for legitimate
                commercial purposes.
              </p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={safeDisclaimer}
                    onChange={(e) => {
                      setSafeDisclaimer(e.target.checked);
                      setError('');
                    }}
                    className="sr-only"
                    aria-describedby="disclaimer-text"
                  />
                  <div
                    className={`
                      w-5 h-5 rounded border-2 transition-all duration-200
                      flex items-center justify-center
                      ${safeDisclaimer
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-600 group-hover:border-gray-500'
                      }
                    `}
                  >
                    {safeDisclaimer && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span id="disclaimer-text" className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  I have read and acknowledge this disclosure
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-2xl mb-4 animate-fade-in">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={handleContinue}
          disabled={!clientType || !safeDisclaimer}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          <span>Continue</span>
          <FiArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          By continuing, you agree to our{' '}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
