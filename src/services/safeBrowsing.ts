/**
 * Google Safe Browsing Lookup API (v4) service
 * Free tier: up to 10,000 requests per day
 * https://developers.google.com/safe-browsing/v4/lookup-api
 */

export interface SafetyCheckResult {
  safe: boolean;
  url: string;
  threatType?: string | null;
  platformType?: string | null;
  source: 'google_safe_browsing' | 'local_heuristics';
  isConfigured: boolean;
  message?: string;
}

// Local heuristics fallback when API key is not configured or offline
function evaluateLocalHeuristics(urlStr: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    // Bare IP check
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
      return { safe: false, reason: 'Raw IP address hostname' };
    }

    // High risk TLDs
    const highRiskTlds = new Set(['zip', 'mov', 'buzz', 'fit', 'icu', 'racing', 'country', 'gdn', 'work']);
    const tld = host.split('.').pop() || '';
    if (highRiskTlds.has(tld)) {
      return { safe: false, reason: `High-risk TLD (.${tld})` };
    }

    // Phishing userinfo '@' symbol
    if (urlStr.includes('@')) {
      return { safe: false, reason: 'Misleading credentials (@) in URL' };
    }

    // Deep subdomains (typosquatting)
    if (host.split('.').length >= 5) {
      return { safe: false, reason: 'Excessive subdomain nesting' };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Malformed URL' };
  }
}

export async function checkUrlSafety(targetUrl: string): Promise<SafetyCheckResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY || process.env.SAFE_BROWSING_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Graceful fallback to local heuristics if user hasn't set an API key yet
    const local = evaluateLocalHeuristics(targetUrl);
    return {
      safe: local.safe,
      url: targetUrl,
      threatType: local.safe ? null : (local.reason || 'SUSPICIOUS_HEURISTIC'),
      source: 'local_heuristics',
      isConfigured: false,
      message: local.safe
        ? 'URL passed local security heuristics (Google Safe Browsing key not configured).'
        : `URL flagged by local heuristics: ${local.reason}.`,
    };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey.trim())}`;

  const payload = {
    client: {
      clientId: 'linko-url-shortener',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: targetUrl }],
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[SafeBrowsing API Error] status ${response.status}:`, errText);
      // Fallback on HTTP errors (e.g. invalid key or quota)
      const local = evaluateLocalHeuristics(targetUrl);
      return {
        safe: local.safe,
        url: targetUrl,
        threatType: local.safe ? null : local.reason,
        source: 'local_heuristics',
        isConfigured: true,
        message: `Safe Browsing API returned status ${response.status}. Fallback heuristics applied.`,
      };
    }

    const data = (await response.json()) as {
      matches?: Array<{
        threatType: string;
        platformType: string;
        threatEntryType: string;
        threat?: { url: string };
      }>;
    };

    if (data.matches && data.matches.length > 0) {
      const first = data.matches[0];
      return {
        safe: false,
        url: targetUrl,
        threatType: first.threatType,
        platformType: first.platformType,
        source: 'google_safe_browsing',
        isConfigured: true,
        message: `Threat detected by Google Safe Browsing: ${first.threatType}.`,
      };
    }

    return {
      safe: true,
      url: targetUrl,
      source: 'google_safe_browsing',
      isConfigured: true,
      message: 'Verified safe by Google Safe Browsing.',
    };
  } catch (err: any) {
    console.error('[SafeBrowsing Network Error]:', err?.message);
    const local = evaluateLocalHeuristics(targetUrl);
    return {
      safe: local.safe,
      url: targetUrl,
      threatType: local.safe ? null : local.reason,
      source: 'local_heuristics',
      isConfigured: true,
      message: 'Network issue contacting Safe Browsing. Fallback heuristics applied.',
    };
  }
}

