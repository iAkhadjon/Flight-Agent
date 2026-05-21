# S3 Account Agentforce Setup

This project adds an Agentforce action that asks for an Account Name, retrieves account data from AWS S3 through the existing `AWS_S3_Demo` Named Credential, filters matching accounts, and renders the structured result with a Custom Lightning Type. The action tries `/accounts.json` by default and falls back to `/account.json` when the default object is unavailable.

## Metadata Included

- Apex action: `S3AccountAgentAction.getAccountData`
- Apex request type: `S3AccountRequest`
- Apex response type: `S3AccountResponse`
- Apex DTOs: `S3AccountDTO`, `S3ContactDTO`
- Output Custom Lightning Type: `c__s3AccountViewer`
- Input/account lookup Custom Lightning Type: `c__s3AccountRequest`
- Output renderer LWC: `c/s3AccountRenderer`
- Input editor LWC: `c/s3AccountEditor`
- Permission set: `S3_Account_Agent_Access`

## Deploy

```bash
sf project deploy start --source-dir force-app
```

The S3 Named Credential must already exist with API name `AWS_S3_Demo`. The action does not store or reference AWS credentials directly.

## Run Tests

```bash
sf apex run test --class-names S3AccountAgentActionTest --result-format human --code-coverage --wait 10
npm run test:unit
```

## Register the Apex Method as an Agent Action

1. In Setup or Agent Builder, create a new Agent Action from Apex.
2. Select `S3AccountAgentAction`.
3. Select the invocable method `Get Account Data From S3`.
4. Configure the `request` input as user input:
   - `accountName`: required. Collected by the Account Lookup LWC form.
   - `s3ObjectPath`: hidden compatibility field that defaults to `/accounts.json`; `/account.json` is also supported.
   - `bucketOverride`: hidden optional compatibility field.
   - `mockMode`: hidden optional demo mode.
5. Expose the `accountData` output.

## Connect the Lightning Types

1. For the action input `request`, select `c__s3AccountRequest` to use the `c/s3AccountEditor` Account Lookup UI.
2. For the action output `accountData`, select `c__s3AccountViewer` to use the `c/s3AccountRenderer` output UI.
3. Enable the renderer for the Lightning Desktop Agentforce surface. Enhanced Web Chat metadata is also included.
4. Assign `S3_Account_Agent_Access` to the agent user or use the updated `AFDX_Agent_Perms` and `AFDX_User_Perms` permission set groups.

## Test in Agent Builder

Use a prompt such as:

```text
Retrieve the account data from S3 and show the account details and contacts.
```

Expected first agent response:

```text
Please fill the form and submit.
```

After the Account Name form is submitted, the action calls `callout:AWS_S3_Demo/accounts.json`. If that default object returns 403 or 404, it retries `callout:AWS_S3_Demo/account.json`. It then parses one or many account records into Apex DTOs, filters accounts by the submitted Account Name, and renders matching accounts plus related contacts.
