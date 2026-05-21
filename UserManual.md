# User Manual: Deploy and Use `API_Call_Display_LWC`

This guide deploys the S3 Account Data Agentforce demo into another Salesforce org. The focused deployment manifest is `manifest/s3package.xml`.

## What This Package Includes

- Agentforce authoring bundle: `API_Call_Display_LWC`
- Bot and generated planner versions: `API_Call_Display_LWC` and `API_Call_Display_LWC_v1` through `API_Call_Display_LWC_v3`
- S3 Apex action and DTOs: `S3AccountAgentAction`, `S3AccountRequest`, `S3AccountResponse`, `S3AccountDTO`, `S3ContactDTO`
- Account Intake dependency metadata referenced by the agent: `AccountIntakeAgent`, `AccountIntakeRequest`, `accountIntakeForm`, `accountIntake`
- S3 custom UI: `s3AccountEditor`, `s3AccountRenderer`, `s3AccountRequest`, `s3AccountViewer`
- AWS callout metadata: `AWS_S3_Demo` Named Credential and External Credential
- Permission set: `S3_Account_Agent_Access`

## Prerequisites

1. Install Salesforce CLI.
2. Use an Agentforce-enabled org.
3. Confirm the org has access to the Agentforce metadata types used by this project.
4. Prepare an AWS S3 bucket and an IAM access key for Salesforce.

## Authorize the Target Org

Replace `targetOrgAlias` with the alias you want to use:

```bash
sf org login web --alias targetOrgAlias --set-default
```

## Create the AWS S3 Bucket

Create an S3 bucket in AWS.

Example values:

```text
Bucket name: salesforce-agentforce-s3-demo
Region: ap-northeast-2
```

Upload these sample data files to the bucket root:

```text
account.json
accounts.json
```

The Apex action reads `/accounts.json` first and falls back to `/account.json`.

