import { createElement } from "lwc";
import S3AccountRenderer from "c/s3AccountRenderer";

const createComponent = (value) => {
  const element = createElement("c-s3-account-renderer", {
    is: S3AccountRenderer
  });

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-s3-account-renderer", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a loading state before a value is provided", () => {
    const element = createComponent();

    expect(
      element.shadowRoot.querySelector('[data-id="loading-state"]')
    ).not.toBeNull();
  });

  it("renders account details and contact rows from an action wrapper", () => {
    const element = createComponent({
      accountData: {
        success: true,
        message: "Account data retrieved from AWS S3.",
        account: {
          name: "Acme Korea",
          industry: "Technology",
          phone: "+82-2-1234-5678",
          website: "https://www.acme.example"
        },
        contacts: [
          {
            id: "003DEMO000001",
            firstName: "Jin",
            lastName: "Kim",
            email: "jin.kim@acme.example",
            title: "VP Sales"
          },
          {
            id: "003DEMO000002",
            firstName: "Mina",
            lastName: "Park",
            email: "mina.park@acme.example",
            title: "Solution Architect"
          }
        ]
      }
    });

    expect(element.shadowRoot.textContent).toContain("Acme Korea");
    expect(element.shadowRoot.textContent).toContain("Technology");
    expect(element.shadowRoot.textContent).toContain("+82-2-1234-5678");
    expect(element.shadowRoot.textContent).toContain(
      "https://www.acme.example"
    );

    const table = element.shadowRoot.querySelector(
      '[data-id="contacts-table"]'
    );

    expect(table).not.toBeNull();
    expect(table.data).toHaveLength(2);
    expect(table.data[0].firstName).toBe("Jin");
    expect(table.data[1].title).toBe("Solution Architect");
    expect(table.columns).toHaveLength(4);
  });

  it("renders an error state when the action reports failure", () => {
    const element = createComponent({
      success: false,
      message: "AWS S3 returned HTTP 403 (Forbidden).",
      contacts: []
    });

    expect(
      element.shadowRoot.querySelector('[data-id="error-state"]')
    ).not.toBeNull();
    expect(element.shadowRoot.textContent).toContain("HTTP 403");
    expect(
      element.shadowRoot.querySelector('[data-id="contacts-table"]')
    ).toBeNull();
  });

  it("renders account and contacts empty states", () => {
    const element = createComponent({
      success: true,
      message: "Account data retrieved from AWS S3.",
      contacts: []
    });

    expect(element.shadowRoot.textContent).toContain(
      "No account data was returned."
    );
    expect(element.shadowRoot.textContent).toContain(
      "No contacts were returned."
    );
  });
});
