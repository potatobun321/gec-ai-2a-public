# GitNode Hybrid Architecture: MySQL Integration & Paper Compliance Blueprint

> **Document Version**: `1.0.0`  
> **Target Audience**: Institutional Administrators, HODs, & College IT Departments  
> **Key Problem Solved**: Bridging digital automation with official physical paper compliance ("Kagazraaj").

---

## 1. The Institutional Reality & The "Kagazraaj" Problem

In educational administration across India (RTU, VTU, AKTU, autonomous colleges), official university audit compliance requires **physical paper records with signatures** (monthly attendance registers, HOD approvals, exam eligibility lists).

Attempting to force administration to eliminate paper overnight fails because accreditation bodies (NAAC, NBA, University Auditors) demand physical documentation.

### The GitNode Solution: Paper as a Generated Output
In GitNode:
- **Daily Operations (Digital)**: Teachers & students use the web interface. No manual calculation of percentage totals by hand.
- **End-of-Month Compliance (Physical)**: GitNode aggregates daily JSON commit logs and automatically generates **official, standardized PDF registers** ready for HOD signature and printing.
- **Result**: **90% reduction in paper usage** (only monthly summaries printed), **100% reduction in manual calculation errors**, and total compliance with university paper audits.

---

## 2. Hybrid System Architecture (Git + MySQL Dual-Sync)

To support legacy college software and fast SQL querying alongside Git's cryptographic audit logs, GitNode supports a **Hybrid Dual-Sync Architecture**:

```
+-----------------------------------------------------------------------------------+
|                        VISUAL WEB INTERFACE (GitHub Pages)                        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        NODE.JS GATEWAY SERVICE (`server.js`)                      |
|   - Authenticates User Role Context against Private RBAC Rules                    |
|   - Validates incoming JSON payloads using JSON Schema contracts                  |
+-----------------------------------------------------------------------------------+
                                          |
                   +----------------------+----------------------+
                   | Dual-Write Handler                          |
                   v                                             v
+------------------------------------+         +------------------------------------+
|  PRIMARY AUDIT LOG (Git Repo)      |         |  QUERY CACHE / LEGACY (MySQL)      |
|  - Immutable Version History       |         |  - Fast SQL Queries & Join Tables  |
|  - Cryptographic SHA-256 Hashes    |         |  - Integration with Legacy ERPs    |
|  - `attendance/YYYY/MM/*.json`     |         |  - Table: `attendance_records`     |
+------------------------------------+         +------------------------------------+
                   |                                             |
                   +----------------------+----------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|               MONTHLY COMPLIANCE REPORT GENERATOR (PDF / XLSX / CSV)              |
|   - Aggregates daily records for the month                                       |
|   - Calculates total classes held & student percentage thresholds                 |
|   - Generates official printable PDF registers for HOD signature & physical print |
+-----------------------------------------------------------------------------------+
```

---

## 3. MySQL Database Schema Specification

If MySQL / MariaDB is connected as a relational cache, GitNode uses the following dual-write table structure:

```sql
-- Student Roster Table
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  class_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Master Summary Table
CREATE TABLE IF NOT EXISTS attendance_batches (
  payload_id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(32) NOT NULL,
  subject VARCHAR(64) NOT NULL,
  period INT NOT NULL,
  teacher_id VARCHAR(32) NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  github_commit_sha VARCHAR(64),
  timestamp TIMESTAMP NOT NULL
);

-- Detailed Attendance Status Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payload_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(32) NOT NULL,
  status ENUM('PRESENT', 'ABSENT', 'EXCUSED') NOT NULL,
  FOREIGN KEY (payload_id) REFERENCES attendance_batches(payload_id) ON DELETE CASCADE
);
```

---

## 4. End-of-Month Workflow & Data Lifecycle

```text
Day 1 - Day 30:   Teachers & Students use Web Interface
                  └─► Daily JSON files committed to Git Storage Node
                  └─► Records indexed into MySQL relational cache

End of Month:     Automated Compliance Batch Job Triggered
                  └─► Aggregates all JSON / MySQL records for Month
                  └─► Generates `attendance-report-august-2026.pdf`
                  └─► Generates `attendance-report-august-2026.xlsx`

Official Action:  HOD inspects summary -> Prints 2-page PDF -> Signs physical paper
                  └─► Physical paper filed in official college registry
                  └─► Raw digital logs archived safely in Git repository
```

---

## 5. Why Administration Accepts This Proposal

When proposing GitNode to college leadership, present these 4 key points:

1. **Zero Change to Official Audit Procedures**: HODs and Principals still sign physical monthly attendance papers as required by university rules.
2. **Elimination of Human Calculation Errors**: Percentages and short-attendance condonation lists are calculated automatically with 100% mathematical accuracy.
3. **Immediate Compatibility with Existing MySQL ERPs**: Plugs directly into any existing college database via dual-write.
4. **Massive Cost & Paper Savings**: Eliminates daily paper register purchases and manual data entry workloads.
