import { api, LightningElement } from "lwc";

export default class FlightRequestFilter extends LightningElement {
    @api
    get readOnly() {
        return this._readOnly;
    }
    set readOnly(value) {
        this._readOnly = value;
    }
    _readOnly = false;

    _value;
    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }

    price;
    discountPercentage;

    connectedCallback() {
        if (this.value) {
            this.price = this.value?.price || "";
            this.discountPercentage = this.value?.discountPercentage || "";
        }
    }

    handleInputChange(event) {
        event.stopPropagation();
        const { name, value } = event.target;
        this[name] = value;
        this.dispatchEvent(
            new CustomEvent("valuechange", {
                detail: {
                    value: {
                        price: this.price,
                        discountPercentage: this.discountPercentage
                    }
                }
            })
        );
    }
}
