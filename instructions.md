# Instructions for Codex: Build and Test Agentforce LWC Custom Lightning Types

## Goal

Create, deploy, and test Lightning Web Components (LWC) that override an Agentforce agent action's default input and output UI by using Custom Lightning Types (CLTs). Follow the Salesforce reference pattern for top-level editor and renderer overrides:

- Primary reference: https://developer.salesforce.com/docs/ai/agentforce/guide/lightning-types-example-full-editor-renderer.html
- Agentforce input target reference: https://developer.salesforce.com/docs/platform/lwc/guide/targets-lightning-agentforce-input.html
- Agentforce output target reference: https://developer.salesforce.com/docs/platform/lwc/guide/targets-lightning-agentforce-output.html
- LightningTypeBundle metadata reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_lightningtypebundle.htm
- LWC Jest testing reference: https://developer.salesforce.com/docs/platform/lwc/guide/unit-testing-using-jest-create-tests.html

Codex must implement the repository-specific version of this pattern, not only copy sample file names. Use the sample names below only when the project is actually implementing the Salesforce flight example.

## Expected Result

The finished work must provide both of the following where applicable:

1. An Agentforce input editor override: a Custom Lightning Type that uses an LWC to collect a complex Apex input object.
2. An Agentforce output renderer override: a Custom Lightning Type that uses an LWC to display a complex Apex output object.

For the Salesforce flight sample, this means:

- Input CLT: `flightFilter`
- Input LWC: `flightRequestFilter` or the existing repository-specific equivalent
- Apex input type: `@apexClassType/c__FlightRequestFilter` or `@apexClassType/c__OuterClass$InnerClass` if the type is an inner class
- Output CLT: `flightResponse`
- Output LWC: `flightDetails`
- Apex output type: `@apexClassType/c__AvailableFlight`, `@apexClassType/c__Flight`, or the exact Apex class returned by the action

The exact Apex class in `schema.json` must match the action parameter or return type configured in the Agentforce action. If the component renders the default UI instead of the LWC, this class/type mismatch is one of the first things to check.

## Repository Discovery Before Coding

Before changing files, inspect the project and identify:

- Salesforce DX project root and package directory from `sfdx-project.json`.
- Current API version. Use API version `64.0` or newer for Agentforce Custom Lightning Types unless the project standard is higher.
- Existing Apex invocable action and request/response wrapper classes.
- Existing `force-app/main/default/lwc` components.
- Existing `force-app/main/default/lightningTypes` bundles.
- Whether the target channel is Agentforce in Lightning Experience or Enhanced Web Chat.

Use `lightningDesktopGenAi` for Agentforce in Lightning Experience. If the requirement is Enhanced Web Chat, place `editor.json` or `renderer.json` under the corresponding `enhancedWebChat` channel folder instead.

Do not create duplicate components or types if equivalent files already exist. Update existing files consistently.

## Required Metadata Structure

Create this structure under the Salesforce package directory, usually `force-app/main/default`.

```text
force-app/main/default/
  lightningTypes/
    <inputTypeName>/
      schema.json
      lightningDesktopGenAi/
        editor.json
    <outputTypeName>/
      schema.json
      lightningDesktopGenAi/
        renderer.json
  lwc/
    <inputEditorComponent>/
      <inputEditorComponent>.html
      <inputEditorComponent>.js
      <inputEditorComponent>.js-meta.xml
      <inputEditorComponent>.css optional
      __tests__/
        <inputEditorComponent>.test.js
    <outputRendererComponent>/
      <outputRendererComponent>.html
      <outputRendererComponent>.js
      <outputRendererComponent>.js-meta.xml
      <outputRendererComponent>.css optional
      __tests__/
        <outputRendererComponent>.test.js
```

## Custom Lightning Type: Input Editor

### `lightningTypes/<inputTypeName>/schema.json`

Example for a top-level Apex class:

```json
{
  "title": "Flight Filter",
  "description": "Flight Filter",
  "lightning:type": "@apexClassType/c__FlightRequestFilter"
}
```

Example for an Apex inner class:

```json
{
  "title": "Flight Filter",
  "description": "Flight Filter",
  "lightning:type": "@apexClassType/c__FlightAgent$Filter"
}
```

Rules:

