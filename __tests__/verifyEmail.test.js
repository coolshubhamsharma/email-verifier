jest.mock("../src/utils/dnsLookup");
jest.mock("../src/utils/smtpVerify");

const resolveMx = require("../src/utils/dnsLookup");
const verifyMailbox = require("../src/utils/smtpVerify");
const verifyEmail = require("../src/verifyEmail");

describe("verifyEmail Integration", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Valid email full success flow", async () => {
    resolveMx.mockResolvedValue({
      success: true,
      mxRecords: ["mx.test.com"],
      error: null
    });

    verifyMailbox.mockResolvedValue({
      status: "valid",
      subresult: "mailbox_exists",
      smtpCode: 250,
      error: null
    });

    const result = await verifyEmail("user@gmail.com");

    expect(result.result).toBe("valid");
    expect(result.resultcode).toBe(1);
    expect(result.subresult).toBe("mailbox_exists");
  });

  test("SMTP 550 returns invalid", async () => {
    resolveMx.mockResolvedValue({
      success: true,
      mxRecords: ["mx.test.com"],
      error: null
    });

    verifyMailbox.mockResolvedValue({
      status: "invalid",
      subresult: "mailbox_does_not_exist",
      smtpCode: 550,
      error: null
    });

    const result = await verifyEmail("user@gmail.com");

    expect(result.result).toBe("invalid");
    expect(result.resultcode).toBe(6);
  });

  test("SMTP 450 returns unknown", async () => {
    resolveMx.mockResolvedValue({
      success: true,
      mxRecords: ["mx.test.com"],
      error: null
    });

    verifyMailbox.mockResolvedValue({
      status: "unknown",
      subresult: "greylisted",
      smtpCode: 450,
      error: null
    });

    const result = await verifyEmail("user@gmail.com");

    expect(result.result).toBe("unknown");
    expect(result.resultcode).toBe(3);
  });

  test("DNS failure returns invalid", async () => {
    resolveMx.mockResolvedValue({
      success: false,
      mxRecords: [],
      error: "ENOTFOUND"
    });

    const result = await verifyEmail("user@invaliddomain.com");

    expect(result.result).toBe("invalid");
    expect(result.subresult).toBe("ENOTFOUND");
  });

  test("Typo detected returns invalid with suggestion", async () => {
    const result = await verifyEmail("user@gmial.com");

    expect(result.result).toBe("invalid");
    expect(result.subresult).toBe("typo_detected");
    expect(result.didyoumean).toBe("user@gmail.com");
  });

  test("Invalid syntax rejected immediately", async () => {
    const result = await verifyEmail("invalid-email");

    expect(result.result).toBe("invalid");
  });

  test("Empty string handled", async () => {
    const result = await verifyEmail("");

    expect(result.result).toBe("invalid");
  });

  test("Null handled safely", async () => {
    const result = await verifyEmail(null);

    expect(result.result).toBe("invalid");
  });

  test("Execution time exists", async () => {
    resolveMx.mockResolvedValue({
      success: true,
      mxRecords: ["mx.test.com"],
      error: null
    });

    verifyMailbox.mockResolvedValue({
      status: "valid",
      subresult: "mailbox_exists",
      smtpCode: 250,
      error: null
    });

    const result = await verifyEmail("user@gmail.com");

    expect(result.executiontime).toBeDefined();
    expect(typeof result.executiontime).toBe("number");
  });

});
