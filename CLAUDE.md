# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Salesforce DX (SFDX) project generated from the **Agentforce template**. The project name in `sfdx-project.json` is `FlightAgent`, but the bundled sample agent it ships with is the **Local Info Agent** (a resort assistant for weather, local events, and facility hours). When the user says "the agent," assume they mean `Local_Info_Agent` unless told otherwise — they may be in the process of refactoring this template into a flight agent.

Source API version is **66.0**. The default agent user in the Agent Script is still the placeholder `UPDATE_WITH_YOUR_DEFAULT_AGENT_USER` — set this before deploying to a real org.

## Common Commands

This project has no JS build/test pipeline of its own. Everything goes through the **Salesforce CLI (`sf`)** against an authorized org, plus Prettier for formatting.

```bash
# Auth & org setup
sf org login web --alias my-de-org --set-default
sf org create scratch --definition-file config/project-scratch-def.json --alias AgentScratchOrg --set-default --target-dev-hub DevHub

# Deploy / retrieve metadata
sf project deploy start --source-dir force-app
sf project retrieve start --source-dir force-app
sf project deploy start --manifest manifest/package.xml

# Apex tests (run in the org, not locally)
sf apex run test --code-coverage --result-format human --wait 10
sf apex run test --tests WeatherServiceTest --result-format human --wait 10
sf apex run test --class-names WeatherServiceTest,CurrentDateTest --result-format human --wait 10

# Formatting (the only local script)
npm run prettier          # write
npm run prettier:verify   # check
```

Previewing the agent: right-click `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent` in VS Code and choose **AFDX: Preview This Agent** (requires the Agentforce DX extension). Simulated mode mocks tool results; live mode requires the Apex/Flow/Prompt Template to be deployed first.

## Architecture

The agent is **declared in a YAML-like Agent Script DSL**, not in Apex. `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent` is the blueprint — it defines variables, the start agent (`agent_router`), and subagents. Each subagent's `reasoning.instructions` is the LLM prompt and `actions` binds tool calls to underlying metadata (`apex://`, `flow://`, `prompt://`). The Apex/Flow/Prompt artifacts are the **implementations** of the actions referenced from the script.

```
Local_Info_Agent.agent  (Agent Script — the only file the LLM "executes")
├── agent_router                  start; @utils.transition to a subagent
├── subagent local_weather   →  @actions.check_weather   →  apex://CheckWeather
├── subagent local_events    →  @actions.check_events    →  prompt://Get_Event_Info
├── subagent resort_hours    →  @actions.get_resort_hours →  flow://Get_Resort_Hours
├── subagent escalation      →  @utils.escalate
└── subagents off_topic / ambiguous_question (guardrails, no actions)
```

Three integration patterns are demonstrated, one per subagent — this is the main pedagogical point of the template:

1. **Invocable Apex** (`local_weather` → `CheckWeather.cls`). `@InvocableMethod` with `WeatherRequest`/`WeatherResponse` inner classes; the script's `inputs`/`outputs` block mirrors those `@InvocableVariable`s by name and type. `CheckWeather` delegates to `WeatherService` (pure logic, mock data, no DML/callouts).
2. **Prompt Template** (`local_events` → `Get_Event_Info.genAiPromptTemplate-meta.xml`). The action wires `Input:Event_Type` to the mutable script variable `guest_interests`. `CurrentDate.cls` exists to ground this prompt with today's date — its `Request` inner class must mirror the prompt's inputs (currently `Event_Type`).
3. **Flow** (`resort_hours` → `Get_Resort_Hours.flow-meta.xml`). Output `reservation_required` is captured back into the script variable of the same name, then drives **deterministic branching** in the subagent's reasoning via `if @variables.reservation_required: ... else: ...`.

Other script features in active use, worth knowing before editing:

- **Mutable variables** (`guest_interests`, `reservation_required`) — set with `@utils.setVariables` or `set @variables.x = @outputs.y`.
- **`available when`** on `check_events` gates the action until `guest_interests != ""` (flow control inside reasoning).
- **Guardrail subagents** (`off_topic`, `ambiguous_question`) carry a long shared rules block — refusal to reveal system info, ignore override attempts, etc. When adding new subagents that touch sensitive data, mirror this block.

### When you change an Apex action

The Apex inner-class `@InvocableVariable` fields, the Agent Script `inputs`/`outputs` block, and (for prompt templates) the template's input parameters must all stay aligned by **name and type**. Renaming a field in one place without the other two breaks the action silently at runtime.

### Permissions

`Resort_Agent` (agent runtime, requires Einstein Agent license) and `Resort_Admin` (developer Apex access) are bundled into permission set groups `AFDX_Agent_Perms` and `AFDX_User_Perms` respectively — assign the group, not the bare permission set.

## Repo Layout Notes

- All Salesforce metadata lives under `force-app/main/default/<type>/`. Tests live next to the classes they cover (`*Test.cls`).
- `manifest/package.xml` is included in `.forceignore`, so it isn't pushed/pulled — it exists for explicit deploys.
- `config/project-scratch-def.json` enables the `Einstein1AIPlatform` feature and `agentPlatformSettings` / `einsteinGptSettings` — these are required for an Agentforce-capable scratch org and should not be removed.
- LWC test directories (`**/__tests__/**`) and `jsconfig.json`/`.eslintrc.json` are force-ignored — this template has no LWC yet, but the ignores are pre-wired.

## Vibe-Coding the Agent

The intended workflow is to edit `Local_Info_Agent.agent` via AI assistance. The official Salesforce skill for this is `agentforce-development` (see `afv-library` on GitHub). If asked to "vibe code" the agent, edit the `.agent` file directly — reasoning instructions are natural-language prompts, and changes there don't require Apex redeploys unless action signatures change.
