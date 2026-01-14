import { useOnboarding } from '../contexts/OnboardingContext';
import { FiCheck } from 'react-icons/fi';

export default function ProgressStepper() {
  const { state, getStepCount, getStepLabel, setStep } = useOnboarding();
  const totalSteps = getStepCount();
  const currentStep = state.currentStep;

  const canNavigateToStep = (step) => {
    // Can always go back to previous steps
    if (step < currentStep) return true;
    // Cannot skip ahead
    return false;
  };

  const handleStepClick = (step) => {
    if (canNavigateToStep(step)) {
      setStep(step);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-indigo-400">
            {getStepLabel(currentStep)}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isClickable = canNavigateToStep(step);

            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                {/* Step circle */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full
                    font-medium text-sm transition-all duration-300
                    ${isCompleted
                      ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500'
                      : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30'
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }
                    ${isClickable && !isCurrent ? 'hover:scale-110' : ''}
                    ${!isClickable && !isCurrent ? 'cursor-not-allowed' : ''}
                  `}
                  aria-label={`${getStepLabel(step)} - ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </button>

                {/* Step label (below circle) */}
                <div className="absolute mt-14 -ml-4 w-24 text-center">
                  <span
                    className={`text-xs font-medium ${
                      isCompleted || isCurrent ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {getStepLabel(step)}
                  </span>
                </div>

                {/* Connector line */}
                {step < totalSteps && (
                  <div className="flex-1 mx-2">
                    <div className="h-0.5 w-full bg-gray-800 rounded">
                      <div
                        className={`h-full bg-indigo-600 rounded transition-all duration-500 ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Spacer for labels */}
        <div className="h-8" />
      </div>
    </div>
  );
}