- Use `@apexClassType/c__ClassName` for top-level Apex classes.
- Use `@apexClassType/c__OuterClass$InnerClass` for Apex inner classes.
- Match the exact type used by the Agentforce action input parameter.
- Keep the CLT folder name stable because the LWC metadata references it as `c__<inputTypeName>`.

### `lightningTypes/<inputTypeName>/lightningDesktopGenAi/editor.json`

```json
{
  "editor": {
    "componentOverrides": {
      "$": {
        "definition": "c/<inputEditorComponent>"
      }
    }
  }
}
```

Rules:

- Use `editor.json` for action input UI.
- `$` means this is a top-level override for the whole custom Lightning type.
- `definition` must use the LWC bundle name in `c/componentName` format.
- Do not use `renderer.json` for input.

### Input LWC metadata: `<inputEditorComponent>.js-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>64.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Flight Request Filter</masterLabel>
    <targets>
        <target>lightning__AgentforceInput</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__AgentforceInput">
            <targetType name="c__flightFilter"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

If the component receives and returns the same custom type and the org requires explicit source typing, use both `sourceType` and `targetType` with the same CLT name:

```xml
<targetConfig targets="lightning__AgentforceInput">
    <sourceType name="c__flightFilter"/>
    <targetType name="c__flightFilter"/>
</targetConfig>
```

Rules:

- Use `lightning__AgentforceInput` for input components.
- The type name is the CLT folder name prefixed with `c__`, not the LWC name.
- Keep the API version at `64.0` or newer.
- Add public component properties with `@api` in JavaScript when they are read or set by Agentforce.

### Input LWC JavaScript contract

The input LWC must expose a public `value` property and dispatch a `valuechange` event whenever the user changes an input field.

Use this pattern, adapted to the real fields:

```js
import { LightningElement, api } from 'lwc';

const DEFAULT_VALUE = {
    price: null,
    discountPercentage: null
};

export default class FlightRequestFilter extends LightningElement {
    _value = { ...DEFAULT_VALUE };

    @api
    get value() {
        return this._value;
    }

    set value(newValue) {
        this._value = {
            ...DEFAULT_VALUE,
            ...(newValue || {})
        };
    }

    handleInputChange(event) {
        event.stopPropagation();

        const fieldName = event.target.dataset.field;
        const rawValue = event.detail?.value ?? event.target.value;
        const normalizedValue = rawValue === '' || rawValue === null || rawValue === undefined
            ? null
            : Number(rawValue);

        this._value = {
            ...this._value,
            [fieldName]: normalizedValue
        };

        this.dispatchEvent(
            new CustomEvent('valuechange', {
                detail: {
                    value: this._value
                },
                bubbles: true,
                composed: true
            })
        );
    }
}
```

Rules:

- Do not mutate nested state in place. Assign a new object before dispatching `valuechange`.
- Dispatch `valuechange` with `detail.value` containing the full object expected by Apex.
- Use `bubbles: true` and `composed: true` so Agentforce can receive the event.
- Stop propagation for the original input event to avoid duplicate or unexpected parent handling.
- Normalize numeric fields to numbers, boolean fields to booleans, and empty values to `null` when the Apex type expects nullable values.

### Input LWC HTML guidelines

Use Lightning base components and stable selectors for tests:

```html
<template>
    <lightning-card title="Optional Flight Filters">
        <div class="slds-p-around_medium">
            <lightning-input
                type="number"
                label="Maximum Price"
                data-field="price"
                value={value.price}
                onchange={handleInputChange}>
            </lightning-input>

            <lightning-input
                type="number"
                label="Minimum Discount Percentage"
                data-field="discountPercentage"
                value={value.discountPercentage}
                onchange={handleInputChange}>
            </lightning-input>
        </div>
    </lightning-card>
</template>
```

Rules:

- Use `data-field` or another stable selector for tests.
- Do not rely only on CSS class selectors for tests.
- Keep labels clear because the purpose of the CLT is to make complex input understandable in the agent conversation.

## Custom Lightning Type: Output Renderer

### `lightningTypes/<outputTypeName>/schema.json`

Example for a top-level Apex class:

```json
{
  "title": "My Flight Response",
  "description": "My Flight Response",
  "lightning:type": "@apexClassType/c__AvailableFlight"
}
```

