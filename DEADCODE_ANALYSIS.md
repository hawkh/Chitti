# Dead Code Analysis

## Scope
This report focuses on TypeScript-level dead code signals (unused imports, variables, params) and adjacent compile-time issues that usually hide dead paths.

## Method
Command used:

```bash
npx tsc --noEmit --noUnusedLocals --noUnusedParameters > deadcode-tsc.log 2>&1
```

## Results Summary
- Total diagnostics logged: **284** lines.
- Unused-symbol diagnostics (`TS6133`): **233**.
- Unused-import diagnostics (`TS6192`): **2**.
- Non-dead-code type/compatibility diagnostics also present (e.g. `TS7006`, `TS2322`, `TS2339`) and should be fixed in parallel because they block stricter static analysis.

## Highest Dead-Code Hotspots (by unused diagnostics count)
1. `__tests__/components/detection/DefectVisualization.test.tsx` (7)
2. `services/digitaltwin/DigitalTwinEngine.ts` (6)
3. `services/blockchain/ComplianceEngine.ts` (6)
4. `services/ai/MultiModalEngine.ts` (6)
5. `app/api/audit/manager/review/[id]/route.ts` (6)
6. `app/api/audit/users/[id]/route.ts` (5)

## Observations
- A large share of dead code appears in **stub/placeholder engines** (digital twin, blockchain, multimodal AI) where arguments are accepted but not consumed yet.
- Dead code also appears in **UI-heavy components/tests**, suggesting refactors left behind imports/state fields not connected to render/output paths.
- Test files include several unused imports/locals; cleaning these first is low-risk and improves signal-to-noise for production dead code.

## Recommended Cleanup Order
1. **Tests first**: remove unused imports/locals in `__tests__/...`.
2. **Feature stubs**: either implement currently ignored parameters or intentionally prefix with `_` to mark TODO placeholders.
3. **API routes**: remove dead locals in route handlers to reduce cognitive load and prevent drift.
4. **Enable CI gate**: run `npm run analyze:deadcode` on PRs and fail on new unused-symbol regressions.

## Follow-up
- Keep `deadcode-tsc.log` as a point-in-time artifact for this analysis run.
- Re-run analysis after each cleanup batch and track the `TS6133` count trend.
