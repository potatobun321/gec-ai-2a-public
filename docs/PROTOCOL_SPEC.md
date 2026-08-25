# GitNode Protocol & Schema Specification

> **Specification Version**: `1.0.0`  
> **Protocol Namespace**: `gitnode-transmission-v1`

This document defines the formal data contracts, YAML manifests, JSON Schemas, and REST API interfaces used across the GitNode network.

---

## 1. Node Manifest Specification (`gitnode.yaml`)

Every repository in a GitNode network MUST place a `gitnode.yaml` manifest at the repository root.

```yaml
version: "1.0"

node:
  id: "gec-ai-2a-public"                 # Unique Node Identifier
  name: "GEC Jaipur AI 2A Public Node"  # Human readable node name
  type: "public_sender"                  # public_sender | private_storage | central_archive
  repo: "potatobun321/gec-ai-2a-public"  # Target GitHub Repository (owner/repo)

capabilities:
  - transmit_records
  - query_status

target_peer:
  id: "gec-jaipur-private-storage"
  endpoint: "http://localhost:3000/api/node-b/receive"

protocols:
  supported:
    - name: "gitnode-transmission-v1"
      schema: "schemas/message-v1.schema.json"
```

---

## 2. Transmission Payload Schema Contract (`message-v1.schema.json`)

All payloads transmitted across node boundaries MUST validate against the `message-v1` JSON Schema contract.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GitNodeTransmissionV1",
  "type": "object",
  "required": ["protocol", "sender_node", "target_node", "payload_id", "timestamp", "data"],
  "additionalProperties": false,
  "properties": {
    "protocol": {
      "type": "string",
      "const": "gitnode-transmission-v1"
    },
    "sender_node": {
      "type": "string",
      "minLength": 3
    },
    "target_node": {
      "type": "string",
      "minLength": 3
    },
    "payload_id": {
      "type": "string",
      "minLength": 5
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "data": {
      "type": "object",
      "required": ["type", "records"],
      "properties": {
        "type": { "type": "string" },
        "class_id": { "type": "string" },
        "subject": { "type": "string" },
        "period": { "type": "integer" },
        "records": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["student_id", "status"],
            "properties": {
              "student_id": { "type": "string" },
              "name": { "type": "string" },
              "status": { "type": "string", "enum": ["PRESENT", "ABSENT", "EXCUSED"] }
            }
          }
        }
      }
    }
  }
}
```

---

## 3. Node.js Gateway REST API Reference

### A. `GET /api/rbac/roles`
Returns active role definitions and sample user permissions from the private repository.

#### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "rbac": {
    "roles": {
      "TEACHER": {
        "name": "Faculty Teacher",
        "allowed_actions": ["read_public", "view_timetable", "mark_attendance", "submit_record"]
      },
      "STUDENT": {
        "name": "Student",
        "allowed_actions": ["read_public", "view_own_records", "propose_pr"]
      }
    }
  }
}
```

---

### B. `POST /api/transmit`
Evaluates user role authority, validates payload schema, and executes a live GitHub commit.

#### Request Body
```json
{
  "user_id": "FAC-017",
  "role": "TEACHER",
  "payload": {
    "protocol": "gitnode-transmission-v1",
    "sender_node": "gec-ai-2a-public",
    "target_node": "gec-jaipur-private-storage",
    "payload_id": "att-ai2a-1787676834004",
    "timestamp": "2026-08-25T16:53:45.000Z",
    "data": {
      "type": "attendance_batch",
      "class_id": "AI-2A",
      "subject": "DSA",
      "period": 2,
      "records": [
        { "student_id": "STU-101", "name": "Rahul Sharma", "status": "PRESENT" }
      ]
    }
  }
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "Payload passed RBAC security check & JSON Schema validation. Successfully committed to GitHub network!",
  "receipt": {
    "receipt_id": "rcpt-1787676834005",
    "status": "VERIFIED_AND_COMMITTED",
    "user_id": "FAC-017",
    "user_role": "TEACHER",
    "sha256_hash": "8baf37f163f4709b0a126d2b0b74b1f49da128e8c94694a713b81403cab6e8c7",
    "github_repo": "potatobun321/gec-ai-2a-private",
    "github_file_path": "attendance/2026/08/att-ai2a-1787676834004.json",
    "github_commit_sha": "7fd987f7b86f3277db3565f130a2bf5b155a7c39",
    "github_commit_url": "https://github.com/potatobun321/gec-ai-2a-private/commit/7fd987f7b86f3277db3565f130a2bf5b155a7c39"
  }
}
```

#### RBAC Error Response (`HTTP 403 Forbidden`)
```json
{
  "success": false,
  "error": "RBAC_PERMISSION_DENIED",
  "message": "Role 'Student' (STUDENT) does not have permission to submit official records. Allowed actions: [read_public, view_own_records, propose_pr]"
}
```
