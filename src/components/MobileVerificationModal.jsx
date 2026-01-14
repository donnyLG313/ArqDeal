import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  generateSessionId,
  generateQRCodeData,
  sendVerificationSMS,
  simulateVerification,
} from '../mocks/verificationMock';
import {
  FiX,
  FiSmartphone,
  FiMessageSquare,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader,
} from 'react-icons/fi';

export default function MobileVerificationModal({ isOpen, onClose, onSuccess, ownerName, phone }) {
  const [sessionId] = useState(() => generateSessionId());
  const [qrData] = useState(() => generateQRCodeData(sessionId));
  const [mode, setMode] = useState('qr'); // 'qr' | 'sms'
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'verifying' | 'success' | 'failed'
  const [message, setMessage] = useState('');
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setMessage('');
      setCanRetry(false);
    }
  }, [isOpen]);

  const handleSendSMS = async () => {
    if (!phoneInput || phoneInput.length < 10) {
      setMessage('Please enter a valid phone number');
      return;
    }

    setStatus('sending');
    setMessage('');

    const result = await sendVerificationSMS(phoneInput, sessionId);

    if (result.success) {
      setMessage(result.message);
      startVerification();
    } else {
      setStatus('idle');
      setMessage(result.message);
    }
  };

  const startVerification = async () => {
    setStatus('verifying');
    setMessage('Waiting for verification...');

    const result = await simulateVerification({
      duration: 3000 + Math.random() * 2000,
      successRate: 0.85,
      ownerName,
    });

    if (result.success) {
      setStatus('success');
      setMessage(result.result.message);
      setTimeout(() => {
        onSuccess(result.result);
      }, 1500);
    } else {
      setStatus('failed');
      setMessage(result.result.reason);
      setCanRetry(result.result.canRetry);
    }
  };

  const handleQRScan = () => {
    // Simulate user scanning QR code
    startVerification();
  };

  const handleRetry = () => {
    setStatus('idle');
    setMessage('');
    setCanRetry(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <FiSmartphone className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Identity Verification</h3>
              <p className="text-sm text-gray-500">Verify {ownerName || 'your identity'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-2"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'verifying' ? (
            // Verifying State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLoader className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Verification in Progress</h4>
              <p className="text-gray-400 text-sm">{message}</p>
              <div className="mt-6">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse-slow w-2/3" />
                </div>
              </div>
            </div>
          ) : status === 'success' ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Verification Complete</h4>
              <p className="text-green-400 text-sm">{message}</p>
            </div>
          ) : status === 'failed' ? (
            // Failed State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Verification Failed</h4>
              <p className="text-red-400 text-sm mb-6">{message}</p>
              {canRetry && (
                <button
                  onClick={handleRetry}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          ) : (
            // Idle State - Show QR or SMS
            <>
              {/* Tab Switcher */}
              <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setMode('qr')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    mode === 'qr'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <FiSmartphone className="w-4 h-4" />
                  <span>QR Code</span>
                </button>
                <button
                  onClick={() => setMode('sms')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    mode === 'sms'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <FiMessageSquare className="w-4 h-4" />
                  <span>SMS Link</span>
                </button>
              </div>

              {mode === 'qr' ? (
                // QR Code Mode
                <div className="text-center">
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <QRCode
                      value={qrData}
                      size={180}
                      level="M"
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Scan this QR code with your mobile device to complete identity verification
                  </p>
                  <button
                    onClick={handleQRScan}
                    className="btn-primary w-full"
                  >
                    I've Scanned the Code
                  </button>
                </div>
              ) : (
                // SMS Mode
                <div>
                  <p className="text-sm text-gray-400 mb-4">
                    Enter your phone number to receive a verification link via SMS
                  </p>
                  <div className="mb-4">
                    <label className="label-text" htmlFor="sms-phone">
                      Phone Number
                    </label>
                    <input
                      id="sms-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="input-field"
                      placeholder="5551234567"
                    />
                  </div>
                  {message && (
                    <p className={`text-sm mb-4 ${status === 'sending' ? 'text-indigo-400' : 'text-red-400'}`}>
                      {message}
                    </p>
                  )}
                  <button
                    onClick={handleSendSMS}
                    disabled={status === 'sending'}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {status === 'sending' ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiMessageSquare className="w-4 h-4" />
                        <span>Send Verification Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="px-6 pb-6">
            <p className="text-xs text-gray-500 text-center">
              By verifying, you consent to our{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300">
                Identity Verification Policy
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