For a temporary public dev bucket only, you can turn off Block Public Access at the bucket level and use this bucket policy. Public buckets are accessible by anyone on the internet, so delete the bucket policy or lock the bucket down after testing.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadWriteForTemporaryDevOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::salesforce-agentforce-s3-demo/*"
    }
  ]
}
```

## Create the AWS IAM Access Key

1. Open the AWS Console: `https://console.aws.amazon.com/`
2. Go to IAM.
3. Open Users, then create a user.
4. Use a name such as `salesforce-s3-user`.
5. Leave AWS Management Console access unchecked. Salesforce only needs programmatic API access.
6. Attach permissions.

For a quick demo, `AmazonS3FullAccess` works, but a bucket-scoped custom policy is safer:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::salesforce-agentforce-s3-demo",
        "arn:aws:s3:::salesforce-agentforce-s3-demo/*"
      ]
    }
  ]
}
```

After the user is created:

1. Open the IAM user.
2. Go to Security credentials.
3. Under Access keys, click Create access key.
4. Choose Third-party service or Application running outside AWS.
5. Use a description such as `Salesforce Agentforce S3 Integration`.
6. Copy the Access Key ID and Secret Access Key immediately. AWS shows the secret only once.

## Prepare Salesforce Credential Metadata

Before deployment, replace the placeholder AWS account ID in `force-app/main/default/externalCredentials/AWS_S3_Demo.externalCredential-meta.xml`:

```xml
<parameterName>AwsAccountId</parameterName>
<parameterValue>000000000000</parameterValue>
```

Use your own 12-digit AWS account ID. Do not deploy another person's AWS account ID.

If your bucket name or region differs from the example, update the URL in `force-app/main/default/namedCredentials/AWS_S3_Demo.namedCredential-meta.xml`.

If you move this project through Git, confirm that `force-app/main/default/externalCredentials/AWS_S3_Demo.externalCredential-meta.xml` is present before deploying. `manifest/s3package.xml` references that metadata.

## Deploy the Metadata

Run this command from the project root:

```bash
sf project deploy start \
  --manifest manifest/s3package.xml \
  --target-org targetOrgAlias \
  --test-level RunSpecifiedTests \
  --tests S3AccountAgentActionTest \
  --tests AccountIntakeAgentTest \
  --wait 10
```

For a validation-only run, add `--dry-run`.

## Configure the S3 Credential

Salesforce supports AWS Signature Version 4 for AWS callouts. The deployment creates metadata for `AWS_S3_Demo`, but secrets are not stored in source.

In the target org, create or update the External Credential:

```text
Setup -> Named Credentials -> External Credentials -> New
Label: AWS S3 Demo External Credential
Name: AWS_S3_Demo
Authentication Protocol: AWS Signature Version 4
Service: s3
Region: ap-northeast-2
AWS Account ID: your AWS account ID
```

Create a principal:

```text
Principal Type: Named Principal
Access Key: your AWS IAM access key
Access Secret: your AWS IAM secret
```

Then create or update the Named Credential:

```text
Setup -> Named Credentials -> Named Credentials -> New
Label: AWS S3 Demo
Name: AWS_S3_Demo
Type: Secured Endpoint
URL: https://salesforce-agentforce-s3-demo.s3.ap-northeast-2.amazonaws.com
External Credential: AWS_S3_Demo
```

Use your own bucket name and region in the URL when they differ from the example.

Assign access through a Permission Set for the Salesforce user or Agentforce user that runs the callout.

To verify the bucket object directly, open:

```text
https://salesforce-agentforce-s3-demo.s3.ap-northeast-2.amazonaws.com/account.json
```

If the bucket is public, the browser should show JSON. If the bucket requires signed AWS requests, the browser can show `AccessDenied`; Salesforce can still work through the Named Credential.

## Publish the Agent

Validate and publish the Agentforce authoring bundle:

```bash
sf agent validate authoring-bundle \
  --api-name API_Call_Display_LWC \
  --target-org targetOrgAlias

sf agent publish authoring-bundle \
  --api-name API_Call_Display_LWC \
  --target-org targetOrgAlias
```

## Assign Permissions

Assign the permission set to the user who will use or test the agent:

```bash
sf org assign permset \
  --name S3_Account_Agent_Access \
  --target-org targetOrgAlias
```

If the agent runs under a dedicated Agentforce service user, assign the same permission set to that user:

```bash
sf org assign permset \
  --name S3_Account_Agent_Access \
  --on-behalf-of agent.user@example.com \
  --target-org targetOrgAlias
```

## Use the Agent

1. Open Agent Builder in the target org.
2. Open the `API Call Display LWC` agent.
3. Activate the published version if it is not already active.
4. Start a preview conversation.
5. Enter a prompt such as:

```text
Give me info for my accounts.
```

The agent should open the `S3 Account Data` form. Enter an account name such as `Acme`, then submit. The renderer calls `S3AccountAgentAction.lookupAccounts`, reads `callout:AWS_S3_Demo/accounts.json`, filters matching accounts, and displays account/contact details.

## Security Cleanup After Demo

After testing, remove temporary access:

1. Delete or deactivate the AWS access key.
2. Disable or delete the temporary IAM user if it is no longer needed.
3. Remove public bucket access.
4. Replace broad S3 permissions with a least-privilege bucket policy.

In AWS, go to IAM, open `salesforce-s3-user`, then use the Security credentials tab to deactivate or delete the access key.

## Troubleshooting

- `403` or credential errors: configure the External Credential principal and confirm the permission set grants principal access.
- `404`: confirm `accounts.json` exists in the S3 bucket path. The Apex action retries `account.json`.
- `No accounts matched`: the callout succeeded, but no returned account name contained the submitted search text.
- Agent does not appear or publish: confirm the target org has Agentforce enabled and run `sf agent validate authoring-bundle`.
- Account Intake action permission errors: the package includes Account Intake metadata because the agent references it, but `S3_Account_Agent_Access` is focused on the S3 action. Grant Apex access to `AccountIntakeAgent` and `AccountIntakeRequest` if you plan to use that route.
