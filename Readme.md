## Email Verification Module

# Overview
This project implements a production-oriented Email Verification Module using Node.js.
The system validates email addresses using a layered approach:
1.Syntax validation
2.Typo detection (Levenshtein distance)
3.Typo detection (Levenshtein distance)
4.SMTP mailbox verification (RCPT TO)
5.Structured result classification

The architecture emphasizes modularity, defensive error handling, and deterministic unit testing.

# Features
*RFC-style email syntax validation
*Common provider typo detection (edit distance ≤ 2)
*DNS MX resolution with proper error classification
*SMTP mailbox verification using smtp-connection
*MX fallback support (tries multiple MX records)
*Structured response format as per assignment spec
*Execution time measurement
*15+ Jest test cases with full mocking
*Defensive classification for network failures

# Verification Flow
1.Validate syntax
2.Detect domain typo (if edit distance ≤ 2 → suggest correction)
3.Resolve MX records
4.Attempt SMTP verification (with MX fallback)
5.Return structured response

# SMTP Classification
*SMTP Classification
*Handled response scenarios:
*250 → mailbox exists (valid)
*550 → mailbox does not exist (invalid)
*4xx → temporary failure / greylisting (unknown)
*Connection timeout → unknown
*Connection error → unknown
*MX fallback supported

# Typo Detection
Implements Levenshtein distance (O(m × n)).

Supported providers:
*gmail.com
*yahoo.com
*hotmail.com
*outlook.com
*icloud.com

Suggestions triggered when edit distance ≤ 2.

# Testing

Testing framework: Jest

Mocked components:
*DNS resolution
*SMTP verification
*Test coverage includes:
*Syntax validation
*Typo detection
*DNS error handling
*SMTP error classification
*Edge cases (null, empty, long input)
*Execution time presence
*Result code mapping

# Run Tests
`
npm test

`
# Run Example
`
node src/index.js

`
# Output Review
`
{
  email: 'user@gmial.com',
  result: 'invalid',
  resultcode: 6,
  subresult: 'typo_detected',
  domain: 'gmial.com',
  mxRecords: [],
  executiontime: 0.0017635,
  error: null,
  timestamp: '2026-02-14T10:46:18.438Z',
  didyoumean: 'user@gmail.com'
}
`