Example for an Apex inner class:

```json
{
  "title": "My Flight Response",
  "description": "My Flight Response",
  "lightning:type": "@apexClassType/c__FlightAgent$AvailableFlight"
}
```

Rules:

- Match the exact Apex output type selected in the Agentforce action output.
- If the action returns a wrapper object that contains a list, point to the wrapper class, not the individual item class.
- If the action returns a list or collection, make the output LWC robust to both wrapper and array shapes.

### `lightningTypes/<outputTypeName>/lightningDesktopGenAi/renderer.json`

```json
{
  "renderer": {
    "componentOverrides": {
      "$": {
        "definition": "c/<outputRendererComponent>"
      }
    }
  }
}
```

Rules:

- Use `renderer.json` for action output UI.
- `$` means this is a top-level override for the whole custom Lightning type.
- `definition` must use the LWC bundle name in `c/componentName` format.
- Do not use `editor.json` for output.

### Output LWC metadata: `<outputRendererComponent>.js-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>64.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Flight Details</masterLabel>
    <targets>
        <target>lightning__AgentforceOutput</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__AgentforceOutput">
            <sourceType name="c__flightResponse"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

Rules:

- Use `lightning__AgentforceOutput` for output components.
- Use `sourceType` for the CLT that Agentforce provides to the output LWC.
- The type name is the CLT folder name prefixed with `c__`, not the Apex class name and not the LWC name.
- Keep the API version at `64.0` or newer.

### Output LWC JavaScript contract

The output LWC must expose a public `value` property and render useful labels, not raw JSON.

Use a defensive getter pattern so minor differences in wrapper shape do not break the UI:

```js
import { LightningElement, api } from 'lwc';

export default class FlightDetails extends LightningElement {
    @api value;

    get flights() {
        if (Array.isArray(this.value)) {
            return this.value;
        }

        if (Array.isArray(this.value?.flights)) {
            return this.value.flights;
        }

        if (Array.isArray(this.value?.availableFlights)) {
            return this.value.availableFlights;
        }

        if (this.value) {
            return [this.value];
        }

        return [];
    }

    get hasFlights() {
        return this.flights.length > 0;
    }
}
```

Rules:

- Preserve the exact field names returned by Apex.
- Add display getters for formatted labels, currency, durations, percentages, or boolean values where useful.
- Do not make callouts from the renderer unless explicitly required. The renderer should primarily display the action result.
- Render a clear empty state if the action returns no data.

### Output LWC HTML guidelines

Example structure:

```html
<template>
    <template if:true={hasFlights}>
        <template for:each={flights} for:item="flight">
            <article key={flight.flightId} class="slds-card slds-m-bottom_small">
                <div class="slds-card__body slds-card__body_inner">
                    <p><strong>Flight:</strong> {flight.flightId}</p>
                    <p><strong>Price:</strong> {flight.price}</p>
                    <p><strong>Discount:</strong> {flight.discountPercentage}%</p>
                    <p><strong>Layovers:</strong> {flight.numLayovers}</p>
                    <p><strong>Pets Allowed:</strong> {flight.isPetAllowed}</p>
                </div>
            </article>
        </template>
    </template>

    <template if:false={hasFlights}>
        <p>No matching results were returned.</p>
    </template>
</template>
```

Rules:

- Use labels so the response is understandable inside the agent conversation.
- Use SLDS utility classes or component CSS; do not introduce external styling libraries.
- Use stable keys for repeated items.
- Avoid unsafe HTML injection.

## Agentforce Action Configuration

After deploying the Apex, CLTs, and LWCs, configure the Agentforce action manually or document the exact admin steps in the pull request.

For the Salesforce flight sample:

1. Open the custom agent action.
2. Confirm the action uses the Apex invocable method, for example `Find Flights`.
3. Confirm standard inputs such as `originCity`, `destinationCity`, and `dateOfTravel` use standard Lightning types such as text and date.
4. For the complex input parameter, for example `filters`, set `Input Rendering` to the input CLT, for example `flightFilter`.
5. For the complex output parameter, for example `aFlight`, set `Output Rendering` to the output CLT, for example `flightResponse`.
6. Save the agent action.
7. If Salesforce shows `Unsupported Data Type` in `Map to Variable` for `@apexClassType` or custom Lightning types, do not treat that message alone as a failure if the action saves successfully.
8. Reload the agent page before testing.

