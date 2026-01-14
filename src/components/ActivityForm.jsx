import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import {
  ALL_COUNTRIES,
  HIGH_RISK_COUNTRIES,
  INDIVIDUAL_FUND_SOURCES,
  ENTITY_FUND_SOURCES,
  TRADE_SIZE_RANGES,
  MONTHLY_VOLUME_RANGES,
} from '../constants/formOptions';
import {
  FiArrowLeft,
  FiArrowRight,
  FiActivity,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';

const activitySchema = Yup.object().shape({
  usageDescription: Yup.string()
    .min(50, 'Please provide more detail (at least 50 characters)')
    .required('Please describe how you plan to use our services'),
  sourcesOfFunds: Yup.array()
    .min(1, 'Please select at least one source of funds')
    .required('Source of funds is required'),
  expectedTradeSize: Yup.string().required('Expected trade size is required'),
  monthlyVolume: Yup.string().required('Monthly volume estimate is required'),
  operatingCountries: Yup.array()
    .min(1, 'Please select at least one country')
    .required('Operating countries are required'),
});

// Custom styles for react-select to match dark theme
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#111827',
    borderColor: state.isFocused ? '#6366f1' : '#374151',
    borderWidth: '1px',
    borderRadius: '0.5rem',
    padding: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#4b5563',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#4f46e5'
      : state.isFocused
        ? '#374151'
        : 'transparent',
    color: state.isSelected ? '#fff' : '#d1d5db',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#4338ca',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#4f46e5',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#fff',
    paddingLeft: '0.5rem',
    paddingRight: '0.25rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#c7d2fe',
    '&:hover': {
      backgroundColor: '#4338ca',
      color: '#fff',
    },
  }),
  input: (base) => ({
    ...base,
    color: '#f3f4f6',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#6b7280',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f3f4f6',
  }),
};

