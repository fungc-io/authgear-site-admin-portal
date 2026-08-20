import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  ChoiceGroup,
  Dropdown,
  IconButton,
  IChoiceGroupOption,
  IDropdownOption,
  TextField,
} from "@fluentui/react";
import styles from "./UsageLimitListFieldControl.module.css";

export interface UsageLimitRule {
  quota: number;
  period: "day" | "month";
  action: "alert" | "block";
}

export interface UsageLimitListFieldControlProps {
  /**
   * Current override value:
   * - `undefined` — not overridden, inherit from plan
   * - `[]` — explicitly overridden to no limit (Limiter.Reserve treats a
   *   nil and an explicit empty rule list identically — see pkg/lib/usage/limit.go)
   * - non-empty — a specific set of quota rules
   */
  value: UsageLimitRule[] | undefined;
  disabled?: boolean;
  onChange: (value: UsageLimitRule[] | undefined) => void;
}

type Mode = "inherit" | "noLimit" | "custom";

function deriveMode(value: UsageLimitRule[] | undefined): Mode {
  if (value === undefined) return "inherit";
  if (value.length === 0) return "noLimit";
  return "custom";
}

const MODE_OPTIONS: IChoiceGroupOption[] = [
  { key: "inherit", text: "Inherit from plan" },
  { key: "noLimit", text: "No limit" },
  { key: "custom", text: "Set limit(s)" },
];

const PERIOD_OPTIONS: IDropdownOption[] = [
  { key: "day", text: "Day" },
  { key: "month", text: "Month" },
];

const ACTION_OPTIONS: IDropdownOption[] = [
  { key: "alert", text: "Alert (notify only)" },
  { key: "block", text: "Block (enforce quota)" },
];

const DEFAULT_RULE: UsageLimitRule = {
  quota: 0,
  period: "month",
  action: "alert",
};

interface RuleRowProps {
  rule: UsageLimitRule;
  disabled?: boolean;
  onChange: (rule: UsageLimitRule) => void;
  onRemove: () => void;
}

/**
 * Own component (not inlined in the list) so the quota text field can hold
 * local, per-row text state -- mirroring NumberFieldControl's tolerance for
 * in-progress input (e.g. a momentarily empty field while retyping) without
 * that state getting mixed up across rows when one is added or removed.
 */
function RuleRow({ rule, disabled, onChange, onRemove }: RuleRowProps) {
  const [quotaText, setQuotaText] = useState(String(rule.quota));

  useEffect(() => {
    setQuotaText(String(rule.quota));
  }, [rule.quota]);

  const onQuotaChange = useCallback(
    (
      _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      newValue?: string
    ) => {
      const nextText = newValue ?? "";
      setQuotaText(nextText);
      const parsed = Number(nextText);
      if (nextText.trim() !== "" && Number.isFinite(parsed) && parsed >= 0) {
        onChange({ ...rule, quota: Math.trunc(parsed) });
      }
    },
    [rule, onChange]
  );

  return (
    <div className={styles.ruleRow}>
      <TextField
        className={styles.quotaInput}
        type="number"
        min={0}
        label="Quota"
        value={quotaText}
        disabled={disabled}
        onChange={onQuotaChange}
      />
      <Dropdown
        className={styles.periodDropdown}
        label="Period"
        options={PERIOD_OPTIONS}
        selectedKey={rule.period}
        disabled={disabled}
        onChange={(_e, option) =>
          option &&
          onChange({ ...rule, period: option.key as UsageLimitRule["period"] })
        }
      />
      <Dropdown
        className={styles.actionDropdown}
        label="Action"
        options={ACTION_OPTIONS}
        selectedKey={rule.action}
        disabled={disabled}
        onChange={(_e, option) =>
          option &&
          onChange({ ...rule, action: option.key as UsageLimitRule["action"] })
        }
      />
      <IconButton
        className={styles.removeButton}
        iconProps={{ iconName: "Delete" }}
        title="Remove limit"
        ariaLabel="Remove limit"
        disabled={disabled}
        onClick={onRemove}
      />
    </div>
  );
}

const UsageLimitListFieldControl: React.VFC<UsageLimitListFieldControlProps> =
  function UsageLimitListFieldControl({ value, disabled, onChange }) {
    // Mirrors CountryListFieldControl: an empty "custom" list is
    // value-indistinguishable from "noLimit" by value alone -- this local
    // state lets a user keep editing a list they've emptied down to zero
    // rules without the control silently flipping back to "No limit".
    const [mode, setMode] = useState<Mode>(() => deriveMode(value));

    useEffect(() => {
      if (value === undefined) {
        setMode("inherit");
      } else if (value.length > 0) {
        setMode("custom");
      }
    }, [value]);

    const rules = useMemo(() => value ?? [], [value]);

    const onModeChange = useCallback(
      (
        _e?: React.FormEvent<HTMLElement | HTMLInputElement>,
        option?: IChoiceGroupOption
      ) => {
        const next = (option?.key as Mode | undefined) ?? "inherit";
        setMode(next);
        if (next === "inherit") {
          onChange(undefined);
        } else if (next === "noLimit") {
          onChange([]);
        } else {
          onChange(value && value.length > 0 ? value : []);
        }
      },
      [onChange, value]
    );

    const updateRuleAt = useCallback(
      (index: number, nextRule: UsageLimitRule) => {
        onChange(rules.map((rule, i) => (i === index ? nextRule : rule)));
      },
      [rules, onChange]
    );

    const removeRuleAt = useCallback(
      (index: number) => {
        onChange(rules.filter((_, i) => i !== index));
      },
      [rules, onChange]
    );

    const addRule = useCallback(() => {
      onChange([...rules, DEFAULT_RULE]);
    }, [rules, onChange]);

    return (
      <div className={styles.root}>
        <ChoiceGroup
          className={styles.modeChoice}
          options={MODE_OPTIONS}
          selectedKey={mode}
          disabled={disabled}
          onChange={onModeChange}
        />
        {mode === "custom" && (
          <div className={styles.rules}>
            {rules.map((rule, index) => (
              <RuleRow
                key={index}
                rule={rule}
                disabled={disabled}
                onChange={(nextRule) => updateRuleAt(index, nextRule)}
                onRemove={() => removeRuleAt(index)}
              />
            ))}
            <ActionButton
              iconProps={{ iconName: "Add" }}
              disabled={disabled}
              onClick={addRule}
            >
              Add limit
            </ActionButton>
          </div>
        )}
      </div>
    );
  };

export default UsageLimitListFieldControl;
