import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressStepper from './ProgressStepper';
import { scanWallet, getRiskColor, getRiskBgColor } from '../mocks/chainalysisMock';
import {
  FiArrowLeft,
  FiArrowRight,
  FiSearch,
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiLoader,
  FiExternalLink,
  FiInfo,
} from 'react-icons/fi';

const walletSchema = Yup.object().shape({
  address: Yup.string()
    .min(26, 'Wallet address is too short')
    .max(62, 'Wallet address is too long')
    .required('Wallet address is required'),
});

export default function WalletVerification() {
  const navigate = useNavigate();
  const { state, updateWallet, updateState } = useOnboarding();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(state.wallet.scanResult);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    if (!state.clientType || state.currentStep < 7) {
      navigate('/');
    }
  }, [state.clientType, state.currentStep, navigate]);

  const handleScan = async (address) => {
    setScanning(true);
    setScanError('');
    setScanResult(null);

    try {
      const result = await scanWallet(address, {
        monthlyVolume: state.activity.monthlyVolume,
        operatingCountries: state.activity.operatingCountries,
      });

      setScanResult(result);
      updateWallet({
        address,
        scanCompleted: true,
        scanResult: result,
      });
    } catch (error) {
      setScanError(error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (values) => {
    if (!scanResult) {
      setScanError('Please scan the wallet address before continuing');
      return;
    }

    updateWallet({
      address: values.address,
      scanCompleted: true,
      scanResult,
    });
    updateState({ currentStep: 8 });
    navigate('/review');
  };

  const handleBack = () => {
    updateState({ currentStep: 6 });
    navigate('/activity');
  };

  const initialValues = {
    address: state.wallet.address || '',
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'low':
        return <FiCheck className="w-6 h-6" />;
      case 'medium':
        return <FiInfo className="w-6 h-6" />;
      case 'high':
        return <FiAlertTriangle className="w-6 h-6" />;
      default:
        return <FiShield className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressStepper />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
            <FiShield className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Wallet Verification</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Enter a wallet address you plan to use for trading. We'll perform a
            compliance screening to ensure it meets our requirements.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={walletSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, isValid }) => (
            <Form className="space-y-6">
              {/* Wallet Input */}
              <div className="card animate-slide-up">
                <h2 className="text-lg font-semibold text-white mb-4">Wallet Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label-text" htmlFor="address">
                      Enter your wallet address <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-3">
                      <Field
                        id="address"
                        name="address"
                        type="text"
                        className={`input-field flex-1 font-mono text-sm ${
                          errors.address && touched.address ? 'input-error' : ''
                        }`}
                        placeholder="0x..."
                      />
                      <button
                        type="button"
                        onClick={() => handleScan(values.address)}
                        disabled={!values.address || values.address.length < 26 || scanning}
                        className="btn-primary flex items-center gap-2 px-6"
                      >
                        {scanning ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            <span>Scanning...</span>
                          </>
                        ) : (
                          <>
                            <FiSearch className="w-4 h-4" />
                            <span>Scan</span>
                          </>
                        )}
                      </button>
                    </div>
                    {errors.address && touched.address && (
                      <p className="error-text">{errors.address}</p>
                    )}
                    {scanError && <p className="error-text">{scanError}</p>}
                  </div>

                  <p className="text-xs text-gray-500">
                    Supported: Ethereum, Bitcoin, Solana, and other major blockchain addresses
                  </p>
                </div>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div
                  className={`card border-2 animate-slide-up ${getRiskBgColor(scanResult.risk)}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        scanResult.risk === 'low'
                          ? 'bg-green-500/20 text-green-400'
                          : scanResult.risk === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {getRiskIcon(scanResult.risk)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Scan Complete</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            scanResult.risk === 'low'
                              ? 'bg-green-500/20 text-green-400'
                              : scanResult.risk === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {scanResult.risk.toUpperCase()} RISK
                        </span>
                      </div>

                      <p className={`text-sm ${getRiskColor(scanResult.risk)} mb-4`}>
                        {scanResult.reason}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Risk Score</p>
                          <p className={`font-semibold ${getRiskColor(scanResult.risk)}`}>
                            {scanResult.score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Transactions</p>
                          <p className="text-gray-200 font-semibold">
                            {scanResult.details.transactionCount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Total Volume</p>
                          <p className="text-gray-200 font-semibold">
                            {scanResult.details.totalVolume}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">First Seen</p>
                          <p className="text-gray-200 font-semibold">
                            {new Date(scanResult.details.firstSeen).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Contextual Flag */}
                      {scanResult.details.contextualFlag && (
                        <div
                          className={`mt-4 p-3 rounded-lg border ${
                            scanResult.details.contextualFlag.severity === 'warning'
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-blue-500/10 border-blue-500/30'
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              scanResult.details.contextualFlag.severity === 'warning'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                            }`}
                          >
                            <FiInfo className="w-4 h-4 inline mr-2" />
                            {scanResult.details.contextualFlag.message}
                          </p>
                        </div>
                      )}

                      {/* Risk Factors */}
                      {scanResult.details.riskFactors.length > 0 && (
                        <div className="mt-4">
                          <p className="text-gray-500 text-sm mb-2">Risk Factors:</p>
                          <ul className="space-y-1">
                            {scanResult.details.riskFactors.map((factor, idx) => (
                              <li key={idx} className="text-red-400 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* View on Explorer */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <a
                          href={`https://etherscan.io/address/${scanResult.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center gap-1 transition-colors"
                        >
                          View on Block Explorer
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* High Risk Warning */}
              {scanResult?.risk === 'high' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <FiAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">High Risk Wallet Detected</p>
                      <p className="text-sm text-red-400/80 mt-1">
                        This wallet has been flagged as high risk. You may still proceed, but your
                        application will require enhanced due diligence review, which may delay
                        approval. Consider using a different wallet address.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Note */}
              {!scanResult && (
                <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">Why do we scan wallets?</p>
                      <p className="text-sm text-gray-500 mt-1">
                        We use industry-leading blockchain analytics to ensure compliance with
                        anti-money laundering (AML) regulations. This helps protect both you and
                        our platform from illicit funds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!scanResult}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
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
