import { LightningElement, api } from "lwc";

const DEFAULT_VALUE = {
  accountName: null,
  phone: null,
  industry: null,
  contactName: null,
  contactEmail: null
};

const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "Technology" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Retail", value: "Retail" },
  { label: "Other", value: "Other" }
];

const normalizeValue = (rawValue) => {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return null;
  }

  return rawValue;
};

export default class AccountIntakeForm extends LightningElement {
  _readOnly = false;
  _value = { ...DEFAULT_VALUE };

  @api
  get readOnly() {
    return this._readOnly;
  }

  set readOnly(value) {
    this._readOnly = value;
  }

  @api
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = {
      ...DEFAULT_VALUE,
      ...(value || {})
    };
  }

  get accountName() {
    return this.value.accountName ?? "";
  }

  get phone() {
    return this.value.phone ?? "";
  }

  get industry() {
    return this.value.industry ?? "";
  }

  get contactName() {
    return this.value.contactName ?? "";
  }

  get contactEmail() {
    return this.value.contactEmail ?? "";
  }

  get industryOptions() {
    return INDUSTRY_OPTIONS;
  }

  handleInputChange(event) {
    event.stopPropagation();
    const fieldName = event.target.dataset.field;
    const rawValue = event.detail?.value ?? event.target.value;

    this._value = {
      ...this._value,
      [fieldName]: normalizeValue(rawValue)
    };

    this.dispatchEvent(
      new CustomEvent("valuechange", {
        detail: {
          value: this._value
        },
        bubbles: true,
        composed: true
      })
    );
  }
}
