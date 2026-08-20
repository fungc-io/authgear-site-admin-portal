import { formatDisplayValue } from "../formatDisplayValue";

/**
 * Pins that nil and an explicit empty list are treated identically for the
 * countryList control -- both mean "no restriction" (IntersectAllowlist),
 * matching CountryListFieldControl's own "Allow all countries" label. A
 * plan that never sets phone_input.allowlist produces a nil AllowList
 * (Go's zero value for an unset slice), distinct from an app override
 * explicitly clearing it to [] -- both must display the same way.
 */

test("countryList: nil shows 'Allow all countries', not the generic dash", () => {
  expect(formatDisplayValue("countryList", null)).toBe("Allow all countries");
  expect(formatDisplayValue("countryList", undefined)).toBe(
    "Allow all countries"
  );
});

test("countryList: explicit empty list also shows 'Allow all countries'", () => {
  expect(formatDisplayValue("countryList", [])).toBe("Allow all countries");
});

test("countryList: non-empty list joins the codes", () => {
  expect(formatDisplayValue("countryList", ["US", "GB"])).toBe("US, GB");
});

test("boolean/number controls keep the generic dash for nil", () => {
  expect(formatDisplayValue("boolean", null)).toBe("—");
  expect(formatDisplayValue("number", undefined)).toBe("—");
});

test("boolean control formats true/false as Yes/No", () => {
  expect(formatDisplayValue("boolean", true)).toBe("Yes");
  expect(formatDisplayValue("boolean", false)).toBe("No");
});

/**
 * Pins that nil and an explicit empty rule list are treated identically for
 * the usageLimitList control -- both mean "no limit enforced"
 * (Limiter.Reserve in pkg/lib/usage/limit.go treats len(limits) == 0 as
 * unrestricted either way), matching UsageLimitListFieldControl's own
 * "No limit" mode label for the same value.
 */

test("usageLimitList: nil and an explicit empty list both show 'No limit'", () => {
  expect(formatDisplayValue("usageLimitList", null)).toBe("No limit");
  expect(formatDisplayValue("usageLimitList", undefined)).toBe("No limit");
  expect(formatDisplayValue("usageLimitList", [])).toBe("No limit");
});

test("usageLimitList: formats each rule as quota/period (action)", () => {
  expect(
    formatDisplayValue("usageLimitList", [
      { quota: 10000, period: "month", action: "block" },
    ])
  ).toBe("10000/month (block)");
});

test("usageLimitList: joins multiple rules with a newline, not a comma", () => {
  expect(
    formatDisplayValue("usageLimitList", [
      { quota: 10000, period: "month", action: "block" },
      { quota: 500, period: "day", action: "alert" },
    ])
  ).toBe("10000/month (block)\n500/day (alert)");
});
