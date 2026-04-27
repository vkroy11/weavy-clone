---
title: ImageNode FileReader has no onerror handler
severity: high
category: bug
file: src/components/nodes/ImageNode.tsx:13-21
---

## Problem
`FileReader` is wired with only `onloadend` — there is no `onerror` handler. If the user picks a corrupt file, a file the browser can't read (permissions / size), or the read is aborted, the node's state is never updated and the user sees no indication anything went wrong.

## Why it matters
Users who pick a bad file get a silent broken state and may run the workflow assuming the image is loaded.

## Suggested fix
- Add `reader.onerror` that sets a node-local error state ("couldn't read this image — try another file").
- Add a max-size guard before starting the read (e.g. 8 MB) so giant files fail fast with a friendly message instead of locking up the browser.
- Consider switching to `URL.createObjectURL` for preview and only converting to base64 on workflow run, to avoid storing a giant base64 string in the workflow JSON (related: [030](030-image-base64-bloats-db.md)).

## Acceptance criteria
- [ ] FileReader errors surface a visible inline error in the node.
- [ ] Files over the size cap are rejected with a clear message.
- [ ] No regression in the happy path (image still uploads & runs).
