import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import { RESTRICTED_TYPES } from '../constants/formOptions';
import { FiArrowLeft, FiArrowRight, FiAlertTriangle, FiX, FiMail } from 'react-icons/fi';

export default function EligibilityGate() {
  const navigate = useNavigate();
  const { state, updateState, updateEligibility } = useOnboarding();
  const [checkedItems, setCheckedItems] = useState(state.eligibility.checkedItems || []);
  const [noneOfAbove, setNoneOfAbove] = useState(state.eligibility.noneOfAbove || false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no client type selected
  useEffect(() => {
    if (!state.clientType) {
      navigate('/');
    }
  }, [state.clientType, navigate]);

  const handleCheckItem = (itemId) => {
    if (noneOfAbove) {
      setNoneOfAbove(false);
    }

    const newCheckedItems = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];

    setCheckedItems(newCheckedItems);
    setError('');
  };

  const handleNoneOfAbove = () => {
    if (checkedItems.length > 0) {
      setCheckedItems([]);
    }
    setNoneOfAbove(!noneOfAbove);
    setError('');
  };

  const handleContinue = () => {
    if (checkedItems.length > 0) {
      setShowRejectionModal(true);
      return;
    }

    if (!noneOfAbove) {
      setError('Please confirm that none of the above apply to you.');
      return;
    }

    updateEligibility({
      completed: true,
      noneOfAbove: true,
      checkedItems: [],
    });
    updateState({ currentStep: 3 });
    navigate('/basics');
  };

  const handleBack = () => {
    updateState({ currentStep: 1 });
    navigate('/');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-3">
            Eligibility Screening
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            To comply with regulatory requirements, please confirm that none of the
            following prohibited categories apply to you or your organization.
          </p>
        </div>

        {/* Restricted Types List */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Prohibited Categories</h2>
              <p className="text-sm text-gray-500">Select all that apply, or confirm none apply</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
            {RESTRICTED_TYPES.map((type) => {
              const isChecked = checkedItems.includes(type.id);

              return (
                <label
                  key={type.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border cursor-pointer
                    transition-all duration-200 group
                    ${isChecked
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckItem(type.id)}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded border-2 transition-all duration-200
                        flex items-center justify-center
                        ${isChecked
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-600 group-hover:border-gray-500'
                        }
                      `}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${isChecked ? 'text-red-300' : 'text-gray-200'}`}>
                      {type.label}
                    </span>
                    <p className={`text-xs mt-1 ${isChecked ? 'text-red-400/70' : 'text-gray-500'}`}>
                      {type.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-500">OR</span>
            </div>
          </div>

          {/* None of the Above */}
          <label
            className={`
              flex items-center gap-4 p-4 rounded-lg border cursor-pointer
              transition-all duration-200 group
              ${noneOfAbove
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
              }
            `}
          >
            <input
              type="checkbox"
              checked={noneOfAbove}
              onChange={handleNoneOfAbove}
              className="sr-only"
            />
            <div
              className={`
                w-5 h-5 rounded border-2 transition-all duration-200
                flex items-center justify-center
                ${noneOfAbove
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-600 group-hover:border-gray-500'
                }
              `}
            >
              {noneOfAbove && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className={`text-sm font-semibold ${noneOfAbove ? 'text-green-300' : 'text-gray-200'}`}>
                None of the above apply to me
              </span>
              <p className={`text-xs mt-1 ${noneOfAbove ? 'text-green-400/70' : 'text-gray-500'}`}>
                I confirm that I am not part of any prohibited category listed above
              </p>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleBack}
            className="btn-secondary flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Unable to Proceed
            </h3>
            <p className="text-gray-400 mb-6">
              Based on your selections, we are unable to onboard you at this time.
              Arqitech is committed to regulatory compliance and cannot provide
              services to prohibited categories.
            </p>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">
                If you believe this is an error or would like to discuss your
                situation, please contact our compliance team:
              </p>
              <a
                href="mailto:compliance@arqitech.com"
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <FiMail className="w-4 h-4" />
                <span>compliance@arqitech.com</span>
              </a>
            </div>

            <button
              onClick={() => {
                setShowRejectionModal(false);
                setCheckedItems([]);
              }}
              className="btn-secondary w-full"
            >
              Go Back and Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
