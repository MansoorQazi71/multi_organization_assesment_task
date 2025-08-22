# TESTS.md

This project includes the two **required** feature tests:

1. **Cross-org isolation** — Org A cannot access Org B’s contact (expects 404/403).
2. **Duplicate email** — Creation blocked with exact 422 payload:
   ```json
   { "code": "DUPLICATE_EMAIL", "existing_contact_id": <id> }
   on the show contacts page it will display error after redirection
