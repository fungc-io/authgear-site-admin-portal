/**
 * Declarative table-view field list for the Feature Config tab.
 *
 * Adding another feature-config field to the table means adding one entry
 * here — the table-rendering component (`FeatureConfigTableView.tsx`) is a
 * single generic loop over this array, dispatching to a control component per
 * `control` kind. It never branches on individual field names. Extend the
 * `FieldControlKind` union only when a genuinely new UI widget is needed.
 *
 * `jsonPointer` is an RFC 6901 pointer into the `FeatureConfig` object,
 * verified against the Go struct tags in
 * `authgear-server/pkg/lib/config/feature_*.go`.
 */

export type FieldControlKind =
  | "boolean"
  | "number"
  | "countryList"
  | "usageLimitList";

export interface FieldDef {
  jsonPointer: string;
  label: string;
  control: FieldControlKind;
  /** Display-only grouping used to render section header rows in the table view. */
  section?: string;
}

// Section order: most frequently adjusted settings first (per project owner).
export const FIELD_REGISTRY: FieldDef[] = [
  {
    jsonPointer: "/ui/white_labeling/disabled",
    label: "Disable white labeling",
    control: "boolean",
    section: "UI",
  },
  {
    jsonPointer: "/oauth/client/custom_ui_enabled",
    label: "Custom UI enabled",
    control: "boolean",
    section: "OAuth Client",
  },
  {
    jsonPointer: "/oauth/client/app2app_enabled",
    label: "App2App enabled",
    control: "boolean",
    section: "OAuth Client",
  },
  {
    jsonPointer: "/oauth/client/soft_maximum",
    label: "Soft maximum OAuth clients",
    control: "number",
    section: "OAuth Client",
  },
  {
    jsonPointer: "/oauth/client/maximum",
    label: "Maximum OAuth clients",
    control: "number",
    section: "OAuth Client",
  },
  {
    jsonPointer: "/ui/phone_input/allowlist",
    label: "Phone input country allowlist",
    control: "countryList",
    section: "Phone Input",
  },
  {
    jsonPointer: "/usage/limits/email",
    label: "Email usage limit",
    control: "usageLimitList",
    section: "Usage Limit",
  },
  {
    jsonPointer: "/usage/limits/sms",
    label: "SMS usage limit",
    control: "usageLimitList",
    section: "Usage Limit",
  },
  {
    jsonPointer: "/usage/limits/whatsapp",
    label: "WhatsApp usage limit",
    control: "usageLimitList",
    section: "Usage Limit",
  },
  {
    jsonPointer: "/usage/limits/user_export",
    label: "User export usage limit",
    control: "usageLimitList",
    section: "Usage Limit",
  },
  {
    jsonPointer: "/usage/limits/user_import",
    label: "User import usage limit",
    control: "usageLimitList",
    section: "Usage Limit",
  },
  {
    jsonPointer: "/fraud_protection/is_modifiable",
    label: "Fraud protection is modifiable",
    control: "boolean",
    section: "Fraud Protection",
  },
  {
    jsonPointer: "/messaging/custom_sms_provider_disabled",
    label: "Disable custom SMS provider",
    control: "boolean",
    section: "Messaging",
  },
  {
    jsonPointer: "/messaging/custom_smtp_disabled",
    label: "Disable custom SMTP",
    control: "boolean",
    section: "Messaging",
  },
  {
    jsonPointer: "/messaging/template_customization_disabled",
    label: "Disable template customization",
    control: "boolean",
    section: "Messaging",
  },
  {
    jsonPointer: "/audit_log/retrieval_days",
    label: "Audit log retrieval days",
    control: "number",
    section: "Audit Log",
  },
  {
    jsonPointer: "/hook/blocking_handler/maximum",
    label: "Maximum blocking hook handlers",
    control: "number",
    section: "Hook",
  },
  {
    jsonPointer: "/hook/non_blocking_handler/maximum",
    label: "Maximum non-blocking hook handlers",
    control: "number",
    section: "Hook",
  },
];
