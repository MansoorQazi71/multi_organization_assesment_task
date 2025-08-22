# DESIGN.md

## Product
**MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION**  
Minimal, black-&-white app to manage contacts and notes across multiple organizations.  
Auth via Breeze (Inertia + React + TS). Authorization via spatie/laravel-permission (roles: `admin`, `member`).

---

## Data Model (minimum)
- **organizations**: `id`, `name`, `slug (unique)`, `owner_user_id`, timestamps  
- **users**: Breeze defaults (`id`, `name`, `email`, `password`, timestamps, etc.)
- **organization_user** (pivot): `organization_id`, `user_id`, `role` (`admin|member`), timestamps
- **contacts**:  
  `id`, `organization_id (FK)`, `first_name`, `last_name`,  
  `email (nullable, unique per org, case-insensitive)`, `phone (nullable)`,  
  `avatar_path (nullable)`, `created_by`, `updated_by`, timestamps
- **contact_notes**: `id`, `contact_id (FK)`, `user_id (FK)`, `body`, timestamps
- **contact_meta**: `id`, `contact_id (FK)`, `key`, `value`, timestamps (≤ 5 pairs per contact)

---

## Org Scoping (mandatory)
**Goal:** _All reads/writes are constrained to the “current organization.”_ No cross-org leakage.

### Current org resolution
- On login or first load, pick the user’s first organization as default if session key missing.
- **Switch** via `POST /switch-org/{orgId}`: validates membership, writes `session(['current_organization' => $orgId])`.

### Global scoping helper (two options)
- **A. Global scope trait (preferred)**  
  `BelongsToOrganization` adds a global query scope using `session('current_organization')`, and auto-sets `organization_id` on create.
- **B. Controller scoping (used where needed)**  
  Every query includes `where('organization_id', session('current_organization'))`.

> The app uses (B) explicitly in controllers, and is compatible with (A) if you later add the trait.

---

## Authorization
### Roles
- **admin**: manage organizations; full contacts CRUD + duplicate; manage org membership; switch org.
- **member**: view contacts; add/edit/delete _their own_ notes.

### Enforcement
- Route middleware:  
  - Shared: `['auth', 'role:admin|member']` for viewing.  
  - Admin-only: `['auth', 'role:admin']` for create/update/delete/switch/manage.
- (Optional) Policies for fine-grained ownership on notes.

---

## Routes (Laravel)
**Public**
- `GET /` → Welcome  
- Breeze auth routes

**Authenticated**
- `GET /dashboard`  
- `GET /profile` + update/delete

**Organizations (shared reads)**
- `GET /organizations` → list
- `GET /organizations/{id}` → show
- `GET /organizations/{id}/manage` → org dashboard (contacts, notes, meta) [view-only for members]

**Organizations (admin)**
- `GET /organization/create` → form
- `POST /organization/create` → store
- `POST /switch-org/{orgId}` → switch current org
- **Org Users (admin)**  
  - `GET /organizations/{id}/users` → list members, add/remove, change role  
  - `POST /organizations/{id}/users` → attach user w/ role  
  - `PUT /organizations/{id}/users/{userId}` → update pivot role  
  - `DELETE /organizations/{id}/users/{userId}` → detach

**Contacts (shared reads)**
- `GET /contacts` → index + **search** (?q=) on first_name/last_name/email (contains, case-insensitive)
- `GET /contacts/{id}` → show (includes notes + meta)

**Contacts (admin)**
- `GET /contacts/create` → form
- `POST /contacts/create` → store (avatar upload supported)
- `GET /contacts/{id}/edit` → form
- `PUT /contact/{id}` → update (avatar replace/remove; meta+notes sync)
- `DELETE /contacts/{id}` → destroy
- `POST /contacts/{id}/duplicate` → duplicate (copy all except email → null)

---

## Duplicate-Email Flow (followed exactly)
**Create Contact:**
1. Server checks **case-insensitive** in current org:
   ```sql
   where organization_id = :orgId and lower(email) = lower(:email)
