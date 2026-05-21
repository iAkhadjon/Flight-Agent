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

  it("uses account.json as the default object path", () => {
    const element = createComponent();
    const pathInput = element.shadowRoot.querySelector(
      '[data-field="s3ObjectPath"]'
    );

    expect(pathInput.value).toBe("/account.json");
  });

  it("dispatches normalized S3 object path changes", () => {
    const element = createComponent();
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const pathInput = element.shadowRoot.querySelector(
      '[data-field="s3ObjectPath"]'
    );
    pathInput.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: "folder/account data.json"
        }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value.s3ObjectPath).toBe(
      "/folder/account data.json"
    );
  });

  it("dispatches bucket override and mock mode changes", () => {
    const element = createComponent();
    const handler = jest.fn();
    element.addEventListener("valuechange", handler);

    const bucketInput = element.shadowRoot.querySelector(
      '[data-field="bucketOverride"]'
    );
    bucketInput.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: "demo-bucket"
        }
      })
    );

    const mockToggle = element.shadowRoot.querySelector(
      '[data-field="mockMode"]'
    );
    mockToggle.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          checked: true
        }
      })
    );

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[0][0].detail.value.bucketOverride).toBe(
      "demo-bucket"
    );
    expect(handler.mock.calls[1][0].detail.value.mockMode).toBe(true);
  });
});
