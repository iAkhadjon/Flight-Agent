import { createElement } from "lwc";
import AccountIntakeForm from "c/accountIntakeForm";

const createComponent = (value) => {
  const element = createElement("c-account-intake-form", {
    is: AccountIntakeForm
  });

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-account-intake-form", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the expected fields and labels", () => {
    const element = createComponent();
    const inputs = [...element.shadowRoot.querySelectorAll("lightning-input")];
    const industry = element.shadowRoot.querySelector("lightning-combobox");

    expect(inputs).toHaveLength(4);
    expect(inputs.map((input) => input.label)).toEqual([
      "Account Name",
      "Phone",
      "Contact Name",
      "Contact Email"
    ]);
    expect(inputs.map((input) => input.dataset.field)).toEqual([
      "accountName",
      "phone",
      "contactName",
      "contactEmail"
    ]);
    expect(industry.label).toBe("Industry");
    expect(industry.dataset.field).toBe("industry");
  });

  it("accepts an initial value object", () => {
    const element = createComponent({
      accountName: "Acme Manufacturing",
      phone: "415-555-0100",
      industry: "Manufacturing",
      contactName: "Ari Singh",
      contactEmail: "ari@example.com"
    });

    expect(
      element.shadowRoot.querySelector('[data-field="accountName"]').value
    ).toBe("Acme Manufacturing");
    expect(element.shadowRoot.querySelector('[data-field="phone"]').value).toBe(
      "415-555-0100"
    );
    expect(
      element.shadowRoot.querySelector('[data-field="industry"]').value
    ).toBe("Manufacturing");
    expect(
      element.shadowRoot.querySelector('[data-field="contactName"]').value
    ).toBe("Ari Singh");
    expect(
      element.shadowRoot.querySelector('[data-field="contactEmail"]').value
    ).toBe("ari@example.com");
  });

  it("dispatches valuechange with the complete updated value", () => {
    const element = createComponent({
      accountName: "Acme Manufacturing",
      phone: "415-555-0100",
      industry: "Manufacturing",
      contactName: "Ari Singh",
      contactEmail: "ari@example.com"
    });
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const emailInput = element.shadowRoot.querySelector(
      '[data-field="contactEmail"]'
    );
    emailInput.value = "sales@example.com";
    emailInput.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "sales@example.com" }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    const valueChangeEvent = handler.mock.calls[0][0];
    expect(valueChangeEvent.detail.value).toEqual({
      accountName: "Acme Manufacturing",
      phone: "415-555-0100",
      industry: "Manufacturing",
      contactName: "Ari Singh",
      contactEmail: "sales@example.com"
    });
    expect(valueChangeEvent.bubbles).toBe(true);
    expect(valueChangeEvent.composed).toBe(true);
  });

  it("normalizes empty values to null", () => {
    const element = createComponent({
      accountName: "Acme Manufacturing",
      phone: "415-555-0100",
      industry: "Manufacturing",
      contactName: "Ari Singh",
      contactEmail: "ari@example.com"
    });
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const phoneInput = element.shadowRoot.querySelector('[data-field="phone"]');
    phoneInput.value = "";
    phoneInput.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "" }
      })
    );

    expect(handler.mock.calls[0][0].detail.value).toEqual({
      accountName: "Acme Manufacturing",
      phone: null,
      industry: "Manufacturing",
      contactName: "Ari Singh",
      contactEmail: "ari@example.com"
    });
  });
});
