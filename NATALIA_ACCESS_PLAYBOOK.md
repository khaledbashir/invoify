# Natalia Access Playbook

## If a link loads weird / stale
- Do a hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- If that still looks wrong, open the link in an incognito/private window

## If the page does not load at work
- Corporate networks sometimes block unknown domains or WebSockets
- Use a phone hotspot or a home network as a quick workaround

## If IT needs allowlisting
- Allow the application domain (example): `basheer-rag.prd42b.easypanel.host`
- Allow WebSocket access to Browserless if PDF export uses it

## Quick “Is it up?” checks
- App health: `/api/health`
- Browserless connectivity: `/api/test/browserless`

## What “Save failed” usually means
- Database is unreachable or credentials are wrong
- The app health endpoint will show `db.ok=false` when this happens
