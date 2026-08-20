import type { FieldDef } from "./fieldRegistry";
import type { UsageLimitRule } from "./UsageLimitListFieldControl";

function isUsageLimitRule(v: unknown): v is UsageLimitRule {
  return (
    typeof v === "object" &&
    v !== null &&
    "quota" in v &&
    "period" in v &&
    "action" in v
  );
}

/**
 * Formats a field's plan value for the table's read-only "Plan Config"
 * column. Extracted from FeatureConfigTableView.tsx (a plain function,
 * not a component) so it can be unit tested without the
 * react-refresh/only-export-components lint rule flagging a non-component
 * export alongside the table view component.
 */
export function formatDisplayValue(
  control: FieldDef["control"],
  v: unknown
): string {
  if (control === "countryList") {
    // nil (the section/field was never set at all) and an explicit empty
    // list are equivalent here -- both mean "no restriction, all countries
    // allowed" (see IntersectAllowlist), matching CountryListFieldControl's
    // own "Allow all countries" mode label for the same value. Checked
    // before the generic null/undefined case below, which would otherwise
    // show a meaningless "—" for a value that actually has a clear meaning.
    if (v == null) return "Allow all countries";
    if (Array.isArray(v)) {
      return v.length === 0 ? "Allow all countries" : v.join(", ");
    }
  }
  if (control === "usageLimitList") {
    // nil and an explicit empty rule list are equivalent -- Limiter.Reserve
    // (pkg/lib/usage/limit.go) treats len(limits) == 0 as "no limit
    // enforced" either way, matching UsageLimitListFieldControl's own "No
    // limit" mode label for the same value.
    if (v == null) return "No limit";
    if (Array.isArray(v)) {
      if (v.length === 0) return "No limit";
      const lines = v.map((rule) =>
        isUsageLimitRule(rule)
          ? `${rule.quota}/${rule.period} (${rule.action})`
          : String(rule)
      );
      // A newline per rule reads far more clearly than a comma-joined run-on
      // once there's more than one -- see .planValue's white-space: pre-line.
      return lines.length > 1 ? lines.join("\n") : lines[0];
    }
  }
  if (v === undefined || v === null) return "—";
  // "Yes"/"No" rather than "Enabled"/"Disabled": most fields here are
  // negative-polarity "disabled" flags, where true means the plan disables
  // the feature -- "Enabled" for true would say the opposite of what the
  // field means. Yes/No answers the field's label directly regardless of
  // polarity, matching BooleanFieldControl's own toggle text.
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
