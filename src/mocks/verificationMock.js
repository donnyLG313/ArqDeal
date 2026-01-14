/**
 * Mock identity verification service
 * Simulates mobile verification flow (like Persona, Onfido, etc.)
 */

const VERIFICATION_STATES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Generate a mock verification session ID
 * @returns {string}
 */
export function generateSessionId() {
  return `vs_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate QR code data for mobile verification
 * @param {string} sessionId - The verification session ID
 * @returns {string} - QR code content URL
 */
export function generateQRCodeData(sessionId) {
  // In production, this would be a deep link to the mobile verification app
  return `https://verify.arqitech.com/session/${sessionId}`;
}

/**
 * Send SMS verification link (mock)
 * @param {string} phoneNumber - Phone number to send SMS to
 * @param {string} sessionId - Verification session ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendVerificationSMS(phoneNumber, sessionId) {
  // Simulate SMS API latency
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

  // Validate phone number (basic check)
  if (!phoneNumber || phoneNumber.length < 10) {
    return {
      success: false,
      message: 'Invalid phone number format',
    };
  }

  // 95% success rate for SMS delivery
  const success = Math.random() < 0.95;

  return {
    success,
    message: success
      ? `Verification link sent to ${phoneNumber.slice(-4).padStart(phoneNumber.length, '*')}`
      : 'Failed to send SMS. Please try again.',
    sessionId,
  };
}

/**
 * Check verification status (mock)
 * @param {string} sessionId - Verification session ID
 * @returns {Promise<{status: string, result: object|null}>}
 */
export async function checkVerificationStatus(sessionId) {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock status based on session
  return {
    status: VERIFICATION_STATES.PENDING,
    sessionId,
    createdAt: new Date().toISOString(),
    result: null,
  };
}

/**
 * Simulate the full verification process
 * @param {object} options - Verification options
 * @returns {Promise<{success: boolean, status: string, result: object}>}
 */
export async function simulateVerification(options = {}) {
  const {
    duration = 3000,
    successRate = 0.85,
    ownerName = 'Unknown',
  } = options;

  // Simulate verification in progress
  await new Promise((resolve) => setTimeout(resolve, duration));

  // Determine success based on rate
  const success = Math.random() < successRate;

  if (success) {
    return {
      success: true,
      status: VERIFICATION_STATES.COMPLETED,
      result: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        documentType: 'PASSPORT',
        documentCountry: 'US',
        nameMatch: true,
        addressMatch: true,
        dobMatch: true,
        riskSignals: [],
        confidenceScore: 85 + Math.floor(Math.random() * 15),
        verificationId: `ver_${Date.now()}`,
        message: `Identity verified for ${ownerName}`,
      },
    };
  } else {
    const failureReasons = [
      'Document image quality too low',
      'Face match confidence below threshold',
      'Document may be expired',
      'Unable to verify address from document',
      'Verification session timed out',
    ];

    return {
      success: false,
      status: VERIFICATION_STATES.FAILED,
      result: {
        verified: false,
        failedAt: new Date().toISOString(),
        reason: failureReasons[Math.floor(Math.random() * failureReasons.length)],
        canRetry: true,
        message: 'Verification failed. Please try again.',
      },
    };
  }
}

/**
 * Mock document upload function
 * @param {File} file - The uploaded file
 * @returns {Promise<{success: boolean, documentId: string}>}
 */
export async function uploadDocument(file) {
  // Simulate upload time based on file size (mock)
  const uploadTime = 500 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, uploadTime));

  // 98% success rate for uploads
  const success = Math.random() < 0.98;

  if (success) {
    return {
      success: true,
      documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      fileName: file?.name || 'document.pdf',
      uploadedAt: new Date().toISOString(),
    };
  } else {
    return {
      success: false,
      error: 'Upload failed. Please try again.',
    };
  }
}

export { VERIFICATION_STATES };

export default {
  generateSessionId,
  generateQRCodeData,
  sendVerificationSMS,
  checkVerificationStatus,
  simulateVerification,
  uploadDocument,
  VERIFICATION_STATES,
};
