import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import {
  COUNTRIES,
  US_STATES,
  PHONE_COUNTRY_CODES,
  INDUSTRIES,
  SUFFIX_OPTIONS,
} from '../constants/formOptions';
import { FiArrowLeft, FiArrowRight, FiUpload, FiCheck, FiUser, FiBriefcase } from 'react-icons/fi';

// Validation schemas
const individualSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Invalid phone number')
    .required('Phone number is required'),
  citizenship: Yup.string().required('Citizenship is required'),
  ssn: Yup.string()
    .matches(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format (XXX-XX-XXXX)')
    .required('SSN is required'),
  dob: Yup.date()
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'Must be at least 18 years old')
    .required('Date of birth is required'),
});

const entitySchema = Yup.object().shape({
  legalBusinessName: Yup.string().required('Legal business name is required'),
  countryOfIncorporation: Yup.string().required('Country of incorporation is required'),
  stateOfIncorporation: Yup.string().when('countryOfIncorporation', {
    is: 'US',
    then: (schema) => schema.required('State of incorporation is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  ein: Yup.string()
    .matches(/^\d{2}-?\d{7}$/, 'Invalid EIN format (XX-XXXXXXX)')
    .required('EIN is required'),
  businessPhone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Invalid phone number')
    .required('Business phone is required'),
  industry: Yup.string().required('Industry is required'),
  activityDescription: Yup.string()
    .min(20, 'Please provide more detail (at least 20 characters)')
    .required('Business activity description is required'),
});

export default function BasicsForm() {
  const navigate = useNavigate();
  const { state, updateBasics, updateState, prevStep } = useOnboarding();
  const [einUploaded, setEinUploaded] = useState(state.basics.einDocumentUploaded);

  const isIndividual = state.clientType === 'individual';

  useEffect(() => {
    if (!state.clientType || !state.eligibility.completed) {
      navigate('/');
    }
  }, [state.clientType, state.eligibility.completed, navigate]);

  const handleSubmit = (values) => {
    updateBasics({ ...values, einDocumentUploaded: einUploaded });
    updateState({ currentStep: 4 });
    navigate('/address');
  };

  const handleBack = () => {
    updateState({ currentStep: 2 });
    navigate('/eligibility');
  };

  const formatSSN = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const formatEIN = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`;
  };

  const initialValues = isIndividual
    ? {
        firstName: state.basics.firstName || '',
        middleName: state.basics.middleName || '',
        lastName: state.basics.lastName || '',
        suffix: state.basics.suffix || '',
        email: state.basics.email || '',
        phone: state.basics.phone || '',
        phoneCountryCode: state.basics.phoneCountryCode || '+1',
        citizenship: state.basics.citizenship || '',
        ssn: state.basics.ssn || '',
        dob: state.basics.dob || '',
      }
    : {
        legalBusinessName: state.basics.legalBusinessName || '',
        hasDba: state.basics.hasDba || false,
        dbaName: state.basics.dbaName || '',
        countryOfIncorporation: state.basics.countryOfIncorporation || '',
        stateOfIncorporation: state.basics.stateOfIncorporation || '',
        ein: state.basics.ein || '',
        businessPhone: state.basics.businessPhone || '',
        phoneCountryCode: state.basics.phoneCountryCode || '+1',
        website: state.basics.website || '',
        industry: state.basics.industry || '',
        activityDescription: state.basics.activityDescription || '',
      };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2 mb-4">
            {isIndividual ? (
              <>
                <FiUser className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-gray-300">Individual Account</span>
              </>
            ) : (
              <>
                <FiBriefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-gray-300">Entity Account</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {isIndividual ? 'Personal Information' : 'Business Information'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {isIndividual
              ? 'Please provide your personal details for identity verification.'
              : 'Please provide your business details for verification.'}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={isIndividual ? individualSchema : entitySchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-6">
              {isIndividual ? (
                // Individual Form Fields
                <>
                  <div className="card animate-slide-up">
                    <h2 className="text-lg font-semibold text-white mb-6">Full Legal Name</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text" htmlFor="firstName">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="firstName"
                          name="firstName"
                          type="text"
                          className={`input-field ${
                            errors.firstName && touched.firstName ? 'input-error' : ''
                          }`}
                          placeholder="John"
                        />
                        {errors.firstName && touched.firstName && (
                          <p className="error-text">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-text" htmlFor="middleName">
                          Middle Name
                        </label>
                        <Field
                          id="middleName"
                          name="middleName"
                          type="text"
                          className="input-field"
                          placeholder="Michael"
                        />
                      </div>
                      <div>
                        <label className="label-text" htmlFor="lastName">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="lastName"
                          name="lastName"
                          type="text"
                          className={`input-field ${
                            errors.lastName && touched.lastName ? 'input-error' : ''
                          }`}
                          placeholder="Smith"
                        />
                        {errors.lastName && touched.lastName && (
                          <p className="error-text">{errors.lastName}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-text" htmlFor="suffix">
                          Suffix
                        </label>
                        <Field
                          as="select"
                          id="suffix"
                          name="suffix"
                          className="input-field"
                        >
                          {SUFFIX_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <h2 className="text-lg font-semibold text-white mb-6">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label-text" htmlFor="email">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          className={`input-field ${
                            errors.email && touched.email ? 'input-error' : ''
                          }`}
                          placeholder="john.smith@example.com"
                        />
                        {errors.email && touched.email && (
                          <p className="error-text">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-text" htmlFor="phoneCountryCode">
                          Country Code
                        </label>
                        <Field
                          as="select"
                          id="phoneCountryCode"
                          name="phoneCountryCode"
                          className="input-field"
                        >
                          {PHONE_COUNTRY_CODES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div>
                        <label className="label-text" htmlFor="phone">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="phone"
                          name="phone"
                          type="tel"
                          className={`input-field ${
                            errors.phone && touched.phone ? 'input-error' : ''
                          }`}
                          placeholder="5551234567"
                        />
                        {errors.phone && touched.phone && (
                          <p className="error-text">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-semibold text-white mb-6">Identity Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text" htmlFor="citizenship">
                          Citizenship <span className="text-red-400">*</span>
                        </label>
                        <Field
                          as="select"
                          id="citizenship"
                          name="citizenship"
                          className={`input-field ${
                            errors.citizenship && touched.citizenship ? 'input-error' : ''
                          }`}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        {errors.citizenship && touched.citizenship && (
                          <p className="error-text">{errors.citizenship}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-text" htmlFor="dob">
                          Date of Birth <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="dob"
                          name="dob"
                          type="date"
                          className={`input-field ${
                            errors.dob && touched.dob ? 'input-error' : ''
                          }`}
                        />
                        {errors.dob && touched.dob && (
                          <p className="error-text">{errors.dob}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-text" htmlFor="ssn">
                          Social Security Number <span className="text-red-400">*</span>
                        </label>
                        <Field name="ssn">
                          {({ field }) => (
                            <input
                              {...field}
                              id="ssn"
                              type="text"
                              className={`input-field ${
                                errors.ssn && touched.ssn ? 'input-error' : ''
                              }`}
                              placeholder="XXX-XX-XXXX"
                              maxLength={11}
                              onChange={(e) => {
                                const formatted = formatSSN(e.target.value);
                                setFieldValue('ssn', formatted);
                              }}
                            />
                          )}
                        </Field>
                        {errors.ssn && touched.ssn && (
                          <p className="error-text">{errors.ssn}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Your SSN is encrypted and securely stored
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Entity Form Fields
                <>
                  <div className="card animate-slide-up">
                    <h2 className="text-lg font-semibold text-white mb-6">Business Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="label-text" htmlFor="legalBusinessName">
                          Legal Business Name <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="legalBusinessName"
                          name="legalBusinessName"
                          type="text"
                          className={`input-field ${
                            errors.legalBusinessName && touched.legalBusinessName ? 'input-error' : ''
                          }`}
                          placeholder="Acme Corporation LLC"
                        />
                        {errors.legalBusinessName && touched.legalBusinessName && (
                          <p className="error-text">{errors.legalBusinessName}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <Field type="checkbox" name="hasDba" className="sr-only" />
                          <div
                            className={`
                              w-5 h-5 rounded border-2 transition-all duration-200
                              flex items-center justify-center
                              ${values.hasDba
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-600 group-hover:border-gray-500'
                              }
                            `}
                          >
                            {values.hasDba && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-gray-300">
                            This business operates under a different name (DBA)
                          </span>
                        </label>
                      </div>

                      {values.hasDba && (
                        <div className="animate-slide-in">
                          <label className="label-text" htmlFor="dbaName">
                            DBA Name
                          </label>
                          <Field
                            id="dbaName"
                            name="dbaName"
                            type="text"
                            className="input-field"
                            placeholder="Trade name"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <h2 className="text-lg font-semibold text-white mb-6">Incorporation Details</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text" htmlFor="countryOfIncorporation">
                          Country of Incorporation <span className="text-red-400">*</span>
                        </label>
                        <Field
                          as="select"
                          id="countryOfIncorporation"
                          name="countryOfIncorporation"
                          className={`input-field ${
                            errors.countryOfIncorporation && touched.countryOfIncorporation
                              ? 'input-error'
                              : ''
                          }`}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        {errors.countryOfIncorporation && touched.countryOfIncorporation && (
                          <p className="error-text">{errors.countryOfIncorporation}</p>
                        )}
                      </div>

                      {values.countryOfIncorporation === 'US' && (
                        <div className="animate-slide-in">
                          <label className="label-text" htmlFor="stateOfIncorporation">
                            State of Incorporation <span className="text-red-400">*</span>
                          </label>
                          <Field
                            as="select"
                            id="stateOfIncorporation"
                            name="stateOfIncorporation"
                            className={`input-field ${
                              errors.stateOfIncorporation && touched.stateOfIncorporation
                                ? 'input-error'
                                : ''
                            }`}
                          >
                            <option value="">Select state</option>
                            {US_STATES.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Field>
                          {errors.stateOfIncorporation && touched.stateOfIncorporation && (
                            <p className="error-text">{errors.stateOfIncorporation}</p>
                          )}
                        </div>
                      )}

                      <div className={values.countryOfIncorporation !== 'US' ? 'md:col-span-2' : ''}>
                        <label className="label-text" htmlFor="ein">
                          EIN (Employer Identification Number) <span className="text-red-400">*</span>
                        </label>
                        <Field name="ein">
                          {({ field }) => (
                            <input
                              {...field}
                              id="ein"
                              type="text"
                              className={`input-field ${
                                errors.ein && touched.ein ? 'input-error' : ''
                              }`}
                              placeholder="XX-XXXXXXX"
                              maxLength={10}
                              onChange={(e) => {
                                const formatted = formatEIN(e.target.value);
                                setFieldValue('ein', formatted);
                              }}
                            />
                          )}
                        </Field>
                        {errors.ein && touched.ein && (
                          <p className="error-text">{errors.ein}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="label-text">EIN Confirmation Letter (Optional)</label>
                        <div
                          onClick={() => setEinUploaded(true)}
                          className={`
                            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                            transition-all duration-200
                            ${einUploaded
                              ? 'border-green-500/50 bg-green-500/10'
                              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                            }
                          `}
                        >
                          {einUploaded ? (
                            <div className="flex items-center justify-center gap-2 text-green-400">
                              <FiCheck className="w-5 h-5" />
                              <span>Document uploaded</span>
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <FiUpload className="w-6 h-6 mx-auto mb-2" />
                              <p className="text-sm">Click to upload EIN confirmation</p>
                              <p className="text-xs text-gray-500 mt-1">PDF, PNG, or JPG up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-semibold text-white mb-6">Contact & Industry</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text" htmlFor="phoneCountryCode">
                          Country Code
                        </label>
                        <Field
                          as="select"
                          id="phoneCountryCode"
                          name="phoneCountryCode"
                          className="input-field"
                        >
                          {PHONE_COUNTRY_CODES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div>
                        <label className="label-text" htmlFor="businessPhone">
                          Business Phone <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="businessPhone"
                          name="businessPhone"
                          type="tel"
                          className={`input-field ${
                            errors.businessPhone && touched.businessPhone ? 'input-error' : ''
                          }`}
                          placeholder="5551234567"
                        />
                        {errors.businessPhone && touched.businessPhone && (
                          <p className="error-text">{errors.businessPhone}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-text" htmlFor="website">
                          Website
                        </label>
                        <Field
                          id="website"
                          name="website"
                          type="url"
                          className="input-field"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="label-text" htmlFor="industry">
                          Industry <span className="text-red-400">*</span>
                        </label>
                        <Field
                          as="select"
                          id="industry"
                          name="industry"
                          className={`input-field ${
                            errors.industry && touched.industry ? 'input-error' : ''
                          }`}
                        >
                          <option value="">Select industry</option>
                          {INDUSTRIES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        {errors.industry && touched.industry && (
                          <p className="error-text">{errors.industry}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-text" htmlFor="activityDescription">
                          Business Activity Description <span className="text-red-400">*</span>
                        </label>
                        <Field
                          as="textarea"
                          id="activityDescription"
                          name="activityDescription"
                          rows={4}
                          className={`input-field resize-none ${
                            errors.activityDescription && touched.activityDescription
                              ? 'input-error'
                              : ''
                          }`}
                          placeholder="Briefly describe your business activities and how you plan to use Arqitech's services..."
                        />
                        {errors.activityDescription && touched.activityDescription && (
                          <p className="error-text">{errors.activityDescription}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {values.activityDescription.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
