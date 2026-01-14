import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import { COUNTRIES, US_STATES } from '../constants/formOptions';
import { FiArrowLeft, FiArrowRight, FiAlertTriangle, FiMapPin } from 'react-icons/fi';

const addressSchema = Yup.object().shape({
  country: Yup.string().required('Country is required'),
  street1: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().when('country', {
    is: 'US',
    then: (schema) => schema.required('State is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  zip: Yup.string()
    .required('ZIP/Postal code is required')
    .when('country', {
      is: 'US',
      then: (schema) => schema.matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    }),
  physicalStreet1: Yup.string().when('hasSeparatePhysical', {
    is: true,
    then: (schema) => schema.required('Physical street address is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  physicalCity: Yup.string().when('hasSeparatePhysical', {
    is: true,
    then: (schema) => schema.required('Physical city is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  physicalState: Yup.string().when(['hasSeparatePhysical', 'physicalCountry'], {
    is: (hasSeparate, country) => hasSeparate && country === 'US',
    then: (schema) => schema.required('Physical state is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  physicalZip: Yup.string().when('hasSeparatePhysical', {
    is: true,
    then: (schema) => schema.required('Physical ZIP/Postal code is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function AddressForm() {
  const navigate = useNavigate();
  const { state, updateAddress, updateState } = useOnboarding();
  const isIndividual = state.clientType === 'individual';

  useEffect(() => {
    if (!state.clientType || state.currentStep < 4) {
      navigate('/');
    }
  }, [state.clientType, state.currentStep, navigate]);

  const handleSubmit = (values) => {
    updateAddress(values);
    updateState({ currentStep: 5 });
    navigate('/ownership');
  };

  const handleBack = () => {
    updateState({ currentStep: 3 });
    navigate('/basics');
  };

  const initialValues = {
    country: state.address.country || 'US',
    street1: state.address.street1 || '',
    street2: state.address.street2 || '',
    city: state.address.city || '',
    state: state.address.state || '',
    zip: state.address.zip || '',
    hasSeparatePhysical: state.address.hasSeparatePhysical || false,
    physicalCountry: state.address.physicalCountry || 'US',
    physicalStreet1: state.address.physicalStreet1 || '',
    physicalStreet2: state.address.physicalStreet2 || '',
    physicalCity: state.address.physicalCity || '',
    physicalState: state.address.physicalState || '',
    physicalZip: state.address.physicalZip || '',
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
            <FiMapPin className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {isIndividual ? 'Residential Address' : 'Business Address'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {isIndividual
              ? 'Please provide your current residential address for verification.'
              : 'Please provide your registered business address.'}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-slide-up">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Address Requirements</p>
              <p className="text-sm text-red-400/80 mt-1">
                P.O. boxes, virtual addresses, mail forwarding services, and co-working spaces
                are not accepted. Please provide a valid residential or physical business address.
              </p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={addressSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Primary Address */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <h2 className="text-lg font-semibold text-white mb-6">
                  {isIndividual ? 'Residential Address' : 'Registered Address'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="label-text" htmlFor="country">
                      Country <span className="text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      id="country"
                      name="country"
                      className={`input-field ${
                        errors.country && touched.country ? 'input-error' : ''
                      }`}
                    >
                      {COUNTRIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Field>
                    {errors.country && touched.country && (
                      <p className="error-text">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-text" htmlFor="street1">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <Field
                      id="street1"
                      name="street1"
                      type="text"
                      className={`input-field ${
                        errors.street1 && touched.street1 ? 'input-error' : ''
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.street1 && touched.street1 && (
                      <p className="error-text">{errors.street1}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-text" htmlFor="street2">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <Field
                      id="street2"
                      name="street2"
                      type="text"
                      className="input-field"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="label-text" htmlFor="city">
                        City <span className="text-red-400">*</span>
                      </label>
                      <Field
                        id="city"
                        name="city"
                        type="text"
                        className={`input-field ${
                          errors.city && touched.city ? 'input-error' : ''
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && touched.city && (
                        <p className="error-text">{errors.city}</p>
                      )}
                    </div>

                    {values.country === 'US' ? (
                      <div>
                        <label className="label-text" htmlFor="state">
                          State <span className="text-red-400">*</span>
                        </label>
                        <Field
                          as="select"
                          id="state"
                          name="state"
                          className={`input-field ${
                            errors.state && touched.state ? 'input-error' : ''
                          }`}
                        >
                          <option value="">Select state</option>
                          {US_STATES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        {errors.state && touched.state && (
                          <p className="error-text">{errors.state}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="label-text" htmlFor="state">
                          State/Province/Region
                        </label>
                        <Field
                          id="state"
                          name="state"
                          type="text"
                          className="input-field"
                          placeholder="Province"
                        />
                      </div>
                    )}

                    <div>
                      <label className="label-text" htmlFor="zip">
                        {values.country === 'US' ? 'ZIP Code' : 'Postal Code'}{' '}
                        <span className="text-red-400">*</span>
                      </label>
                      <Field
                        id="zip"
                        name="zip"
                        type="text"
                        className={`input-field ${
                          errors.zip && touched.zip ? 'input-error' : ''
                        }`}
                        placeholder={values.country === 'US' ? '10001' : 'Postal code'}
                      />
                      {errors.zip && touched.zip && (
                        <p className="error-text">{errors.zip}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Separate Physical Address Toggle */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Field type="checkbox" name="hasSeparatePhysical" className="sr-only" />
                  <div
                    className={`
                      w-5 h-5 rounded border-2 transition-all duration-200
                      flex items-center justify-center
                      ${values.hasSeparatePhysical
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-600 group-hover:border-gray-500'
                      }
                    `}
                  >
                    {values.hasSeparatePhysical && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-200">
                      {isIndividual
                        ? 'My mailing address is different from my residential address'
                        : 'Physical business address is different from registered address'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Check this if you have a separate physical location
                    </p>
                  </div>
                </label>
              </div>

              {/* Physical Address (Conditional) */}
              {values.hasSeparatePhysical && (
                <div className="card animate-slide-up">
                  <h2 className="text-lg font-semibold text-white mb-6">Physical Address</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="label-text" htmlFor="physicalCountry">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <Field
                        as="select"
                        id="physicalCountry"
                        name="physicalCountry"
                        className="input-field"
                      >
                        {COUNTRIES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label className="label-text" htmlFor="physicalStreet1">
                        Street Address <span className="text-red-400">*</span>
                      </label>
                      <Field
                        id="physicalStreet1"
                        name="physicalStreet1"
                        type="text"
                        className={`input-field ${
                          errors.physicalStreet1 && touched.physicalStreet1 ? 'input-error' : ''
                        }`}
                        placeholder="456 Business Ave"
                      />
                      {errors.physicalStreet1 && touched.physicalStreet1 && (
                        <p className="error-text">{errors.physicalStreet1}</p>
                      )}
                    </div>

                    <div>
                      <label className="label-text" htmlFor="physicalStreet2">
                        Suite, Floor, Unit (Optional)
                      </label>
                      <Field
                        id="physicalStreet2"
                        name="physicalStreet2"
                        type="text"
                        className="input-field"
                        placeholder="Suite 500"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="label-text" htmlFor="physicalCity">
                          City <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="physicalCity"
                          name="physicalCity"
                          type="text"
                          className={`input-field ${
                            errors.physicalCity && touched.physicalCity ? 'input-error' : ''
                          }`}
                          placeholder="San Francisco"
                        />
                        {errors.physicalCity && touched.physicalCity && (
                          <p className="error-text">{errors.physicalCity}</p>
                        )}
                      </div>

                      {values.physicalCountry === 'US' ? (
                        <div>
                          <label className="label-text" htmlFor="physicalState">
                            State <span className="text-red-400">*</span>
                          </label>
                          <Field
                            as="select"
                            id="physicalState"
                            name="physicalState"
                            className={`input-field ${
                              errors.physicalState && touched.physicalState ? 'input-error' : ''
                            }`}
                          >
                            <option value="">Select state</option>
                            {US_STATES.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Field>
                          {errors.physicalState && touched.physicalState && (
                            <p className="error-text">{errors.physicalState}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="label-text" htmlFor="physicalState">
                            State/Province/Region
                          </label>
                          <Field
                            id="physicalState"
                            name="physicalState"
                            type="text"
                            className="input-field"
                            placeholder="Province"
                          />
                        </div>
                      )}

                      <div>
                        <label className="label-text" htmlFor="physicalZip">
                          {values.physicalCountry === 'US' ? 'ZIP Code' : 'Postal Code'}{' '}
                          <span className="text-red-400">*</span>
                        </label>
                        <Field
                          id="physicalZip"
                          name="physicalZip"
                          type="text"
                          className={`input-field ${
                            errors.physicalZip && touched.physicalZip ? 'input-error' : ''
                          }`}
                          placeholder={values.physicalCountry === 'US' ? '94105' : 'Postal code'}
                        />
                        {errors.physicalZip && touched.physicalZip && (
                          <p className="error-text">{errors.physicalZip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
