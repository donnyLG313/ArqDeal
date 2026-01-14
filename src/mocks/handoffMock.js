/**
 * Mock handoff service for business development team
 * Simulates the final submission and notification process
 */

/**
 * Generate a unique application ID
 * @returns {string}
 */
export function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ARQ-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format the application data for submission
 * @param {object} state - The complete onboarding state
 * @returns {object} - Formatted application data
 */
export function formatApplicationData(state) {
  const { clientType, basics, address, ubo, activity, wallet } = state;

  const formatted = {
    applicationId: generateApplicationId(),
    submittedAt: new Date().toISOString(),
    clientType: clientType === 'individual' ? 'Individual (HNW)' : 'Entity/Company',

    applicantInfo: clientType === 'individual'
      ? {
          name: `${basics.firstName} ${basics.middleName ? basics.middleName + ' ' : ''}${basics.lastName}${basics.suffix ? ' ' + basics.suffix : ''}`,
          email: basics.email,
          phone: `${basics.phoneCountryCode} ${basics.phone}`,
          citizenship: basics.citizenship,
          dob: basics.dob,
        }
      : {
          legalName: basics.legalBusinessName,
          dba: basics.hasDba ? basics.dbaName : null,
          jurisdiction: `${basics.stateOfIncorporation}, ${basics.countryOfIncorporation}`,
          ein: basics.ein,
          phone: basics.businessPhone,
          website: basics.website,
          industry: basics.industry,
          description: basics.activityDescription,
        },

    addresses: {
      primary: {
        street: `${address.street1}${address.street2 ? ', ' + address.street2 : ''}`,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      },
      physical: address.hasSeparatePhysical
        ? {
            street: `${address.physicalStreet1}${address.physicalStreet2 ? ', ' + address.physicalStreet2 : ''}`,
            city: address.physicalCity,
            state: address.physicalState,
            zip: address.physicalZip,
            country: address.physicalCountry,
          }
        : null,
    },

    beneficialOwners: ubo.owners.map((owner) => ({
      name: `${owner.firstName} ${owner.lastName}`,
      email: owner.email,
      ownership: `${owner.ownershipPercentage}%`,
      isControlPerson: owner.isControlPerson,
      idVerified: owner.verified,
    })),

    activityProfile: {
      intendedUse: activity.usageDescription,
      sourcesOfFunds: activity.sourcesOfFunds,
      expectedTradeSize: activity.expectedTradeSize,
      monthlyVolume: activity.monthlyVolume,
      operatingCountries: activity.operatingCountries,
    },

    walletVerification: {
      address: wallet.address,
      riskLevel: wallet.scanResult?.risk,
      riskScore: wallet.scanResult?.score,
      scanReason: wallet.scanResult?.reason,
      scannedAt: wallet.scanResult?.timestamp,
    },

    compliance: {
      eligibilityConfirmed: true,
      safeDisclaimer: true,
      uboCertified: ubo.certified,
    },
  };

  return formatted;
}

/**
 * Save application to localStorage (mock database)
 * @param {object} applicationData - The formatted application data
 * @returns {string} - Application ID
 */
export function saveApplication(applicationData) {
  const applications = JSON.parse(localStorage.getItem('arqitech_applications') || '[]');
  applications.push(applicationData);
  localStorage.setItem('arqitech_applications', JSON.stringify(applications));
  return applicationData.applicationId;
}

/**
 * Get all saved applications (for admin/testing)
 * @returns {array}
 */
export function getAllApplications() {
  return JSON.parse(localStorage.getItem('arqitech_applications') || '[]');
}

/**
 * Mock email notification to bizdev team
 * @param {object} applicationData - The formatted application data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function notifyBizDevTeam(applicationData) {
  // Simulate email API latency
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

  const emailContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW ONBOARDING APPLICATION RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Application ID: ${applicationData.applicationId}
Submitted: ${new Date(applicationData.submittedAt).toLocaleString()}
Client Type: ${applicationData.clientType}

APPLICANT INFORMATION
───────────────────────────────────────────────────
${applicationData.clientType.includes('Individual')
  ? `Name: ${applicationData.applicantInfo.name}
Email: ${applicationData.applicantInfo.email}
Phone: ${applicationData.applicantInfo.phone}
Citizenship: ${applicationData.applicantInfo.citizenship}`
  : `Legal Name: ${applicationData.applicantInfo.legalName}
${applicationData.applicantInfo.dba ? `DBA: ${applicationData.applicantInfo.dba}` : ''}
Jurisdiction: ${applicationData.applicantInfo.jurisdiction}
EIN: ${applicationData.applicantInfo.ein}
Industry: ${applicationData.applicantInfo.industry}`
}

ACTIVITY PROFILE
───────────────────────────────────────────────────
Expected Trade Size: ${applicationData.activityProfile.expectedTradeSize}
Monthly Volume: ${applicationData.activityProfile.monthlyVolume}
Operating Countries: ${applicationData.activityProfile.operatingCountries.join(', ')}

WALLET VERIFICATION
───────────────────────────────────────────────────
Address: ${applicationData.walletVerification.address}
Risk Level: ${applicationData.walletVerification.riskLevel?.toUpperCase() || 'N/A'}
Risk Score: ${applicationData.walletVerification.riskScore || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please review this application in the admin dashboard.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  console.log('📧 Email to bizdev@arqitech.com:');
  console.log(emailContent);

  return {
    success: true,
    message: 'Business development team has been notified',
    emailPreview: emailContent,
  };
}

/**
 * Complete the handoff process
 * @param {object} state - The complete onboarding state
 * @returns {Promise<{success: boolean, applicationId: string, message: string}>}
 */
export async function completeHandoff(state) {
  try {
    // Format the application data
    const applicationData = formatApplicationData(state);

    // Log the complete application summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('APPLICATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(applicationData, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Save to "database"
    const applicationId = saveApplication(applicationData);

    // Send notification
    await notifyBizDevTeam(applicationData);

    return {
      success: true,
      applicationId,
      applicationData,
      message: `Application ${applicationId} has been submitted successfully. Our business development team will contact you within 1-2 business days.`,
    };
  } catch (error) {
    console.error('Handoff error:', error);
    return {
      success: false,
      applicationId: null,
      message: 'An error occurred while submitting your application. Please try again.',
      error: error.message,
    };
  }
}

export default {
  generateApplicationId,
  formatApplicationData,
  saveApplication,
  getAllApplications,
  notifyBizDevTeam,
  completeHandoff,
};
