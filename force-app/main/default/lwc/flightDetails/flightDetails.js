import { LightningElement, api } from "lwc";

export default class FlightDetails extends LightningElement {
  @api value;

  get flights() {
    if (Array.isArray(this.value)) {
      return this.value;
    }

    if (Array.isArray(this.value?.flights)) {
      return this.value.flights;
    }

    if (Array.isArray(this.value?.aFlight?.flights)) {
      return this.value.aFlight.flights;
    }

    if (Array.isArray(this.value?.availableFlights)) {
      return this.value.availableFlights;
    }

    if (this.value) {
      return [this.value];
    }

    return [];
  }

  get flightData() {
    return this.flights.map((flight) => ({
      ...flight,
      key: flight.flightId || `${flight.price}-${flight.durationInMin}`,
      formattedPrice: this.formatCurrency(flight.price),
      formattedDiscount: this.formatDiscount(flight.discountPercentage),
      petAllowedStatus: flight.isPetAllowed ? "Yes" : "No",
      durationInHr: this.formattedDuration(flight.durationInMin),
      departureTime: "07:00",
      arrivalInHr: this.arrivalTime(flight.durationInMin)
    }));
  }

  get hasFlights() {
    return this.flightData.length > 0;
  }

  formatCurrency(price) {
    if (price === null || price === undefined || price === "") {
      return "Not provided";
    }

    return `$${Number(price).toLocaleString("en-US")}`;
  }

  formatDiscount(discountPercentage) {
    if (
      discountPercentage === null ||
      discountPercentage === undefined ||
      discountPercentage === ""
    ) {
      return "No discount";
    }

    return `${discountPercentage}% Off`;
  }

  formattedDuration(durationInMin) {
    if (
      durationInMin === null ||
      durationInMin === undefined ||
      durationInMin === ""
    ) {
      return "Not provided";
    }

    const hours = Math.floor(durationInMin / 60);
    const minutes = durationInMin % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  }

  arrivalTime(durationInMin) {
    if (
      durationInMin === null ||
      durationInMin === undefined ||
      durationInMin === ""
    ) {
      return "Not provided";
    }

    const departureDate = new Date(2025, 0, 1, 7, 0);
    const arrivalDate = new Date(
      departureDate.getTime() + durationInMin * 60000
    );
    const arrivalHours = String(arrivalDate.getHours()).padStart(2, "0");
    const arrivalMinutes = String(arrivalDate.getMinutes()).padStart(2, "0");

    return `${arrivalHours}:${arrivalMinutes}`;
  }
}
