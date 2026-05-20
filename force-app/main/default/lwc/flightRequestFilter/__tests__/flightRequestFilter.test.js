import { createElement } from "lwc";
import FlightRequestFilter from "c/flightRequestFilter";

const createComponent = (value) => {
  const element = createElement("c-flight-request-filter", {
    is: FlightRequestFilter
  });

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-flight-request-filter", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the expected input fields and labels", () => {
    const element = createComponent();
    const inputs = [...element.shadowRoot.querySelectorAll("lightning-input")];

    expect(inputs).toHaveLength(5);
    expect(inputs.map((input) => input.label)).toEqual([
      "Origin City",
      "Destination City",
      "Date of Travel",
      "Max Price (1,000 - 20,000)",
      "Min Discount Percentage (0 - 100)"
    ]);
    expect(inputs.map((input) => input.dataset.field)).toEqual([
      "originCity",
      "destinationCity",
      "dateOfTravel",
      "price",
      "discountPercentage"
    ]);
  });

  it("accepts an initial value object", () => {
    const element = createComponent({
      originCity: "San Francisco",
      destinationCity: "New York",
      dateOfTravel: "2026-05-29",
      price: 1000,
      discountPercentage: 10
    });

    expect(
      element.shadowRoot.querySelector('[data-field="originCity"]').value
    ).toBe("San Francisco");
    expect(
      element.shadowRoot.querySelector('[data-field="destinationCity"]').value
    ).toBe("New York");
    expect(
      element.shadowRoot.querySelector('[data-field="dateOfTravel"]').value
    ).toBe("2026-05-29");
    expect(element.shadowRoot.querySelector('[data-field="price"]').value).toBe(
      1000
    );
    expect(
      element.shadowRoot.querySelector('[data-field="discountPercentage"]')
        .value
    ).toBe(10);
  });

  it("dispatches valuechange with the complete updated value", () => {
    const element = createComponent({
      originCity: "San Francisco",
      destinationCity: "New York",
      dateOfTravel: "2026-05-29",
      price: 1000,
      discountPercentage: 10
    });
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const priceInput = element.shadowRoot.querySelector('[data-field="price"]');
    priceInput.value = "750";
    priceInput.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "750" }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    const valueChangeEvent = handler.mock.calls[0][0];
    expect(valueChangeEvent.detail.value).toEqual({
      originCity: "San Francisco",
      destinationCity: "New York",
      dateOfTravel: "2026-05-29",
      price: 750,
      discountPercentage: 10
    });
    expect(valueChangeEvent.bubbles).toBe(true);
    expect(valueChangeEvent.composed).toBe(true);
  });

  it("normalizes empty numeric values to null", () => {
    const element = createComponent({
      originCity: "San Francisco",
      destinationCity: "New York",
      dateOfTravel: "2026-05-29",
      price: 750,
      discountPercentage: 10
    });
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const discountInput = element.shadowRoot.querySelector(
      '[data-field="discountPercentage"]'
    );
    discountInput.value = "";
    discountInput.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "" }
      })
    );

    expect(handler.mock.calls[0][0].detail.value).toEqual({
      originCity: "San Francisco",
      destinationCity: "New York",
      dateOfTravel: "2026-05-29",
      price: 750,
      discountPercentage: null
    });
  });
});
