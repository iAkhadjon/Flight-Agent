import { LightningElement, api } from "lwc";

const DEFAULT_VALUE = {
  s3ObjectPath: "/account.json",
  bucketOverride: null,
  mockMode: false
};

const normalizeText = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return value.trim();
};

export default class S3AccountEditor extends LightningElement {
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

  get s3ObjectPath() {
    return this.value.s3ObjectPath || DEFAULT_VALUE.s3ObjectPath;
  }

  get bucketOverride() {
    return this.value.bucketOverride || "";
  }

  get mockMode() {
    return this.value.mockMode === true;
  }

  handleInputChange(event) {
    event.stopPropagation();
    const fieldName = event.target.dataset.field;
    const value =
      fieldName === "mockMode"
        ? (event.detail?.checked ?? event.target.checked)
        : this.normalizeFieldValue(fieldName, event.detail?.value);

    this._value = {
      ...this._value,
      [fieldName]: value
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

  normalizeFieldValue(fieldName, rawValue) {
    const normalizedValue = normalizeText(rawValue);

    if (fieldName === "s3ObjectPath") {
      if (!normalizedValue) {
        return DEFAULT_VALUE.s3ObjectPath;
      }

      return normalizedValue.startsWith("/")
        ? normalizedValue
        : `/${normalizedValue}`;
    }

    return normalizedValue;
  }
}
