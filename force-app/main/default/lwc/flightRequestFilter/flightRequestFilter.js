import { LightningElement, api } from "lwc";

const DEFAULT_VALUE = {
  originCity: null,
  destinationCity: null,
  dateOfTravel: null,
  price: null,
  discountPercentage: null
};

const NUMERIC_FIELDS = new Set(["price", "discountPercentage"]);

const normalizeValue = (fieldName, rawValue) => {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return null;
  }

  if (NUMERIC_FIELDS.has(fieldName)) {
    return Number(rawValue);
  }

  return rawValue;
};

export default class FlightRequestFilter extends LightningElement {
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

  get originCity() {
    return this.value.originCity ?? "";
  }

  get destinationCity() {
    return this.value.destinationCity ?? "";
  }

  get dateOfTravel() {
    return this.value.dateOfTravel ?? "";
  }

  get price() {
    return this.value.price ?? "";
  }

  get discountPercentage() {
    return this.value.discountPercentage ?? "";
  }

  handleInputChange(event) {
    event.stopPropagation();
    const fieldName = event.target.dataset.field;
    const rawValue = event.detail?.value ?? event.target.value;

    this._value = {
      ...this._value,
      [fieldName]: normalizeValue(fieldName, rawValue)
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