## Agent or Subagent Instructions

Update the agent/subagent instructions so the LLM invokes the form-based action path instead of collecting the complex object as free text.

Example instruction for the flight sample:

```text
When the user asks to find flights, collect origin city, destination city, and date of travel, then invoke the Find Flights action. For optional filters such as maximum price and discount percentage, use the action's override input component instead of asking the user to provide a free-text JSON or text description. Display returned flight results using the configured output rendering component.
```

Rules:

- Keep the instruction specific to the action name and required fields.
- Do not tell the user to provide raw JSON unless the business requirement explicitly requires it.
- Test that the agent invokes the action and renders the input component.

## Unit Testing Requirements

Use LWC Jest tests for both components.

Codex must:

- Create tests under each component's `__tests__` folder.
- Commit `__tests__` folders to version control.
- Ensure `.forceignore` excludes LWC Jest test folders from deployment.
- Prefer behavior tests over snapshots.
- Use `createElement` from `lwc`.
- Clean up the DOM in `afterEach`.
- Use promises or `await Promise.resolve()` when testing asynchronous DOM updates.

### Setup commands

From the Salesforce DX project root:

```sh
sf force lightning lwc test setup
npm install
```

If the project already has Jest configured, do not overwrite working configuration without preserving custom settings.

### Run commands

```sh
npm run test:unit
npm run test:unit:coverage
```

Alternative Salesforce CLI command if package scripts are unavailable:

```sh
sf force lightning lwc test run
```

### Input LWC test cases

At minimum, test:

1. Renders the expected input fields and labels.
2. Accepts an initial `value` object.
3. Dispatches `valuechange` when a field changes.
4. `valuechange.detail.value` contains the complete updated object.
5. Numeric fields are normalized to numbers or `null` according to Apex expectations.

Example skeleton:

```js
import { createElement } from 'lwc';
import FlightRequestFilter from 'c/flightRequestFilter';

describe('c-flight-request-filter', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('dispatches valuechange with updated filter value', () => {
        const element = createElement('c-flight-request-filter', {
            is: FlightRequestFilter
        });
        element.value = {
            price: 1000,
            discountPercentage: 10
        };

        const handler = jest.fn();
        element.addEventListener('valuechange', handler);
        document.body.appendChild(element);

        const priceInput = element.shadowRoot.querySelector('[data-field="price"]');
        priceInput.value = '750';
        priceInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: '750' }
        }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.value).toMatchObject({
            price: 750,
            discountPercentage: 10
        });
    });
});
```

### Output LWC test cases

At minimum, test:

1. Renders an empty state when no data is passed.
2. Renders labels and values for a single object.
3. Renders multiple result rows/cards when the value contains an array or wrapper list.
4. Does not render raw JSON as the primary UI.

Example skeleton:

```js
import { createElement } from 'lwc';
import FlightDetails from 'c/flightDetails';

describe('c-flight-details', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders flight details from the action output value', () => {
        const element = createElement('c-flight-details', {
            is: FlightDetails
        });
        element.value = {
            flights: [
                {
                    flightId: 'SF-100',
                    price: 500,
                    discountPercentage: 15,
                    numLayovers: 1,
                    isPetAllowed: true
                }
            ]
        };

        document.body.appendChild(element);

        const text = element.shadowRoot.textContent;
        expect(text).toContain('SF-100');
        expect(text).toContain('Price');
        expect(text).toContain('Discount');
    });
});
```

## Metadata Validation and Deployment

Validate before deploying where possible.

```sh
sf project deploy validate \
  --source-dir force-app/main/default/lwc \
  --source-dir force-app/main/default/lightningTypes \
  --target-org "$SF_TARGET_ORG" \
  --wait 30
```

Deploy after validation passes:

```sh
sf project deploy start \
  --source-dir force-app/main/default/lwc \
  --source-dir force-app/main/default/lightningTypes \
  --target-org "$SF_TARGET_ORG" \
  --wait 30
```

If the Apex classes changed, include Apex in validation/deployment and run Apex tests:

