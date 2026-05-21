Create a complete Salesforce Agentforce integration that retrieves JSON data from AWS S3 and renders the result inside Agentforce using Lightning Types, an Invocable Apex Action, and a custom LWC renderer.

Architecture Requirements

- AWS S3 bucket already exists.
- Salesforce Named Credential already exists:
  - Name: AWS_S3_Demo

- S3 file path:
  - /account.json

- Apex must call:
  - callout:AWS_S3_Demo/account.json

Goal

- Agentforce agent invokes an Apex action.
- Apex retrieves account.json from AWS S3.
- Apex parses JSON into typed wrapper classes.
- Apex returns structured output using Agentforce-compatible response DTOs.
- Agentforce renders the response using a custom Lightning Type renderer LWC.
- Include full metadata and deployment structure.

==================================================
PART 1 — APEX INVOCABLE ACTION
==============================

Create Apex class:

- S3AccountAgentAction.cls

Requirements:

- Use @InvocableMethod
- Method name:
  - getAccountData

- Method label:
  - Get Account Data From S3

- Method description:
  - Retrieves account and contact data from AWS S3 bucket.

The invocable method must:

- Perform HTTP GET callout to:
  - callout:AWS_S3_Demo/account.json

- Parse JSON response.
- Return strongly typed DTO objects.
- Support Agentforce action invocation.

Create:

- Request DTO class
- Response DTO class
- Account DTO
- Contact DTO

Response structure should include:

- success
- message
- account
- contacts

Include:

- error handling
- HTTP status handling
- malformed JSON handling
- null checks

==================================================
PART 2 — AGENTFORCE LIGHTNING TYPE
==================================

Create custom Lightning Type metadata implementation for Agentforce.

Requirements:

- Lightning Type Name:
  - s3AccountViewer

- Create:
  - renderer component
  - editor component
  - lightning type registration metadata

The Lightning Type should:

- Render account details
- Render contacts in a table
- Display error state
- Display loading state
- Be fully compatible with Agentforce response rendering

Use Salesforce Agentforce Lightning Type architecture pattern.

==================================================
PART 3 — LWC RENDERER COMPONENT
===============================

Create LWC:

- s3AccountRenderer

Requirements:

- Accept Agentforce action payload
- Render:
  - Account Name
  - Industry
  - Phone
  - Website

- Render contacts datatable:
  - First Name
  - Last Name
  - Email
  - Title

UI Requirements:

- Use lightning-card
- Use lightning-datatable
- Use SLDS styling
- Responsive layout
- Proper empty states
- Proper error states

==================================================
PART 4 — LWC EDITOR COMPONENT
=============================

Create editor component:

- s3AccountEditor

Purpose:

- Configure the action inside Agentforce Builder.

Editor should support:

- configurable S3 object path
- optional bucket override
- mock mode toggle

Use proper Agentforce editor APIs.

==================================================
PART 5 — LIGHTNING TYPE REGISTRATION
====================================

Create metadata configuration required to register the Lightning Type with Agentforce.

Include:

- lightning type definition
- renderer registration
- editor registration
- schema definition

Ensure compatibility with:

- Agentforce custom renderer architecture
- Agent action response rendering

==================================================
PART 6 — AGENT ACTION CONFIGURATION
===================================

Provide setup instructions for:

- registering invocable Apex method as Agent Action
- connecting Lightning Type to the action
- enabling renderer inside Agentforce
- testing in Agent Builder

==================================================
PART 7 — TEST CLASSES
=====================

Create:

- Apex test class
- HTTPCalloutMock implementation

Tests must cover:

- successful S3 response
- failed response
- malformed JSON
- empty response
- 403/404 handling

Minimum:

- 90% coverage

==================================================
PART 8 — SAMPLE JSON
====================

Assume account.json structure:

{
"account": {
"id": "001DEMO000001",
"name": "Acme Korea",
"industry": "Technology",
"phone": "+82-2-1234-5678",
"website": "https://www.acme.example"
},
"contacts": [
{
"id": "003DEMO000001",
"firstName": "Jin",
"lastName": "Kim",
"email": "[jin.kim@acme.example](mailto:jin.kim@acme.example)",
"title": "VP Sales"
},
{
"id": "003DEMO000002",
"firstName": "Mina",
"lastName": "Park",
"email": "[mina.park@acme.example](mailto:mina.park@acme.example)",
"title": "Solution Architect"
}
]
}

==================================================
PART 9 — FILE STRUCTURE
=======================

Generate complete Salesforce DX project structure including:

- classes
- lwc
- metadata
- js-meta.xml
- lightning type configs
- test classes

==================================================
PART 10 — IMPORTANT IMPLEMENTATION RULES
========================================

Rules:

- Do NOT hardcode AWS credentials.
- Use only Named Credential.
- Use typed Apex classes.
- Use Invocable Apex for Agentforce.
- Use Lightning Type renderer architecture.
- Follow Salesforce best practices.
- Use cacheable methods where appropriate.
- Include comments throughout code.
- Ensure deployment-ready metadata.

Output:

- Full Apex code
- Full LWC code
- Metadata XML
- Lightning Type configuration
- Deployment steps
- Agentforce setup steps
- Testing instructions
- Example Agentforce prompt usage
