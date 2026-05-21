# S3 Account Agentforce Setup

This project adds an Agentforce action that retrieves `/account.json` from AWS S3 through the existing `AWS_S3_Demo` Named Credential and renders the structured result with a Custom Lightning Type.

## Metadata Included

- Apex action: `S3AccountAgentAction.getAccountData`
- Apex request type: `S3AccountRequest`
- Apex response type: `S3AccountResponse`
- Apex DTOs: `S3AccountDTO`, `S3ContactDTO`
- Output Custom Lightning Type: `c__s3AccountViewer`
- Input/config Custom Lightning Type: `c__s3AccountRequest`
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
4. Use the `request` input only when you want to override the defaults:
   - `s3ObjectPath`: defaults to `/account.json`.
   - `bucketOverride`: optional. Use only when `AWS_S3_Demo` points at an S3 service root instead of a bucket root.
   - `mockMode`: optional demo mode that returns sample account/contact data without a callout.
5. Expose the `accountData` output.

## Connect the Lightning Types

1. For the action input `request`, select `c__s3AccountRequest` to use the `c/s3AccountEditor` configuration UI.
2. For the action output `accountData`, select `c__s3AccountViewer` to use the `c/s3AccountRenderer` output UI.
3. Enable the renderer for the Lightning Desktop Agentforce surface. Enhanced Web Chat metadata is also included.
4. Assign `S3_Account_Agent_Access` to the agent user or use the updated `AFDX_Agent_Perms` and `AFDX_User_Perms` permission set groups.

## Test in Agent Builder

Use a prompt such as:

```text
Retrieve the account data from S3 and show the account details and contacts.
```

For a custom path:

```text
Retrieve account data from /account.json using the S3 account action.
```

Expected result: the action calls `callout:AWS_S3_Demo/account.json`, parses the JSON into Apex DTOs, and renders account fields plus a contacts table.
