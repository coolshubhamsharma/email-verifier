function levenshteinDistance(str1, str2) {
  if (typeof str1 !== "string" || typeof str2 !== "string") {
    throw new Error("Inputs must be strings");
  }

  const m = str1.length;
  const n = str2.length;

  // Create DP matrix
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  // Initialize first column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i; // delete all characters
  }

  // Initialize first row
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j; // insert all characters
  }

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
      }
    }
  }

  return dp[m][n];
}

module.exports = levenshteinDistance;
