import { createElement } from "lwc";
import FlightDetails from "c/flightDetails";

const createComponent = (value) => {
  const element = createElement("c-flight-details", {
    is: FlightDetails
  });

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-flight-details", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders an empty state when no data is passed", () => {
    const element = createComponent();

    expect(element.shadowRoot.textContent).toContain(
      "No matching results were returned."
    );
    expect(
      element.shadowRoot.querySelectorAll('[data-id="flight-card"]')
    ).toHaveLength(0);
  });

  it("renders labels and values for a single AvailableFlight value", () => {
    const element = createComponent({
      flights: [
        {
          flightId: "IX 2814",
          price: 1000,
          discountPercentage: 20.2,
          numLayovers: 1,
          isPetAllowed: false,
          durationInMin: 70
        }
      ]
    });
    const text = element.shadowRoot.textContent;

    expect(text).toContain("Flight");
    expect(text).toContain("IX 2814");
    expect(text).toContain("Price");
    expect(text).toContain("$1,000");
    expect(text).toContain("Duration");
    expect(text).toContain("1 hr 10 min");
    expect(text).toContain("20.2% Off");
    expect(text).toContain("Layovers: 1");
    expect(text).toContain("Pets Allowed: No");
  });

  it("renders multiple result cards from a wrapper value", () => {
    const element = createComponent({
      aFlight: {
        flights: [
          {
            flightId: "IX 2814",
            price: 1000,
            discountPercentage: 20.2,
            numLayovers: 1,
            isPetAllowed: false,
            durationInMin: 70
          },
          {
            flightId: "6E 488",
            price: 2000,
            discountPercentage: 15.15,
            numLayovers: 2,
            isPetAllowed: true,
            durationInMin: 120
          }
        ]
      }
    });

    expect(
      element.shadowRoot.querySelectorAll('[data-id="flight-card"]')
    ).toHaveLength(2);
    expect(element.shadowRoot.textContent).toContain("6E 488");
    expect(element.shadowRoot.textContent).toContain("Pets Allowed: Yes");
  });

  it("does not render raw JSON as the primary UI", () => {
    const element = createComponent({
      flights: [
        {
          flightId: "IX 2814",
          price: 1000,
          discountPercentage: 20.2,
          numLayovers: 1,
          isPetAllowed: false,
          durationInMin: 70
        }
      ]
    });
    const text = element.shadowRoot.textContent;

    expect(text).not.toContain('"flightId"');
    expect(text).not.toContain("{");
  });
});
