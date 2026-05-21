import { createElement } from "lwc";
import S3AccountEditor from "c/s3AccountEditor";

const createComponent = (value) => {
  const element = createElement("c-s3-account-editor", {
    is: S3AccountEditor
  });

  if (value !== undefined) {
    element.value = value;
  }

  document.body.appendChild(element);
  return element;
};

describe("c-s3-account-editor", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders only the Account Name input", () => {
    const element = createComponent();
    const accountNameInput = element.shadowRoot.querySelector(
      '[data-field="accountName"]'
    );

    expect(accountNameInput).not.toBeNull();
    expect(accountNameInput.required).toBe(true);
    expect(
      element.shadowRoot.querySelector('[data-field="s3ObjectPath"]')
    ).toBeNull();
    expect(
      element.shadowRoot.querySelector('[data-field="bucketOverride"]')
    ).toBeNull();
    expect(
      element.shadowRoot.querySelector('[data-field="mockMode"]')
    ).toBeNull();
  });

  it("dispatches account lookup values with the default accounts.json path", () => {
    const element = createComponent();
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const accountNameInput = element.shadowRoot.querySelector(
      '[data-field="accountName"]'
    );
    accountNameInput.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: "  Acme Korea  "
        }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value.accountName).toBe(
      "Acme Korea"
    );
    expect(handler.mock.calls[0][0].detail.value.s3ObjectPath).toBe(
      "/accounts.json"
    );
  });

  it("preserves existing hidden config values while changing account name", () => {
    const element = createComponent({
      accountName: "Old Name",
      s3ObjectPath: "/custom/accounts.json",
      bucketOverride: "demo-bucket",
      mockMode: true
    });
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const accountNameInput = element.shadowRoot.querySelector(
      '[data-field="accountName"]'
    );
    accountNameInput.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: "Acme Japan"
        }
      })
    );

    expect(handler.mock.calls[0][0].detail.value).toEqual({
      accountName: "Acme Japan",
      s3ObjectPath: "/custom/accounts.json",
      bucketOverride: "demo-bucket",
      mockMode: true
    });
  });
});
