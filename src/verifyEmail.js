const validateSyntax = require("./utils/validateSyntax");
const getDidYouMean = require("./utils/didYouMean");
const resolveMx = require("./utils/dnsLookup");
const verifyMailbox = require("./utils/smtpVerify");

function mapResultCode(result) {
  if (result === "valid") return 1;
  if (result === "unknown") return 3;
  return 6;
}

async function verifyEmail(email) {
  const startTime = process.hrtime();
  const timestamp = new Date().toISOString();

  // Defensive protection against null/undefined/empty
  if (!email) {
    return buildResponse({
      email,
      result: "invalid",
      subresult: "empty_input",
      domain: "",
      mxRecords: [],
      error: null,
      startTime,
      timestamp
    });
  }

  let domain = "";
  let mxRecords = [];
  let error = null;
  let result = "invalid";
  let subresult = "";

  try {
    // 1 Syntax Validation
    const syntaxCheck = validateSyntax(email);

    if (!syntaxCheck.valid) {
      return buildResponse({
        email,
        result: "invalid",
        subresult: syntaxCheck.reason,
        domain: "",
        mxRecords: [],
        error: null,
        startTime,
        timestamp
      });
    }

    // Safe domain extraction
    const parts = email.split("@");
    domain = parts[1].toLowerCase();

    // 2 Did You Mean (before DNS)
    const suggestion = getDidYouMean(email);

    if (suggestion) {
      return buildResponse({
        email,
        result: "invalid",
        subresult: "typo_detected",
        domain,
        mxRecords: [],
        error: null,
        startTime,
        timestamp,
        didyoumean: suggestion
      });
    }

    // 3 DNS MX Lookup
    const dnsResult = await resolveMx(domain);

    if (!dnsResult.success) {
      const dnsError = dnsResult.error;

      const invalidDomainErrors = ["ENOTFOUND", "ENODATA", "no_mx_records"];

      const finalResult = invalidDomainErrors.includes(dnsError)
        ? "invalid"
        : "unknown";

      return buildResponse({
        email,
        result: finalResult,
        subresult: dnsError,
        domain,
        mxRecords: [],
        error: dnsError, // FIX: propagate DNS error
        startTime,
        timestamp
      });
    }

    mxRecords = dnsResult.mxRecords;

    // 4 SMTP Verification with MX fallback
    let smtpResult = null;

    for (const mxHost of mxRecords) {
      smtpResult = await verifyMailbox(mxHost, email);

      if (!smtpResult) continue;

      // If definitive answer, stop
      if (
        smtpResult.status === "valid" ||
        smtpResult.status === "invalid"
      ) {
        break;
      }

      // Retry next MX only on connection_error
      if (smtpResult.subresult === "connection_error") {
        continue;
      }

      break;
    }

    // Defensive fallback
    if (!smtpResult) {
      return buildResponse({
        email,
        result: "unknown",
        subresult: "smtp_unreachable",
        domain,
        mxRecords,
        error: "smtp_unreachable",
        startTime,
        timestamp
      });
    }

    result = smtpResult.status;
    subresult = smtpResult.subresult;
    error = smtpResult.error;

    return buildResponse({
      email,
      result,
      subresult,
      domain,
      mxRecords,
      error,
      startTime,
      timestamp
    });

  } catch (err) {
    return buildResponse({
      email,
      result: "unknown",
      subresult: "internal_error",
      domain,
      mxRecords,
      error: err.message,
      startTime,
      timestamp
    });
  }
}

function buildResponse({
  email,
  result,
  subresult,
  domain,
  mxRecords,
  error,
  startTime,
  timestamp,
  didyoumean
}) {
  const diff = process.hrtime(startTime);
  const executiontime = diff[0] + diff[1] / 1e9;

  const response = {
    email,
    result,
    resultcode: mapResultCode(result),
    subresult,
    domain,
    mxRecords,
    executiontime,
    error,
    timestamp
  };

  if (didyoumean) {
    response.didyoumean = didyoumean;
  }

  return response;
}

module.exports = verifyEmail;
