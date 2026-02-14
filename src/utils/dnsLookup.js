const dns = require("dns").promises;

async function resolveMx(domain) {
  try {
    const records = await dns.resolveMx(domain);

    if (!records || records.length === 0) {
      return {
        success: false,
        mxRecords: [],
        error: "no_mx_records"
      };
    }

    // Sort by priority (lower = higher priority)
    const sorted = records.sort((a, b) => a.priority - b.priority);

    return {
      success: true,
      mxRecords: sorted.map(record => record.exchange),
      error: null
    };

  } catch (err) {
    return {
      success: false,
      mxRecords: [],
      error: err.code || "dns_lookup_failed"
    };
  }
}

module.exports = resolveMx;
