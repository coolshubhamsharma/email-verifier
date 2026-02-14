const getDidYouMean = require("../src/utils/didYouMean");

describe("Did You Mean Detection", () => {
  test("Detect gmial.com typo", () => {
    const result = getDidYouMean("user@gmial.com");
    expect(result).toBe("user@gmail.com");
  });

  test("Detect yahooo.com typo", () => {
    const result = getDidYouMean("user@yahooo.com");
    expect(result).toBe("user@yahoo.com");
  });

  test("Detect hotmial.com typo", () => {
    const result = getDidYouMean("user@hotmial.com");
    expect(result).toBe("user@hotmail.com");
  });

  test("Correct domain returns null", () => {
    const result = getDidYouMean("user@gmail.com");
    expect(result).toBeNull();
  });

  test("Unknown random domain returns null", () => {
    const result = getDidYouMean("user@randomdomain123.com");
    expect(result).toBeNull();
  });

  test("Invalid format returns null", () => {
    const result = getDidYouMean("invalid-email");
    expect(result).toBeNull();
  });

  test("Null input returns null", () => {
    const result = getDidYouMean(null);
    expect(result).toBeNull();
  });
});
