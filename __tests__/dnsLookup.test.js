jest.mock("dns", () => ({
  promises: {
    resolveMx: jest.fn()
  }
}));

const dns = require("dns").promises;
const resolveMx = require("../src/utils/dnsLookup");

describe("DNS MX Lookup", () => {

  test("Returns sorted MX records", async () => {
    dns.resolveMx.mockResolvedValue([
      { exchange: "mx2.test.com", priority: 20 },
      { exchange: "mx1.test.com", priority: 10 }
    ]);

    const result = await resolveMx("test.com");

    expect(result.success).toBe(true);
    expect(result.mxRecords[0]).toBe("mx1.test.com");
  });

  test("Handles no MX records", async () => {
    dns.resolveMx.mockResolvedValue([]);

    const result = await resolveMx("nomx.com");

    expect(result.success).toBe(false);
    expect(result.error).toBe("no_mx_records");
  });

  test("Handles DNS error", async () => {
    dns.resolveMx.mockRejectedValue({ code: "ENOTFOUND" });

    const result = await resolveMx("invalid.com");

    expect(result.success).toBe(false);
    expect(result.error).toBe("ENOTFOUND");
  });

});
