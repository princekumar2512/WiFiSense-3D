# WiFiSense 3D: Authentication, RBAC & Security Specification

## 1. Identity & Access Architecture

WiFiSense 3D implements a decoupled identity provider architecture compatible with **Keycloak 24+** (OpenID Connect / OAuth 2.0) and backend cryptographic token verification:

```
[ Frontend Client ] ---> [ POST /api/v1/auth/login ] ---> [ Password Verification (Bcrypt) ]
                                                                      |
                                                                      v
[ Client Session ]  <--- [ Issued JWT (RS256 / HS256) ] <--- [ Issue Token with Roles ]
```

---

## 2. 6-Tier Role-Based Access Control (RBAC) Matrix

| Role | University Management | Building CAD Editor | Hardware & Nodes | View Anonymous Occupancy | Personal Localization | Train AI Models |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Administrator** | Full | Full | Full | Yes | Yes (Audit) | Yes |
| **University Administrator** | Own Univ | Own Univ | Own Univ | Yes | No | Yes |
| **Hostel Administrator** | No | Own Hostel | Own Hostel | Yes | No | No |
| **Researcher** | No | Read-Only | Read-Only | Yes | Anonymized | Full |
| **Registered Participant** | No | No | No | Public Zones | Own Records | No |
| **Guest** | No | No | No | Summary | No | No |

---

## 3. Strict Multi-University Tenant Isolation

1. Every database query filters on `university_id` associated with the authenticated user token.
2. Cross-university requests return **`HTTP 403 Forbidden: Tenant Isolation Violation`**.
3. In PostgreSQL production deployments, Row-Level Security (RLS) policies enforce partition boundaries at the database engine level.

---

## 4. Digital Personal Data Protection Act, 2023 (DPDP) Compliance

- **Explicit Consent**: Consent must be affirmatively granted before personal tracking endpoints will process or store coordinates.
- **Revocation**: A single API call (`POST /consent/revoke`) halts all participant tracking immediately and invalidates active session tokens.
- **Right to Erasure (Sec 12)**: Endpoints queue all historical localization traces for immediate cryptographic shredding.
- **Air-Gapped Anonymous Stream**: Ambient RF perturbation analysis is isolated in separate database tables and never linked with resident accounts.