```sh
sf project deploy validate \
  --source-dir force-app/main/default/classes \
  --source-dir force-app/main/default/lwc \
  --source-dir force-app/main/default/lightningTypes \
  --target-org "$SF_TARGET_ORG" \
  --test-level RunLocalTests \
  --wait 30

sf apex run test \
  --target-org "$SF_TARGET_ORG" \
  --test-level RunLocalTests \
  --result-format human \
  --code-coverage \
  --wait 30
```

Use project-specific aliases and package directories. If `$SF_TARGET_ORG` is not available, inspect existing project scripts or ask the operator to provide the target org alias.

## End-to-End Agentforce Test

After deployment and action configuration, run a manual test in the Agentforce agent UI.

Flight sample test prompt:

```text
Find flights from San Francisco to New York for next Friday. I also want optional filters for maximum price and discount.
```

Verify:

- The agent asks for required fields if they are missing.
- The complex filter input is shown using the LWC editor, not a raw text prompt.
- Changing price or discount in the editor updates the action input.
- The action executes successfully.
- The response output is shown using the LWC renderer, not default raw Apex object formatting.
- No browser console errors appear.
- No Salesforce deployment or runtime errors appear in logs.

Record the exact prompt used and the observed result in the pull request or final implementation notes.

## Troubleshooting Checklist

If the default UI appears instead of the LWC:

- Confirm the Agentforce action's `Input Rendering` or `Output Rendering` field is set to the CLT.
- Reload the agent page after saving the action configuration.
- Confirm `schema.json` points to the exact Apex class used by the action input/output.
- For inner Apex classes, confirm the `$` separator is used, for example `c__FlightAgent$AvailableFlight`.
- Confirm the LWC metadata target uses `lightning__AgentforceInput` or `lightning__AgentforceOutput` correctly.
- Confirm the LWC target config references the CLT as `c__<typeFolderName>`.
- Confirm `editor.json` or `renderer.json` references the LWC as `c/<componentName>`.
- Confirm `editor.json` is under the right channel folder, for example `lightningDesktopGenAi` or `enhancedWebChat`.
- Confirm metadata deployed successfully as `LightningTypeBundle` and `LightningComponentBundle`.
- Confirm API version is `64.0` or newer.
- Confirm the agent/subagent instructions do not force the LLM to ask for text instead of using the input component.

If input values are not passed to Apex:

- Confirm the input LWC exposes `@api value`.
- Confirm `handleInputChange()` dispatches `valuechange`.
- Confirm the event includes `detail.value` with the complete object.
- Confirm the event uses `bubbles: true` and `composed: true`.
- Confirm field names in the object exactly match the Apex property names.

If output data is blank:

- Log or inspect the shape of `value` in a safe development environment.
- Confirm whether the action returns a single object, a wrapper object, or a list.
- Update getters to handle the real shape without breaking tests.
- Confirm the output CLT schema points to the wrapper type if the action returns a wrapper.

## Definition of Done

Codex must not mark the task complete until all relevant items are true:

- CLT `schema.json` files exist and point to the correct Apex classes.
- `editor.json` maps the input CLT to the input LWC.
- `renderer.json` maps the output CLT to the output LWC.
- Input LWC uses `lightning__AgentforceInput` and dispatches `valuechange` correctly.
- Output LWC uses `lightning__AgentforceOutput` and renders labeled, user-friendly output.
- LWC Jest tests exist and pass.
- Metadata validation or deployment succeeds against the target org, or any org limitation is clearly documented.
- Agentforce action configuration steps are completed or precisely documented for the admin.
- End-to-end Agentforce test is completed or, if no org access is available, the exact blocked step is documented.

## Do Not Do These Things

- Do not use `editor.json` for output or `renderer.json` for input.
- Do not reference the LWC as `c__componentName`; use `c/componentName` in `editor.json` and `renderer.json`.
- Do not reference the CLT as `c/componentName`; use `c__typeName` in LWC target config.
- Do not hardcode Salesforce sample class names if the repository has different Apex classes.
- Do not deploy Jest `__tests__` folders to Salesforce.
- Do not rely only on manual testing. Add Jest tests for component behavior.
- Do not mark the `Unsupported Data Type` message as a failure when the Salesforce docs say it can be safely ignored after selecting custom Lightning types in the rendering parameter and saving successfully.