import { LightningElement, api } from "lwc";

const CONTACT_COLUMNS = [
  { label: "First Name", fieldName: "firstName" },
  { label: "Last Name", fieldName: "lastName" },
  { label: "Email", fieldName: "email", type: "email" },
  { label: "Title", fieldName: "title" }
];

const fallback = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return value;
};

export default class S3AccountRenderer extends LightningElement {
  @api value;

  columns = CONTACT_COLUMNS;

  get payload() {
    return this.unwrapPayload(this.value);
  }

  get isLoading() {
    return (
      this.value === undefined ||
      this.value?.loading === true ||
      this.value?.isLoading === true
    );
  }

  get hasError() {
    return !this.isLoading && this.payload?.success === false;
  }

  get errorMessage() {
    return this.payload?.message || "Unable to retrieve account data.";
  }

  get account() {
    return this.payload?.account || null;
  }

  get hasAccount() {
    return this.account !== null;
  }

  get accountName() {
    return fallback(this.account?.name);
  }

  get accountIndustry() {
    return fallback(this.account?.industry);
  }

  get accountPhone() {
    return fallback(this.account?.phone);
  }

  get websiteUrl() {
    return this.account?.website || "";
  }

  get accountWebsite() {
    return fallback(this.websiteUrl);
  }

  get hasWebsite() {
    return this.websiteUrl !== "";
  }

  get contactRows() {
    const contacts = Array.isArray(this.payload?.contacts)
      ? this.payload.contacts
      : [];

    return contacts.map((contact, index) => ({
      id: contact.id || `${contact.email || "contact"}-${index}`,
      firstName: fallback(contact.firstName),
      lastName: fallback(contact.lastName),
      email: fallback(contact.email),
      title: fallback(contact.title)
    }));
  }

  get hasContacts() {
    return this.contactRows.length > 0;
  }

  unwrapPayload(rawValue) {
    if (Array.isArray(rawValue)) {
      return rawValue.length > 0 ? this.unwrapPayload(rawValue[0]) : null;
    }

    if (!rawValue || typeof rawValue !== "object") {
      return null;
    }

    if (rawValue.accountData) {
      return rawValue.accountData;
    }

    if (rawValue.response?.accountData) {
      return rawValue.response.accountData;
    }

    if (
      "success" in rawValue ||
      "account" in rawValue ||
      "contacts" in rawValue ||
      "message" in rawValue
    ) {
      return rawValue;
    }

    return null;
  }
}
