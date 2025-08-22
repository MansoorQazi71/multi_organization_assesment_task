MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION

A minimalist, black-and-white Laravel + Inertia/React app for managing contacts and notes across multiple organizations, with strict per-organization scoping and role-based authorization (Admin, Member). Avatars are stored locally and served via /storage.

✨ Features

Auth: Laravel Breeze (Inertia + React + TS)

Organizations: create, list, switch current org (persisted in session)

Roles (Spatie):

Admin: manage orgs & contacts, manage org members, duplicate/delete contacts

Member: view contacts, add/edit/delete own notes

Contacts:

CRUD, duplicate (copies all fields except email)

Avatar upload (public disk → /storage/avatars/...)

Search by name/email (contains)

Custom fields (meta): up to 5 key/value pairs

Notes: per-contact notes with author (user_id)

Strict org scoping:

Current org resolved from session (fallback: user’s first org)

All queries filter by current org; no cross-org reads/writes

UI: Tailwind (monochrome), shadcn/ui-style components

Endpoints:

Health: GET /up (Laravel)
Optional alias: GET /healthz → { "ok": true } (see snippet below)

🧰 Tech Stack

PHP 8.2

Laravel 11.x

Breeze (Inertia + React + TypeScript)

Vite

Tailwind CSS (black & white only)

spatie/laravel-permission

Database: SQLite (default) or MySQL

Mail: log driver

🚀 Quick Start
0) Requirements

PHP 8.2, Composer 2.x

Node 20.x, npm

SQLite (bundled) or MySQL (optional)

1) Clone & install
git clone <your-repo-url>
cd <repo>
cp .env.example .env
composer install
npm install
php artisan key:generate

2a) Use SQLite (default)

.env:

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/your/project/database/database.sqlite


Create file if it doesn’t exist:

php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"

2b) Or use MySQL

.env:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=multi_org
DB_USERNAME=root
DB_PASSWORD=secret


Create the DB in MySQL, then continue.

3) Migrate & seed
php artisan migrate --seed

4) Link storage (serve avatars via /storage/...)
php artisan storage:link

5) Run the app

In two terminals:

php artisan serve
npm run dev


App defaults to http://127.0.0.1:8000

🔐 Accounts (seeded)

The seeder creates two users and basic roles:

Admin

Email: admin@example.com

Password: password (unless you customized UserFactory)

Member

Email: member@example.com

Password: password

Also seeds a sample organization and some contacts.

🧭 Core Concepts
Current Organization

Stored in session (e.g. session('current_organization'))

Switch via: POST /switch-org/{orgId} (Admins only)

All model queries are scoped to the current org (e.g. via a BelongsToOrganization trait + global scope).

Roles & Permissions

Spatie middleware on routes:

role:admin — Admin-only actions

role:admin|member — shared read actions

Reset cache if you change roles/permissions:

php artisan permission:cache-reset

Avatars

Uploaded to storage/app/public/avatars/...

Saved in DB as relative path e.g. avatars/abc.jpg

Served at /storage/avatars/abc.jpg after php artisan storage:link

🧩 Routes (high-level)

Route names assume Ziggy for client-side links.

Auth / App

GET / → Welcome

GET /dashboard → Dashboard (auth+verified)

Organizations

GET /organizations → list

GET /organizations/{id} → show

GET /organizations/{id}/manage → contacts+notes overview

GET /organization/create → create form (admin)

POST /organization/create → store (admin)

POST /switch-org/{orgId} → switch current org (admin)

GET /organizations/{id}/edit → edit form (admin)

PUT /organizations/{id} → update (admin)

Org Members (Admins)

GET /organizations/{org}/users → manage members

POST /organizations/{org}/users → add user to org (role: admin|member)

PUT /organizations/{org}/users/{user} → change org role

DELETE /organizations/{org}/users/{user} → remove from org

Users (Global Admin area)

GET /users → list users

GET /users/create → create form

POST /users → store

GET /users/{user}/edit → edit form

PUT /users/{user} → update

DELETE /users/{user} → delete

Contacts

GET /contacts → list (scoped to current org)

GET /contacts/create → create form (admin)

POST /contacts/create → store (admin)

GET /contacts/{id} → show (shared)

GET /contacts/{id}/edit → edit (admin)

PUT /contact/{id} → update (admin)

DELETE /contacts/{id} → delete (admin)

POST /contacts/{id}/duplicate → duplicate (admin)

POST /contacts/{id}/notes → store note (member/admin)

🖥️ Frontend

Inertia + React + TypeScript

Tailwind (monochrome)

NavBar exposes primary routes

Welcome page is full-screen, no scroll, with quick actions

Dashboard shows role-aware quick links

Pages:

Org index/show/manage

Contacts list/create/edit/show

Users admin pages

Org members management page

✅ Duplicate Email Behavior (spec)

If you haven’t implemented yet, here’s the required UX/contract.

On create contact:

If a contact in the current org already has the same email (case-insensitive), do not insert and return:

{ "code": "DUPLICATE_EMAIL", "existing_contact_id": <id> }


with HTTP 422.

The UI should intercept 422, redirect to that contact’s detail page, and show:

“Duplicate detected. No new contact was created.”

Log an info entry duplicate_contact_blocked with org_id, email, user_id.

🧪 Testing

Run test suite:

php artisan test


Minimum tests to add (as per challenge):

Cross-org isolation: Org A cannot access Org B’s contact (404/403).

Duplicate email: creation blocked with exact 422 payload.

🛠️ Dev Tools

Formatter: Laravel Pint

./vendor/bin/pint


Docs:

php artisan docs


One-liner dev run (optional): If you keep the provided Composer script

composer dev


(Serves PHP, queues, logs, and Vite concurrently.)

🩺 Health Check

Laravel built-in: GET /up → reports app status

Optional GET /healthz (add this in routes/web.php if needed):

Route::get('/healthz', fn() => response()->json(['ok' => true]));

🧯 Troubleshooting

403 on routes
Ensure your user has the correct Spatie role (admin/member) and the route group uses the right middleware (role:admin or role:admin|member). Reset cache:

php artisan permission:cache-reset


419 CSRF
For plain <form> posts, include @csrf (Blade) or an _token field; for Inertia’s router, you’re covered if you use @inertiaHead + default template. In React forms, send the token with your FormData if not using Inertia helper methods.

Avatars not visible
Run php artisan storage:link, and store only relative paths like avatars/xyz.jpg. On the client, render as:

<img src={`/storage/${contact.avatar_path}`} alt="avatar" />


MySQL foreign key issues (Spatie teams)
This project uses no teams. Make sure config/permission.php has:

'teams' => false,


If you generated team migrations previously, roll them back.

📄 Project Docs

DESIGN.md — models, routes, scoping, duplicate flow, UI outline

AI_NOTES.md — prompts & decisions (what was accepted/rejected)

TESTS.md — how to run tests + final green output

If these files are not present yet, add them before submission.

✅ Acceptance Beacons

Breeze + spatie/laravel-permission used

storage:link done; avatars show from /storage/...

Health is OK (/up, or /healthz if you added it)

Two minimum tests added & green

Code formatted with Pint

README ends with the exact phrase below 👇