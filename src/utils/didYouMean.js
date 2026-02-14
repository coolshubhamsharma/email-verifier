const levenshteinDistance = require("./levenshtein");

const KNOWN_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com"
];

function getDidYouMean(email) {
  if (!email || typeof email !== "string") {
    return null;
  }

  email = email.trim();

  const parts = email.split("@");

  if (parts.length !== 2) {
    return null;
  }

  const localPart = parts[0];
  const domain = parts[1].toLowerCase();

  let closestMatch = null;
  let smallestDistance = Infinity;

  for (const provider of KNOWN_PROVIDERS) {
    const distance = levenshteinDistance(domain, provider);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestMatch = provider;
    }
  }

  // Suggest only if edit distance ≤ 2 AND domain not already correct
  if (smallestDistance <= 2 && closestMatch !== domain) {
    return `${localPart}@${closestMatch}`;
  }

  return null;
}

module.exports = getDidYouMean;