export default function ActivityForm() {
  const navigate = useNavigate();
  const { state, updateActivity, updateState } = useOnboarding();
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [highRiskCountries, setHighRiskCountries] = useState([]);

  const isIndividual = state.clientType === 'individual';
  const fundSources = isIndividual ? INDIVIDUAL_FUND_SOURCES : ENTITY_FUND_SOURCES;

  useEffect(() => {
    if (!state.clientType || state.currentStep < 6) {
      navigate('/');
    }
  }, [state.clientType, state.currentStep, navigate]);

  const checkHighRiskCountries = (countries) => {
    const highRiskCodes = HIGH_RISK_COUNTRIES.map((c) => c.value);
    const selected = countries.filter((c) => highRiskCodes.includes(c));
    if (selected.length > 0) {
      const names = selected.map(
        (code) => ALL_COUNTRIES.find((c) => c.value === code)?.label || code
      );
      setHighRiskCountries(names);
      setShowHighRiskModal(true);
      return true;
    }
    return false;
  };

  const handleSubmit = (values) => {
    // Check for high-risk countries
    const hasHighRisk = checkHighRiskCountries(values.operatingCountries);

    if (hasHighRisk && !values.highRiskAcknowledged) {
      return;
    }

    updateActivity(values);
    updateState({ currentStep: 7 });
    navigate('/wallet');
  };

  const handleBack = () => {
    updateState({ currentStep: 5 });
    navigate('/ownership');
  };

  const handleAcknowledgeHighRisk = (setFieldValue) => {
    setFieldValue('highRiskAcknowledged', true);
    setShowHighRiskModal(false);
  };

  const initialValues = {
    usageDescription: state.activity.usageDescription || '',
    sourcesOfFunds: state.activity.sourcesOfFunds || [],
    expectedTradeSize: state.activity.expectedTradeSize || '',
    monthlyVolume: state.activity.monthlyVolume || '',
    operatingCountries: state.activity.operatingCountries || ['US'],
    highRiskAcknowledged: state.activity.highRiskAcknowledged || false,
  };

  const countryOptions = ALL_COUNTRIES.map((c) => ({
    value: c.value,
    label: c.label,
    isHighRisk: HIGH_RISK_COUNTRIES.some((hr) => hr.value === c.value),
  }));

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
            <FiActivity className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Expected Activity</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Help us understand your trading needs and expected activity profile.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={activitySchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Usage Description */}
              <div className="card animate-slide-up">
                <h2 className="text-lg font-semibold text-white mb-4">Intended Use</h2>
                <div>
                  <label className="label-text" htmlFor="usageDescription">
                    How do you plan to use our OTC services? <span className="text-red-400">*</span>
                  </label>
                  <Field
                    as="textarea"
                    id="usageDescription"
                    name="usageDescription"
                    rows={4}
                    className={`input-field resize-none ${
                      errors.usageDescription && touched.usageDescription ? 'input-error' : ''
                    }`}
                    placeholder="Describe your intended use of our OTC trading services, including the types of trades you expect to make and your trading objectives..."
                  />
                  {errors.usageDescription && touched.usageDescription && (
                    <p className="error-text">{errors.usageDescription}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {values.usageDescription.length}/500 characters (minimum 50)
                  </p>
                </div>
              </div>

              {/* Source of Funds */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Source of Funds</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Select all sources that apply <span className="text-red-400">*</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {fundSources.map((source) => {
                    const isSelected = values.sourcesOfFunds.includes(source.value);

                    return (
                      <label
                        key={source.value}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                          transition-all duration-200
                          ${isSelected
                            ? 'border-indigo-500/50 bg-indigo-500/10'
                            : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newSources = isSelected
                              ? values.sourcesOfFunds.filter((s) => s !== source.value)
                              : [...values.sourcesOfFunds, source.value];
                            setFieldValue('sourcesOfFunds', newSources);
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`
                            w-4 h-4 rounded border-2 transition-all duration-200
                            flex items-center justify-center flex-shrink-0
                            ${isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-600'
                            }
                          `}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-indigo-300' : 'text-gray-300'}`}>
                          {source.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.sourcesOfFunds && touched.sourcesOfFunds && (
                  <p className="error-text mt-2">{errors.sourcesOfFunds}</p>
                )}
              </div>

              {/* Trade Size & Volume */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Trading Volume</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text" htmlFor="expectedTradeSize">
                      Expected Trade Size <span className="text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      id="expectedTradeSize"
                      name="expectedTradeSize"
                      className={`input-field ${
                        errors.expectedTradeSize && touched.expectedTradeSize ? 'input-error' : ''
                      }`}
                    >
                      <option value="">Select range</option>
                      {TRADE_SIZE_RANGES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Field>
                    {errors.expectedTradeSize && touched.expectedTradeSize && (
                      <p className="error-text">{errors.expectedTradeSize}</p>
                    )}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="monthlyVolume">
                      Expected Monthly Volume <span className="text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      id="monthlyVolume"
                      name="monthlyVolume"
                      className={`input-field ${
                        errors.monthlyVolume && touched.monthlyVolume ? 'input-error' : ''
                      }`}
                    >
                      <option value="">Select range</option>
                      {MONTHLY_VOLUME_RANGES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Field>
                    {errors.monthlyVolume && touched.monthlyVolume && (
                      <p className="error-text">{errors.monthlyVolume}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Countries */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Operating Jurisdictions</h2>
                <div>
                  <label className="label-text">
                    Countries where you operate or trade <span className="text-red-400">*</span>
                  </label>
                  <Select
                    isMulti
                    options={countryOptions}
                    value={countryOptions.filter((opt) =>
                      values.operatingCountries.includes(opt.value)
                    )}
                    onChange={(selected) => {
                      const countries = selected ? selected.map((s) => s.value) : [];
                      setFieldValue('operatingCountries', countries);
                      // Check for high-risk on change
                      if (countries.length > 0) {
                        checkHighRiskCountries(countries);
                      }
                    }}
                    styles={selectStyles}
                    placeholder="Search and select countries..."
                    noOptionsMessage={() => 'No countries found'}
                    formatOptionLabel={(option) => (
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {option.isHighRisk && (
                          <span className="text-xs text-red-400 ml-2">High Risk</span>
                        )}
                      </div>
                    )}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {errors.operatingCountries && touched.operatingCountries && (
                    <p className="error-text mt-2">{errors.operatingCountries}</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* High Risk Country Modal */}
              {showHighRiskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <FiAlertTriangle className="w-6 h-6 text-amber-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowHighRiskModal(false)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      High-Risk Jurisdiction Detected
                    </h3>
                    <p className="text-gray-400 mb-4">
                      You have selected one or more high-risk jurisdictions:
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                      <ul className="text-amber-300 text-sm space-y-1">
                        {highRiskCountries.map((country) => (
                          <li key={country}>• {country}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                      Operating in these jurisdictions may require enhanced due diligence
                      and could affect your onboarding timeline. Do you wish to proceed?
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowHighRiskModal(false)}
                        className="btn-secondary flex-1"
                      >
                        Go Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeHighRisk(setFieldValue)}
                        className="btn-primary flex-1"
                      >
                        I Understand
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
