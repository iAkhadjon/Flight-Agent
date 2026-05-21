import { createElement } from "lwc";
import S3AccountRenderer from "c/s3AccountRenderer";
import lookupAccounts from "@salesforce/apex/S3AccountAgentAction.lookupAccounts";

jest.mock(
  "@salesforce/apex/S3AccountAgentAction.lookupAccounts",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

const MULTI_ACCOUNT_RESPONSE = {
  accountData: {
    success: true,
    message: 'Found 2 accounts matching "Acme".',
    accounts: [
      {
        id: "001DEMO000001",
        name: "Acme Korea",
        industry: "Technology",
        phone: "+82-2-1234-5678",
        website: "https://www.acme.example",
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
      },
      {
        id: "001DEMO000002",
        name: "Acme Japan",
        industry: "Manufacturing",
        phone: "+81-3-1234-5678",
        website: "https://www.acme-japan.example",
        contacts: [
          {
            id: "003DEMO000003",
            firstName: "Hana",
            lastName: "Sato",
            email: "hana.sato@acme-japan.example",
            title: "Account Director"
          }
        ]
      }
    ]
  }
};

const JAPAN_ACCOUNT_RESPONSE = {
  success: true,
  message: 'Found 1 account matching "Acme Japan".',
  accounts: [
    {
      id: "001DEMO000002",
      name: "Acme Japan",
      industry: "Manufacturing",
      phone: "+81-3-1234-5678",
      website: "https://www.acme-japan.example",
      contacts: [
        {
          id: "003DEMO000003",
          firstName: "Hana",
          lastName: "Sato",
          email: "hana.sato@acme-japan.example",
          title: "Account Director"
        }
      ]
    }
  ]
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const createComponent = ({ value, minimumLoadingMs = 0 } = {}) => {
  const element = createElement("c-s3-account-renderer", {
    is: S3AccountRenderer
  });

  element.minimumLoadingMs = minimumLoadingMs;

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-s3-account-renderer", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();

    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a loading state before a value is provided", () => {
    const element = createComponent();

    expect(
      element.shadowRoot.querySelector('[data-id="loading-state"]')
    ).not.toBeNull();
    expect(
      element.shadowRoot.querySelector('[data-id="account-name-input"]')
    ).not.toBeNull();
  });

  it("renders multiple account results with related contact tables", async () => {
    const element = createComponent({
      value: MULTI_ACCOUNT_RESPONSE
    });
    await flushPromises();

    expect(element.shadowRoot.textContent).toContain("Found 2 accounts");
    expect(element.shadowRoot.textContent).toContain("Acme Korea");
    expect(element.shadowRoot.textContent).toContain("Acme Japan");
    expect(element.shadowRoot.textContent).toContain("Manufacturing");

    const accountCards = element.shadowRoot.querySelectorAll(
      '[data-id="account-card"]'
    );
    const contactTables = element.shadowRoot.querySelectorAll(
      '[data-id="contacts-table"]'
    );

    expect(accountCards).toHaveLength(2);
    expect(contactTables).toHaveLength(2);
    expect(contactTables[0].data).toHaveLength(2);
    expect(contactTables[1].data[0].firstName).toBe("Hana");
  });

  it("keeps backward compatibility with a single account payload", async () => {
    const element = createComponent({
      value: {
        success: true,
        message: 'Found 1 account matching "Acme Korea".',
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
          }
        ]
      }
    });
    await flushPromises();

    expect(
      element.shadowRoot.querySelectorAll('[data-id="account-card"]')
    ).toHaveLength(1);
    expect(
      element.shadowRoot.querySelector('[data-id="contacts-table"]').data
    ).toHaveLength(1);
    expect(element.shadowRoot.textContent).toContain("Acme Korea");
  });

  it("renders an error state when the action reports failure", async () => {
    const element = createComponent({
      value: {
        success: false,
        message: "AWS S3 returned HTTP 403 (Forbidden).",
        accounts: []
      }
    });
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-id="error-state"]')
    ).not.toBeNull();
    expect(element.shadowRoot.textContent).toContain("HTTP 403");
    expect(
      element.shadowRoot.querySelector('[data-id="contacts-table"]')
    ).toBeNull();
  });

  it("renders an account empty state when no matches are returned", async () => {
    const element = createComponent({
      value: {
        success: true,
        message: 'No accounts matched "Globex".',
        accounts: []
      }
    });
    await flushPromises();

    expect(element.shadowRoot.textContent).toContain("No accounts matched");
    expect(element.shadowRoot.textContent).toContain(
      "No matching accounts were returned."
    );
  });

  it("lets a user reenter an account name and submit another S3 lookup", async () => {
    lookupAccounts.mockResolvedValue(JAPAN_ACCOUNT_RESPONSE);
    const element = createComponent({
      value: MULTI_ACCOUNT_RESPONSE
    });
    await flushPromises();

    const accountInput = element.shadowRoot.querySelector(
      '[data-id="account-name-input"]'
    );
    accountInput.value = "Acme Japan";
    accountInput.dispatchEvent(
      new CustomEvent("change", { detail: { value: "Acme Japan" } })
    );

    element.shadowRoot
      .querySelector("form")
      .dispatchEvent(new Event("submit", { cancelable: true }));
    await flushPromises();

    expect(lookupAccounts).toHaveBeenCalledWith({
      accountName: "Acme Japan"
    });
    expect(element.shadowRoot.textContent).toContain("Acme Japan");
    expect(
      element.shadowRoot.querySelectorAll('[data-id="account-card"]')
    ).toHaveLength(1);
  });

  it("caps the loading time input at 10 minutes", () => {
    const element = createComponent();
    const loadingTimeInput = element.shadowRoot.querySelector(
      '[data-id="loading-time-input"]'
    );

    loadingTimeInput.value = "900";
    loadingTimeInput.dispatchEvent(
      new CustomEvent("change", { detail: { value: "900" } })
    );

    expect(element.minimumLoadingMs).toBe(600000);
  });

  it("keeps the result hidden until the selected loading time ends", async () => {
    jest.useFakeTimers();
    lookupAccounts.mockResolvedValue(JAPAN_ACCOUNT_RESPONSE);
    const element = createComponent({ minimumLoadingMs: 1000 });

    const accountInput = element.shadowRoot.querySelector(
      '[data-id="account-name-input"]'
    );
    accountInput.value = "Acme Japan";
    accountInput.dispatchEvent(
      new CustomEvent("change", { detail: { value: "Acme Japan" } })
    );

    element.shadowRoot
      .querySelector("form")
      .dispatchEvent(new Event("submit", { cancelable: true }));
    await Promise.resolve();

    expect(
      element.shadowRoot.querySelector('[data-id="account-card"]')
    ).toBeNull();
    expect(
      element.shadowRoot.querySelector('[data-id="loading-state"]')
    ).not.toBeNull();

    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(
      element.shadowRoot.querySelector('[data-id="account-card"]')
    ).toBeNull();

    jest.advanceTimersByTime(1);
    await flushPromises();
    expect(element.shadowRoot.textContent).toContain("Acme Japan");
  });
});
