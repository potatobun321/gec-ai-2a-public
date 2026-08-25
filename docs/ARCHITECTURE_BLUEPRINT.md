# GitNode Architecture Blueprint & Institutional System Design

> **Document Version**: `1.0.0`  
> **Status**: APPROVED ARCHITECTURE BLUEPRINT  
> **Target System**: Federated Student Infrastructure (GEC Jaipur / Autonomous Institutions)

---

## 1. Executive Summary & Philosophical Core

Conventional institutional software relies on centralized database monoliths (Oracle ERP, PostgreSQL backends, paid SaaS platforms) that require dedicated server hosting, IT staff, and continuous licensing budgets.

**GitNode** demonstrates an alternative: educational institutions, student bodies, and research labs can construct resilient, auditable digital infrastructure by composing **Git primitives and GitHub's global infrastructure graph**.

### Core Architectural Axioms
1. **Freedom at the Edge, Strictness at the Boundary**:
   Individual class/club nodes have total freedom over internal visual design, local tools, and open project collaboration. However, institutional exchanges crossing node boundaries must strictly conform to common JSON Schemas.
2. **Git Commit History as the Source of Truth**:
   Every administrative action (attendance log, mark entry, schedule change) is recorded as a version-controlled Git commit. History cannot be silently mutated or erased without leaving a traceable Git tree commit record.
3. **Decoupled Security Boundaries**:
   Public frontends (GitHub Pages) never hold administrative write tokens. All state-mutating actions pass through an authenticating Node.js Gateway service that evaluates Private Repository RBAC rules before interacting with GitHub.

---

## 2. Multi-Repository Network Topology

A GitNode institutional ecosystem consists of three primary repository types:

```
                                  +---------------------------------------+
                                  |    CENTRAL INSTITUTIONAL ARCHIVE      |
                                  |    Repo: GEC-Jaipur/Central-Archive   |
                                  | - Monthly Aggregated Records          |
                                  | - Global JSON Schemas & Validation CI |
                                  +---------------------------------------+
                                                     ^
                                                     | Restricted Protocol Sync
                       +-----------------------------+-----------------------------+
                       |                                                           |
                       v                                                           v
+---------------------------------------------+             +---------------------------------------------+
|               CLASS NODE AI-2A              |             |               CLASS NODE CSE-1A             |
|                                             |             |                                             |
|  1. Public Commons Repo                     |             |  1. Public Commons Repo                     |
|     - Repo: GEC-Jaipur/AI-2A-public         |             |     - Repo: GEC-Jaipur/CSE-1A-public        |
|     - GitHub Pages Website & Projects       |             |     - GitHub Pages Website & Projects       |
|     - `gitnode.yaml` Manifest               |             |     - `gitnode.yaml` Manifest               |
|                                             |             |                                             |
|  2. Private Authority Repo                  |             |  2. Private Authority Repo                  |
|     - Repo: GEC-Jaipur/AI-2A-private        |             |     - Repo: GEC-Jaipur/CSE-1A-private       |
|     - `rbac-rules.json`                     |             |     - `rbac-rules.json`                     |
|     - `attendance/2026/08/*.json`           |             |     - `attendance/2026/08/*.json`           |
+---------------------------------------------+             +---------------------------------------------+
```

### A. Public Commons Repositories
- **Host**: GitHub Pages (Free static hosting).
- **Purpose**: Open contributor surface for students. Hosts websites, class notes, project showcases, event hubs, and documentation.
- **Access Model**: Public read; pull requests (PRs) open to all students.

### B. Private Authority Repositories
- **Host**: Private GitHub Repositories.
- **Purpose**: Storage of sensitive institutional data, attendance records, student rosters, and access control matrices.
- **Access Model**: Private; accessible only by the authenticated Node.js Gateway via GitHub App / PAT tokens.

### C. Central Institutional Archive
- **Host**: Private/Public Central Repository.
- **Purpose**: Ingests validated payloads from node repositories, performs monthly data aggregation, and generates human-readable reporting artifacts (PDF, XLSX, CSV).

---

## 3. Security Model & RBAC Engine Specification

### Why Client-Side Applications Cannot Touch Private Repos Directly
If a browser web app holds a GitHub Personal Access Token (PAT) for a private storage repository, any user could inspect the browser code, extract the token, and overwrite or delete repository data.

### The 4-Layer Security Gateway Architecture

```
[User Action in Browser] 
           │
           ▼
1. GATEWAY ROLE AUTHENTICATION ────► Check `user_id` and `role` against `node-b/rbac-rules.json`
           │                         (Reject HTTP 403 if role lacks permission)
           ▼
2. JSON SCHEMA VALIDATION ─────────► Validate payload structure against `message-v1.schema.json`
           │                         (Reject HTTP 400 if fields or types are malformed)
           ▼
3. CRYPTOGRAPHIC DIGEST ───────────► Compute SHA-256 hash string of exact payload
           │                         (Attach hash receipt to audit record)
           ▼
4. GITHUB REST API COMMIT ─────────► Issue PUT request to GitHub REST API using Gateway server token
           │                         (Return HTTP 200 OK + Commit SHA + GitHub HTML Link)
           ▼
[Verified Commit on GitHub.com]
```

### RBAC Permission Matrix (`node-b/rbac-rules.json`)

| Role | Name | Allowed Actions | Can Modify Attendance? |
| :--- | :--- | :--- | :---: |
| `STUDENT` | Student | `read_public`, `view_own_records`, `propose_pr` | ❌ No |
| `TEACHER` | Faculty Teacher | `read_public`, `view_timetable`, `mark_attendance`, `submit_record` | ✅ Yes |
| `CLASS_MAINTAINER` | Class Representative / CR | `read_public`, `view_timetable`, `review_pr`, `update_manifest` | ❌ No |
| `ADMIN` | Institutional Admin | `read_public`, `mark_attendance`, `submit_record`, `admin_override`, `manage_rbac` | ✅ Yes |

---

## 4. Git Concurrency & File Partitioning Strategy

### The Git API Conflict Problem
In high-frequency environments, multiple users committing to a single monolithic file (e.g. `attendance.json`) cause Git API `409 Conflict` errors when two commits share the same parent SHA.

### Partitioning Solution: File-per-Record Architecture
GitNode enforces timestamped, record-partitioned storage:

```text
attendance/
└── 2026/
    └── 08/
        ├── att-ai2a-1787676182870.json
        ├── att-ai2a-1787676834004.json
        └── att-ai2a-1787676920110.json
```

Because every payload creates a unique file path (`attendance/YYYY/MM/att-${node}-${timestamp}.json`), concurrent writes do not collide on the same file SHA, enabling lock-free horizontal writes.

---

## 5. Maintenance & Student Governance Blueprint

To ensure the GitNode infrastructure outlives individual graduating student cohorts:

1. **Manifest Self-Documentation**: Each repository maintains `gitnode.yaml` declaring active maintainer GitHub usernames, supported schema versions, and peer links.
2. **Gradual Escalation Ladder**:
   - **Year 1 (User)**: Students use the web interface.
   - **Year 2 (Contributor)**: Students submit PRs for class notes and project showcases.
   - **Year 3 (Maintainer)**: Promoted to Class Representatives / Maintainers reviewing PRs.
   - **Year 4 (Architect)**: Manage Node Gateway infrastructure and mentor incoming batches.
