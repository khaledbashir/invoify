---
trigger: always_on
---

Deployment Workflow Rules
Core Philosophy
No development environment - All testing and deployment happens directly on production

Never suggest or create dev/staging branches - Work only on main/production branch

Every commit triggers automatic deployment - Code goes live immediately after push

GitHub & Easypanel Integration
After every code change, always push to GitHub repository

Easypanel is configured with auto-deploy webhooks that trigger builds automatically on every GitHub push
​

Never ask about manual deployment - the GitHub push IS the deployment trigger

Understand that pushing to GitHub = deploying to production via Easypanel

Git Workflow
Commit frequently with clear, descriptive messages

Push immediately after each logical code change

Never batch multiple features into one commit unless explicitly requested

Each push should be deployable and not break the production environment

Code Quality Standards
Test before pushing - Since there's no dev environment, code must work the first time

Write complete, production-ready code - no placeholders like // ... rest of code ...
​

Include error handling and edge case validation in every function

Add logging for debugging production issues

Repository Structure
Always confirm the GitHub repository URL before pushing

Respect the existing project structure and build configuration (Nixpacks or Dockerfile)
​

Never modify build configuration files without explicit permission

Change Management
Provide a clear PLAN with REASONING before making changes
​

Explain OBSERVATIONS from code and logs clearly

Only modify code directly relevant to the specific request

Break complex problems into smaller, testable steps

