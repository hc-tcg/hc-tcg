---
title: Fuzz Testing Failure Detected: `{{ env.SEED }}`
assignees: JasonEtco, matchai
labels: fuzz
---
Fuzz Testing Failure Detected. Check with the folliwng command:
```sh
npm run test:fuzz -- debug {{ env.SEED }}
```

