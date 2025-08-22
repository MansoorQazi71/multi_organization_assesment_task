
---

# AI_NOTES.md
```markdown
# AI_NOTES.md

This file documents how AI tools (Cursor + GPT-5) were used during planning and implementation, including what was accepted or rejected and why.

## Tools
- **Cursor**: iterative coding inside the repo; quick refactors; inline TypeScript/React tweaks.
- **GPT-5 (ChatGPT “GPT-5 Thinking”)**: planning, code snippets, Laravel 11+ routing/middleware guidance, spatie/permission usage, Inertia patterns, duplicate-email flow, and documentation drafts.

## Key Prompts & Outcomes

### 1) Routing & Roles (spatie/permission)
**Prompt:**  
“Protect these routes so Members can only read and Admins can do CRUD. Using spatie/laravel-permission (no teams), show route groups.”

**Accepted:**  
- Two middleware groups: `role:admin|member` (read) and `role:admin` (manage).
- Clear separation for org & contacts.

**Rejected:**  
- An early suggestion to enable **teams** in spatie (added `team_id` columns). Rejected to keep the app simple and match spec (global roles only).

### 2) Duplicate Email Flow
**Prompt:**  
“Implement exact flow: on create, case-insensitive per-org duplicate returns 422 JSON `{ code: "DUPLICATE_EMAIL", existing_contact_id }`, log info, frontend redirects with banner.”

**Accepted:**  
- Manual `LOWER(email)` check to ensure case-insensitive duplicate.
- Exact JSON payload & HTTP 422.
- Logging key: `duplicate_contact_blocked`.

**Rejected:**  
- Doing validation-only uniqueness without custom JSON. Spec requires a very specific 422 payload and redirect behavior.

### 3) Inertia + React Forms (Avatar Upload)
**Prompt:**  
“Build Create/Edit contact pages that upload an avatar and sync custom fields + notes; show initials when no avatar; delete avatar when toggled.”

**Accepted:**  
- Use `FormData` with `forceFormData: true`.
- On Edit, support `remove_avatar` toggle.
- On Update, delete removed meta keys and notes, re-create notes for current user.

**Rejected:**  
- Keeping old notes and trying to diff by content. Simpler spec-aligned approach: delete-and-recreate per current user.

### 4) Search (Contacts Index)
**Prompt:**  
“Add search by first_name/last_name/email (contains). Keep styling black & white.”

**Accepted:**  
- Single `q` param; server performs `LIKE` on three columns, scoped to current org.

**Rejected:**  
- Full-featured advanced filters (status, created range). Out of scope.

### 5) Org Members CRUD
**Prompt:**  
“Provide org users CRUD on the pivot (add/remove user, change role).”

**Accepted:**  
- Admin-only; `GET/POST/PUT/DELETE` on `/organizations/{id}/users`.

**Rejected:**  
- Assigning spatie roles per organization (teams). The spec calls for a simple pivot role and global role set.

## Decisions & Rationale
- **No spatie teams**: teams complicated schema and caused FK errors. The challenge only needs `admin` and `member` globally, plus a pivot `role` per org.
- **Controller scoping** (short-term): explicit `where('organization_id', session(...))` everywhere critical. Future: trait with a global scope to reduce risks.
- **Exact UX for duplicate**: The rubric checks precision; we prioritized compliance over DRY validation-only flow.

## What to Improve Later
- Add `BelongsToOrganization` global scope & `creating` model hook to auto-fill `organization_id`.
- Policies for contacts/notes (esp. note ownership).
- Pagination and server-side search sanitization.
