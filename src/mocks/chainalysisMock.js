/**
 * Mock Chainalysis wallet screening function
 * Simulates the Chainalysis KYT (Know Your Transaction) API
 */

const RISK_LEVELS = ['low', 'medium', 'high'];

const LOW_RISK_REASONS = [
  'Clean transaction history',
  'No flagged interactions detected',
  'Wallet activity consistent with declared usage',
  'All sources verified and legitimate',
  'Standard trading patterns observed',
];

const MEDIUM_RISK_REASONS = [
  'Minor exposure to unhosted wallets',
  'Some transactions with unlicensed exchanges',
  'Occasional privacy tool usage detected',
  'Cross-chain transfers requiring review',
  'Indirect exposure to flagged entities (<1%)',
];

const HIGH_RISK_REASONS = [
  'Direct interaction with sanctioned addresses',
  'High exposure to darknet markets',
  'Tainted USDT from known mixer services',
  'Significant ransomware-linked funds detected',
  'Multiple transactions with OFAC-listed entities',
  'Funds traced to known scam operations',
  'High-volume transfers from restricted jurisdictions',
];

/**
 * Simulates a Chainalysis wallet scan
 * @param {string} walletAddress - The wallet address to scan
 * @param {object} context - Optional context for contextual flagging
 * @returns {Promise<{risk: string, score: number, reason: string, details: object}>}
 */
export async function scanWallet(walletAddress, context = {}) {
  // Simulate API latency (1.5-3 seconds)
  const delay = 1500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Validate wallet address format (basic check)
  if (!walletAddress || walletAddress.length < 26) {
    throw new Error('Invalid wallet address format');
  }

  // Deterministic risk based on address characteristics for demo consistency
  let riskIndex;
  const addressSum = walletAddress
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  // 70% low risk, 20% medium risk, 10% high risk
  const rand = (addressSum % 100) / 100;
  if (rand < 0.7) {
    riskIndex = 0; // low
  } else if (rand < 0.9) {
    riskIndex = 1; // medium
  } else {
    riskIndex = 2; // high
  }

  const risk = RISK_LEVELS[riskIndex];
  let reasons;
  switch (risk) {
    case 'high':
      reasons = HIGH_RISK_REASONS;
      break;
    case 'medium':
      reasons = MEDIUM_RISK_REASONS;
      break;
    default:
      reasons = LOW_RISK_REASONS;
  }

  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  const score = risk === 'low' ? Math.floor(Math.random() * 30) :
                risk === 'medium' ? 30 + Math.floor(Math.random() * 40) :
                70 + Math.floor(Math.random() * 30);

  // Contextual flagging based on activity profile
  let contextualFlag = null;
  if (context.monthlyVolume && context.monthlyVolume.includes('10M')) {
    if (risk === 'low' && score < 20) {
      // High volume but pristine wallet - could be suspicious
      contextualFlag = {
        type: 'volume_mismatch',
        message: 'High declared volume with limited on-chain history',
        severity: 'info',
      };
    }
  }

  // Check for high-risk countries
  if (context.operatingCountries) {
    const highRiskCountries = ['CU', 'IR', 'KP', 'SY', 'RU'];
    const hasHighRiskCountry = context.operatingCountries.some((c) =>
      highRiskCountries.includes(c)
    );
    if (hasHighRiskCountry) {
      contextualFlag = {
        type: 'jurisdiction_risk',
        message: 'Operating in restricted or high-risk jurisdiction',
        severity: 'warning',
      };
    }
  }

  return {
    risk,
    score,
    reason,
    walletAddress,
    timestamp: new Date().toISOString(),
    details: {
      transactionCount: Math.floor(Math.random() * 1000) + 50,
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalVolume: `$${(Math.random() * 10000000).toFixed(2)}`,
      riskFactors: risk !== 'low' ? [reason] : [],
      contextualFlag,
    },
  };
}

/**
 * Get risk level color for UI
 * @param {string} risk - Risk level
 * @returns {string} - Tailwind color class
 */
export function getRiskColor(risk) {
  switch (risk) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get risk level background color for UI
 * @param {string} risk - Risk level
 * @returns {string} - Tailwind background color class
 */
export function getRiskBgColor(risk) {
  switch (risk) {
    case 'low':
      return 'bg-green-500/10 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'high':
      return 'bg-red-500/10 border-red-500/30';
    default:
      return 'bg-gray-500/10 border-gray-500/30';
  }
}

export default { scanWallet, getRiskColor, getRiskBgColor };
