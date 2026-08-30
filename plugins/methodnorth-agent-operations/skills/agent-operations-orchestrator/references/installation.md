# Installation boundary

The engine is reusable; credentials and project truth are not.

Each installation must provide:

- a unique project ID, task prefix, and role namespace;
- project-specific role instructions and authority limits;
- a dedicated OpenAI Platform project and API key;
- a dedicated Workspace Agent access token and published channel ID;
- a project-scoped GitHub App or repository credential;
- project-specific Zapier connections and destination allowlists;
- independent budgets, audit logs, and rotation schedules.

Never copy `.env` files, access tokens, provider credentials, production identifiers, conversation keys, task records, or business data from another installation.

Run the plugin installer from the destination repository, review the generated configuration, validate it, and only then configure external credentials. Existing files are not overwritten unless the operator explicitly supplies `--force`.
