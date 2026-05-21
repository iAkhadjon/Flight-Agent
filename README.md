# Agentforce Custom API Calls

This Salesforce DX project demonstrates Agentforce actions that call external APIs and render structured results with Custom Lightning Types. The primary implementation in this repo is an AWS S3 account lookup flow that retrieves account/contact JSON and displays it inside Agentforce.

The repo also still contains the original flight/resort sample metadata, but the active custom integration is the `API_Call_Display_LWC` agent with the S3 account action.

## S3 Account Flow

1. A user asks the agent for account information.
2. The agent displays the `S3 Account Data` renderer immediately, without the separate Account Lookup input form.
3. The user enters an Account Name directly in `c/s3AccountRenderer`.
4. `S3AccountAgentAction.lookupAccounts` calls AWS S3 through the `AWS_S3_Demo` Named Credential.
5. Apex parses one or many accounts, filters by the submitted company name, and returns typed DTOs.
6. `c/s3AccountRenderer` displays matching accounts and related contacts in the same component.

The renderer includes a configurable loading-time field from `0` to `600` seconds. Even if the S3/Apex response returns immediately, the component keeps showing the loading state until the configured time has elapsed.

## Key Metadata

| Metadata                                                         | Purpose                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `force-app/main/default/aiAuthoringBundles/API_Call_Display_LWC` | Agentforce authoring bundle for the custom API call demo agent.                |
| `S3AccountAgentAction`                                           | Invocable Apex action and direct LWC Apex lookup method.                       |
| `S3AccountRequest`                                               | Request DTO for Account Name, object path, bucket override, and mock mode.     |
| `S3AccountResponse`                                              | Response DTO with `success`, `message`, `account`, `accounts`, and `contacts`. |
| `S3AccountDTO`, `S3ContactDTO`                                   | Typed account/contact DTOs returned to Agentforce and LWC.                     |
| `c/s3AccountEditor`                                              | Legacy optional Agentforce input/editor LWC for collecting Account Name.       |
| `c/s3AccountRenderer`                                            | Agentforce output renderer LWC with loading, results, and re-submit support.   |
| `lightningTypes/s3AccountRequest`                                | Custom Lightning Type registration for input.                                  |
| `lightningTypes/s3AccountViewer`                                 | Custom Lightning Type registration for output.                                 |
| `AWS_S3_Demo` Named Credential / External Credential             | S3 callout configuration.                                                      |
| `S3_Account_Agent_Access`                                        | Permission set for Apex access.                                                |

## S3 Data Contract

The default object path is:

```text
/accounts.json
```

If `/accounts.json` returns `403` or `404`, Apex falls back to:

```text
/account.json
```

Preferred multi-account shape:

```json
{
  "accounts": [
    {
      "id": "001DEMO000001",
      "name": "Acme Korea",
      "industry": "Technology",
      "phone": "+82-2-1234-5678",
      "website": "https://www.acme.example"
    }
  ],
  "contacts": [
    {
      "id": "003DEMO000001",
      "accountId": "001DEMO000001",
      "firstName": "Jin",
      "lastName": "Kim",
      "email": "jin.kim@acme.example",
      "title": "VP Sales"
    }
  ]
}
```

The parser also supports the older single-account shape with top-level `account` and `contacts`, and array envelope shapes used during testing.

## Prerequisites

- Salesforce CLI (`sf`)
- Node.js and npm for LWC Jest tests
- Agentforce-enabled Salesforce org
- AWS S3 object containing account/contact JSON
- Salesforce Named Credential with API name `AWS_S3_Demo`
- External Credential principal and user permission assignment for the S3 credential

Authorize your target org:

```bash
sf org login web --alias webCrawling --set-default
```

Install local dependencies:

```bash
npm install
```

## Deploy

Deploy Salesforce metadata:

```bash
sf project deploy start \
  --source-dir force-app/main/default/classes \
  --source-dir force-app/main/default/lwc \
  --source-dir force-app/main/default/lightningTypes \
  --source-dir force-app/main/default/namedCredentials \
  --source-dir force-app/main/default/externalCredentials \
  --source-dir force-app/main/default/permissionsets \
  --source-dir force-app/main/default/permissionsetgroups \
  --test-level RunSpecifiedTests \
  --tests S3AccountAgentActionTest \
  --target-org webCrawling \
  --wait 10
```

Validate and publish the Agentforce authoring bundle:

```bash
sf agent validate authoring-bundle \
  --api-name API_Call_Display_LWC \
  --target-org webCrawling

sf agent publish authoring-bundle \
  --api-name API_Call_Display_LWC \
  --target-org webCrawling
```

Assign permissions to the user or agent user:

```bash
sf org assign permset \
  --name S3_Account_Agent_Access \
  --target-org webCrawling
```

## Test

Run Apex tests:

```bash
sf apex run test \
  --class-names S3AccountAgentActionTest \
  --result-format human \
  --code-coverage \
  --target-org webCrawling \
  --wait 10
```

Run LWC unit tests:

```bash
npm run test:unit
```

Run only the S3 renderer tests:

```bash
npm run test:unit -- -- --runTestsByPath force-app/main/default/lwc/s3AccountRenderer/__tests__/s3AccountRenderer.test.js
```

## Use in Agentforce

Try a prompt such as:

```text
Give me info for my accounts.
```

Expected interaction:

1. The agent opens the `S3 Account Data` form immediately.
2. The user enters an Account Name such as `Acme` in that form.
3. Apex calls `callout:AWS_S3_Demo/accounts.json`.
4. Matching accounts and related contacts render in `c/s3AccountRenderer`.
5. The user can enter a different company name in the same renderer and submit again.

## Troubleshooting

- `403` or missing credentials: check the External Credential principal, Named Credential setup, and permission assignment.
- `404`: confirm that `accounts.json` exists in the expected S3 path. The code will retry `account.json` for compatibility.
- `No accounts matched`: the S3 call succeeded, but no account name contained the submitted search text.
- `malformed JSON`: validate the S3 object body and remove invalid wrappers. Markdown fenced JSON is tolerated, but raw JSON is preferred.
- Results appear delayed: this is expected when the renderer loading-time option is greater than `0`; the maximum is `600` seconds.

More detailed setup notes are in [docs/s3-account-agent-setup.md](docs/s3-account-agent-setup.md).
