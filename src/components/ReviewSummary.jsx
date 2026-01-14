import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import { completeHandoff } from '../mocks/handoffMock';
import { getRiskColor } from '../mocks/chainalysisMock';
import {
  COUNTRIES,
  US_STATES,
  INDUSTRIES,
  INDIVIDUAL_FUND_SOURCES,
  ENTITY_FUND_SOURCES,
  TRADE_SIZE_RANGES,
  MONTHLY_VOLUME_RANGES,
} from '../constants/formOptions';
import {
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiUsers,
  FiActivity,
  FiShield,
  FiLoader,
  FiCheckCircle,
  FiSend,
} from 'react-icons/fi';

function AccordionSection({ title, icon: Icon, children, defaultOpen = false, onEdit }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-0 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-indigo-400 hover:text-indigo-300 p-2 transition-colors"
              aria-label={`Edit ${title}`}
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}
          {isOpen ? (
            <FiChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-800 animate-slide-in">
          {children}
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value, className = '' }) {
  return (
    <div className={`flex justify-between py-2 ${className}`}>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-200 text-sm font-medium text-right">{value || '-'}</span>
    </div>
  );
}

export default function ReviewSummary() {
  const navigate = useNavigate();
  const { state, updateState, resetOnboarding } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(state.submitted);
  const [applicationId, setApplicationId] = useState(null);

  const isIndividual = state.clientType === 'individual';

  useEffect(() => {
    if (!state.clientType || state.currentStep < 8) {
      navigate('/');
    }
  }, [state.clientType, state.currentStep, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const result = await completeHandoff(state);

      if (result.success) {
        setApplicationId(result.applicationId);
        setSubmitted(true);
        updateState({
          submitted: true,
          submittedAt: new Date().toISOString(),
        });
        alert(`Profile handed off to bizdev team!\n\nApplication ID: ${result.applicationId}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    updateState({ currentStep: 7 });
    navigate('/wallet');
  };

  const handleStartNew = () => {
    resetOnboarding();
    navigate('/');
  };

  const getLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  const fundSources = isIndividual ? INDIVIDUAL_FUND_SOURCES : ENTITY_FUND_SOURCES;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Application Submitted</h1>
          <p className="text-gray-400 mb-6">
            Thank you for completing your onboarding application. Our business development
            team will review your information and contact you within 1-2 business days.
          </p>

          {applicationId && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm mb-1">Application Reference</p>
              <p className="text-xl font-mono text-indigo-400">{applicationId}</p>
            </div>
          )}

          <div className="space-y-3">
            <button onClick={handleStartNew} className="btn-primary w-full">
              Start New Application
            </button>
            <p className="text-sm text-gray-500">
              Questions? Contact us at{' '}
              <a href="mailto:support@arqitech.com" className="text-indigo-400 hover:text-indigo-300">
                support@arqitech.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
            <FiCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Review & Submit</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Please review your information before submitting. Click on any section to
            expand and verify the details.
          </p>
        </div>

        <div className="space-y-4">
          {/* Client Type */}
          <AccordionSection
            title={isIndividual ? 'Individual Account' : 'Entity Account'}
            icon={isIndividual ? FiUser : FiBriefcase}
            defaultOpen={true}
            onEdit={() => {
              updateState({ currentStep: 3 });
              navigate('/basics');
            }}
          >
            {isIndividual ? (
              <div className="space-y-1 divide-y divide-gray-800">
                <DataRow
                  label="Full Name"
                  value={`${state.basics.firstName} ${state.basics.middleName ? state.basics.middleName + ' ' : ''}${state.basics.lastName}${state.basics.suffix ? ' ' + state.basics.suffix : ''}`}
                />
                <DataRow label="Email" value={state.basics.email} />
                <DataRow
                  label="Phone"
                  value={`${state.basics.phoneCountryCode} ${state.basics.phone}`}
                />
                <DataRow
                  label="Citizenship"
                  value={getLabel(COUNTRIES, state.basics.citizenship)}
                />
                <DataRow label="Date of Birth" value={state.basics.dob} />
                <DataRow label="SSN" value={state.basics.ssn ? '***-**-' + state.basics.ssn.slice(-4) : '-'} />
              </div>
            ) : (
              <div className="space-y-1 divide-y divide-gray-800">
                <DataRow label="Legal Business Name" value={state.basics.legalBusinessName} />
                {state.basics.hasDba && (
                  <DataRow label="DBA" value={state.basics.dbaName} />
                )}
                <DataRow
                  label="Jurisdiction"
                  value={`${state.basics.stateOfIncorporation ? getLabel(US_STATES, state.basics.stateOfIncorporation) + ', ' : ''}${getLabel(COUNTRIES, state.basics.countryOfIncorporation)}`}
                />
                <DataRow label="EIN" value={state.basics.ein} />
                <DataRow
                  label="Business Phone"
                  value={`${state.basics.phoneCountryCode} ${state.basics.businessPhone}`}
                />
                <DataRow label="Website" value={state.basics.website || 'Not provided'} />
                <DataRow label="Industry" value={getLabel(INDUSTRIES, state.basics.industry)} />
              </div>
            )}
          </AccordionSection>

          {/* Address */}
          <AccordionSection
            title={isIndividual ? 'Residential Address' : 'Business Address'}
            icon={FiMapPin}
            onEdit={() => {
              updateState({ currentStep: 4 });
              navigate('/address');
            }}
          >
            <div className="space-y-1 divide-y divide-gray-800">
              <DataRow label="Street" value={`${state.address.street1}${state.address.street2 ? ', ' + state.address.street2 : ''}`} />
              <DataRow
                label="City, State, ZIP"
                value={`${state.address.city}, ${state.address.state} ${state.address.zip}`}
              />
              <DataRow label="Country" value={getLabel(COUNTRIES, state.address.country)} />
            </div>

            {state.address.hasSeparatePhysical && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-500 mb-3">Physical Address</p>
                <div className="space-y-1 divide-y divide-gray-800">
                  <DataRow
                    label="Street"
                    value={`${state.address.physicalStreet1}${state.address.physicalStreet2 ? ', ' + state.address.physicalStreet2 : ''}`}
                  />
                  <DataRow
                    label="City, State, ZIP"
                    value={`${state.address.physicalCity}, ${state.address.physicalState} ${state.address.physicalZip}`}
                  />
                  <DataRow label="Country" value={getLabel(COUNTRIES, state.address.physicalCountry)} />
                </div>
              </div>
            )}
          </AccordionSection>

          {/* Beneficial Ownership */}
          <AccordionSection
            title={isIndividual ? 'Identity Verification' : 'Beneficial Ownership'}
            icon={FiUsers}
            onEdit={() => {
              updateState({ currentStep: 5 });
              navigate('/ownership');
            }}
          >
            <div className="space-y-4">
              {state.ubo.owners.map((owner, idx) => (
                <div
                  key={owner.id}
                  className={`p-3 rounded-lg ${owner.verified ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-200">
                      {owner.firstName} {owner.lastName}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        owner.verified
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {owner.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {owner.email} • {owner.ownershipPercentage}% ownership
                    {owner.isControlPerson && ' • Control Person'}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                {state.ubo.certified ? (
                  <>
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Ownership certified</span>
                  </>
                ) : (
                  <span className="text-yellow-400">Certification pending</span>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* Activity Profile */}
          <AccordionSection
            title="Activity Profile"
            icon={FiActivity}
            onEdit={() => {
              updateState({ currentStep: 6 });
              navigate('/activity');
            }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Intended Use</p>
                <p className="text-gray-300 text-sm bg-gray-800/50 rounded-lg p-3">
                  {state.activity.usageDescription}
                </p>
              </div>

              <div className="space-y-1 divide-y divide-gray-800">
                <DataRow
                  label="Sources of Funds"
                  value={state.activity.sourcesOfFunds
                    .map((s) => getLabel(fundSources, s))
                    .join(', ')}
                />
                <DataRow
                  label="Expected Trade Size"
                  value={getLabel(TRADE_SIZE_RANGES, state.activity.expectedTradeSize)}
                />
                <DataRow
                  label="Monthly Volume"
                  value={getLabel(MONTHLY_VOLUME_RANGES, state.activity.monthlyVolume)}
                />
                <DataRow
                  label="Operating Countries"
                  value={state.activity.operatingCountries
                    .map((c) => getLabel(COUNTRIES, c))
                    .join(', ')}
                />
              </div>
            </div>
          </AccordionSection>

          {/* Wallet Verification */}
          <AccordionSection
            title="Wallet Verification"
            icon={FiShield}
            onEdit={() => {
              updateState({ currentStep: 7 });
              navigate('/wallet');
            }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Wallet Address</p>
                <p className="font-mono text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 break-all">
                  {state.wallet.address}
                </p>
              </div>

              {state.wallet.scanResult && (
                <div
                  className={`p-4 rounded-lg border ${
                    state.wallet.scanResult.risk === 'low'
                      ? 'bg-green-500/10 border-green-500/30'
                      : state.wallet.scanResult.risk === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">Scan Result</span>
                    <span
                      className={`text-sm font-semibold ${getRiskColor(state.wallet.scanResult.risk)}`}
                    >
                      {state.wallet.scanResult.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className={`text-sm ${getRiskColor(state.wallet.scanResult.risk)}`}>
                    {state.wallet.scanResult.reason}
                  </p>
                </div>
              )}
            </div>
          </AccordionSection>
        </div>

        {/* Submit Section */}
        <div className="mt-8 card animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiSend className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Submit?</h3>
              <p className="text-sm text-gray-400 mb-4">
                By submitting this application, you confirm that all information provided
                is accurate and complete. Our business development team will review your
                application and contact you within 1-2 business days.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <FiCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
