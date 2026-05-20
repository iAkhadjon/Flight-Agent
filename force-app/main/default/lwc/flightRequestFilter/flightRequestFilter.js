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
        this.originCity = value?.originCity || "";
        this.destinationCity = value?.destinationCity || "";
        this.dateOfTravel = value?.dateOfTravel || "";
        this.price = value?.price ?? "";
        this.discountPercentage = value?.discountPercentage ?? "";
    }

    originCity = "";
    destinationCity = "";
    dateOfTravel = "";
    price = "";
    discountPercentage = "";

    handleInputChange(event) {
        event.stopPropagation();
        const { name, value } = event.target;
        this[name] = value;
        this.dispatchEvent(
            new CustomEvent("valuechange", {
                detail: {
                    value: {
                        originCity: this.originCity,
                        destinationCity: this.destinationCity,
                        dateOfTravel: this.dateOfTravel,
                        price: this.price === "" ? null : Number(this.price),
                        discountPercentage:
                            this.discountPercentage === ""
                                ? null
                                : Number(this.discountPercentage)
                    }
                }
            })
        );
    }
}
