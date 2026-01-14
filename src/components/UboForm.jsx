import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import MobileVerificationModal from './MobileVerificationModal';
import {
  FiArrowLeft,
  FiArrowRight,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiCheck,
  FiUser,
  FiUsers,
  FiShield,
} from 'react-icons/fi';

const ownerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  ownershipPercentage: Yup.number()
    .min(0, 'Must be 0 or greater')
    .max(100, 'Cannot exceed 100%')
    .required('Ownership percentage is required'),
});

const uboSchema = Yup.object().shape({
  owners: Yup.array().of(ownerSchema),
  certified: Yup.boolean().oneOf([true], 'You must certify the ownership information'),
});

export default function UboForm() {
  const navigate = useNavigate();
  const { state, updateUbo, updateOwner, addOwner, removeOwner, updateState } = useOnboarding();
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    ownerId: null,
    ownerName: '',
    phone: '',
  });

  const isIndividual = state.clientType === 'individual';

  useEffect(() => {
    if (!state.clientType || state.currentStep < 5) {
      navigate('/');
    }
  }, [state.clientType, state.currentStep, navigate]);

  // For individuals, pre-fill with their own info
  useEffect(() => {
    if (isIndividual && state.ubo.owners.length === 1 && !state.ubo.owners[0].firstName) {
      updateOwner(state.ubo.owners[0].id, {
        firstName: state.basics.firstName,
        lastName: state.basics.lastName,
        email: state.basics.email,
        ownershipPercentage: 100,
      });
    }
  }, [isIndividual, state.basics, state.ubo.owners, updateOwner]);

  const handleSubmit = (values) => {
    updateUbo({
      owners: values.owners,
      certified: values.certified,
    });
    updateState({ currentStep: 6 });
    navigate('/activity');
  };

  const handleBack = () => {
    updateState({ currentStep: 4 });
    navigate('/address');
  };

  const openVerificationModal = (owner) => {
    setVerificationModal({
      isOpen: true,
      ownerId: owner.id,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      phone: isIndividual ? state.basics.phone : '',
    });
  };

  const handleVerificationSuccess = (result) => {
    updateOwner(verificationModal.ownerId, { verified: true });
    setVerificationModal({ isOpen: false, ownerId: null, ownerName: '', phone: '' });
  };

  const getTotalOwnership = (owners) => {
    return owners.reduce((sum, owner) => sum + (parseFloat(owner.ownershipPercentage) || 0), 0);
  };

  const initialValues = {
    owners: state.ubo.owners,
    certified: state.ubo.certified,
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
            {isIndividual ? (
              <FiUser className="w-6 h-6 text-indigo-400" />
            ) : (
              <FiUsers className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {isIndividual ? 'Identity Verification' : 'Beneficial Ownership'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {isIndividual
              ? 'Please verify your identity to complete the onboarding process.'
              : 'Please provide information about all beneficial owners with 25% or more ownership, and any control persons.'}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={uboSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue }) => {
            const totalOwnership = getTotalOwnership(values.owners);

            return (
              <Form className="space-y-6">
                <FieldArray name="owners">
                  {({ push, remove }) => (
                    <>
                      {values.owners.map((owner, index) => {
                        const ownerErrors = errors.owners?.[index] || {};
                        const ownerTouched = touched.owners?.[index] || {};
                        const stateOwner = state.ubo.owners.find((o) => o.id === owner.id);

                        return (
                          <div
                            key={owner.id}
                            className="card animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-lg font-semibold text-white">
                                {isIndividual ? 'Your Information' : `Owner ${index + 1}`}
                              </h2>
                              {!isIndividual && values.owners.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    remove(index);
                                    removeOwner(owner.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors p-2"
                                  aria-label="Remove owner"
                                >
                                  <FiTrash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="label-text" htmlFor={`owners.${index}.firstName`}>
                                  First Name <span className="text-red-400">*</span>
                                </label>
                                <Field
                                  id={`owners.${index}.firstName`}
                                  name={`owners.${index}.firstName`}
                                  type="text"
                                  className={`input-field ${
                                    ownerErrors.firstName && ownerTouched.firstName ? 'input-error' : ''
                                  }`}
                                  placeholder="John"
                                  disabled={isIndividual}
                                />
                                {ownerErrors.firstName && ownerTouched.firstName && (
                                  <p className="error-text">{ownerErrors.firstName}</p>
                                )}
                              </div>
                              <div>
                                <label className="label-text" htmlFor={`owners.${index}.lastName`}>
                                  Last Name <span className="text-red-400">*</span>
                                </label>
                                <Field
                                  id={`owners.${index}.lastName`}
                                  name={`owners.${index}.lastName`}
                                  type="text"
                                  className={`input-field ${
                                    ownerErrors.lastName && ownerTouched.lastName ? 'input-error' : ''
                                  }`}
                                  placeholder="Smith"
                                  disabled={isIndividual}
                                />
                                {ownerErrors.lastName && ownerTouched.lastName && (
                                  <p className="error-text">{ownerErrors.lastName}</p>
                                )}
                              </div>
                              <div>
                                <label className="label-text" htmlFor={`owners.${index}.email`}>
                                  Email <span className="text-red-400">*</span>
                                </label>
                                <Field
                                  id={`owners.${index}.email`}
                                  name={`owners.${index}.email`}
                                  type="email"
                                  className={`input-field ${
                                    ownerErrors.email && ownerTouched.email ? 'input-error' : ''
                                  }`}
                                  placeholder="john@example.com"
                                  disabled={isIndividual}
                                />
                                {ownerErrors.email && ownerTouched.email && (
                                  <p className="error-text">{ownerErrors.email}</p>
                                )}
                              </div>
                              <div>
                                <label className="label-text" htmlFor={`owners.${index}.ownershipPercentage`}>
                                  Ownership % <span className="text-red-400">*</span>
                                </label>
                                <Field
                                  id={`owners.${index}.ownershipPercentage`}
                                  name={`owners.${index}.ownershipPercentage`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  className={`input-field ${
                                    ownerErrors.ownershipPercentage && ownerTouched.ownershipPercentage
                                      ? 'input-error'
                                      : ''
                                  }`}
                                  placeholder="25"
                                  disabled={isIndividual}
                                />
                                {ownerErrors.ownershipPercentage && ownerTouched.ownershipPercentage && (
                                  <p className="error-text">{ownerErrors.ownershipPercentage}</p>
                                )}
                              </div>
                            </div>

                            {!isIndividual && (
                              <div className="mb-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <Field
                                    type="checkbox"
                                    name={`owners.${index}.isControlPerson`}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`
                                      w-5 h-5 rounded border-2 transition-all duration-200
                                      flex items-center justify-center
                                      ${owner.isControlPerson
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'border-gray-600 group-hover:border-gray-500'
                                      }
                                    `}
                                  >
                                    {owner.isControlPerson && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-300">
                                    This person has significant control over the company
                                  </span>
                                </label>
                              </div>
                            )}

                            {/* ID Upload & Verification */}
                            <div className="border-t border-gray-800 pt-4 mt-4">
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <div
                                    onClick={() =>
                                      setFieldValue(`owners.${index}.idUploaded`, true)
                                    }
                                    className={`
                                      border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                                      transition-all duration-200
                                      ${owner.idUploaded
                                        ? 'border-green-500/50 bg-green-500/10'
                                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                                      }
                                    `}
                                  >
                                    {owner.idUploaded ? (
                                      <div className="flex items-center justify-center gap-2 text-green-400">
                                        <FiCheck className="w-5 h-5" />
                                        <span className="text-sm">ID uploaded</span>
                                      </div>
                                    ) : (
                                      <div className="text-gray-400">
                                        <FiUpload className="w-5 h-5 mx-auto mb-1" />
                                        <p className="text-sm">Upload Photo ID</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <button
                                    type="button"
                                    onClick={() => openVerificationModal(owner)}
                                    disabled={stateOwner?.verified}
                                    className={`
                                      w-full h-full min-h-[60px] rounded-lg border-2 transition-all duration-200
                                      flex items-center justify-center gap-2
                                      ${stateOwner?.verified
                                        ? 'border-green-500/50 bg-green-500/10 text-green-400 cursor-default'
                                        : 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                                      }
                                    `}
                                  >
                                    {stateOwner?.verified ? (
                                      <>
                                        <FiShield className="w-5 h-5" />
                                        <span className="text-sm font-medium">Verified</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiShield className="w-5 h-5" />
                                        <span className="text-sm font-medium">Verify Identity</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Owner Button (Entity only) */}
                      {!isIndividual && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOwner = {
                              id: Date.now(),
                              firstName: '',
                              lastName: '',
                              email: '',
                              ownershipPercentage: '',
                              isControlPerson: false,
                              idUploaded: false,
                              verified: false,
                            };
                            push(newOwner);
                            addOwner();
                          }}
                          className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 text-gray-400
                                     hover:border-gray-600 hover:text-gray-300 transition-all duration-200
                                     flex items-center justify-center gap-2"
                        >
                          <FiPlus className="w-5 h-5" />
                          <span>Add Another Owner</span>
                        </button>
                      )}

                      {/* Ownership Summary (Entity only) */}
                      {!isIndividual && values.owners.length > 0 && (
                        <div className="card animate-slide-up">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Total Ownership Declared</span>
                            <span
                              className={`text-lg font-semibold ${
                                totalOwnership > 100
                                  ? 'text-red-400'
                                  : totalOwnership === 100
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                              }`}
                            >
                              {totalOwnership.toFixed(1)}%
                            </span>
                          </div>
                          {totalOwnership > 100 && (
                            <p className="text-red-400 text-sm mt-2">
                              Total ownership cannot exceed 100%
                            </p>
                          )}
                          {totalOwnership < 100 && totalOwnership > 0 && (
                            <p className="text-yellow-400 text-sm mt-2">
                              Remaining {(100 - totalOwnership).toFixed(1)}% is held by others
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </FieldArray>

                {/* Certification */}
                <div className="card animate-slide-up">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Field type="checkbox" name="certified" className="sr-only" />
                    <div
                      className={`
                        flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200
                        flex items-center justify-center
                        ${values.certified
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-600 group-hover:border-gray-500'
                        }
                      `}
                    >
                      {values.certified && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-200">
                        Certification <span className="text-red-400">*</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {isIndividual
                          ? 'I certify that the information provided is accurate and complete, and I am the beneficial owner of this account.'
                          : 'I certify that the information provided about beneficial ownership is accurate and complete. I understand that providing false information may result in account termination and legal consequences.'}
                      </p>
                    </div>
                  </label>
                  {errors.certified && touched.certified && (
                    <p className="error-text mt-2">{errors.certified}</p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 animate-slide-up">
                  <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
                    <FiArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!isIndividual && totalOwnership > 100}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>

      {/* Verification Modal */}
      <MobileVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, ownerId: null, ownerName: '', phone: '' })}
        onSuccess={handleVerificationSuccess}
        ownerName={verificationModal.ownerName}
        phone={verificationModal.phone}
      />
    </div>
  );
}
