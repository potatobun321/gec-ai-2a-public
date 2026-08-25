# GitNode — Federated Repository Infrastructure Network

> **A student-built, zero-cost digital infrastructure paradigm built on Git & GitHub primitives.**

GitNode models an educational institution or collaborative network as a **federated graph of independent GitHub repositories**. Rather than relying on a centralized ERP database or expensive server licensing, GitNode uses Git commits, versioned JSON Schemas, YAML node manifests, static web frontends (GitHub Pages), and a thin Node.js gateway to create a secure, auditable, and decentralized data network.

---

## 🌟 High-Level Concept

```
+-----------------------------------------------------------------------------------+
|                        PUBLIC COMMONS LAYER (GitHub Pages)                        |
|   Repo: potatobun321/gec-ai-2a-public                                             |
|   URL:  https://potatobun321.github.io/gec-ai-2a-public/                         |
|   - Visual Web Interface & Interactive Console                                    |
|   - Open Notes, Projects, Events, and Public Pull Requests                        |
+-----------------------------------------------------------------------------------+
                                          |
                        HTTP REST API     |   Bearer Role Context
                                          v
+-----------------------------------------------------------------------------------+
|                        NODE.JS GATEWAY SERVICE (`server.js`)                      |
|   - Authenticates User Role Context against Private RBAC Rules                    |
|   - Validates incoming JSON payloads using JSON Schema contracts (`Ajv`)          |
|   - Computes SHA-256 cryptographic digest for data integrity                     |
|   - Dual-Writes to Git Private Repo & Optional MySQL Database                     |
+-----------------------------------------------------------------------------------+
                                          |
                   +----------------------+----------------------+
                   v                                             v
+------------------------------------+         +------------------------------------+
|  PRIMARY AUDIT LOG (Git Storage)   |         |  QUERY CACHE / LEGACY (MySQL)      |
|  Repo: potatobun321/gec-ai-2a-priv |         |  - Relational Queries & Table Joins|
|  - Immutable Version History       |         |  - Integration with College ERPs   |
+------------------------------------+         +------------------------------------+
```

---

## 📁 Repository Structure & Directory Map

```text
/home/kartikay/Projects/Gitnode/
├── README.md                           <-- Main Project Overview & Quickstart
├── index.html                          <-- High-Level Architectural Presentation Page
├── server.js                           <-- Gateway Server (Static Host + API Gateway)
├── github-live-sync.js                 <-- Automated GitHub Octokit API Sync Tool
├── deploy-pages.js                     <-- GitHub Pages Deployment Script
├── .env                                <-- Environment Secret Credentials (PAT)
├── .gitignore                          <-- Git Exclusion Rules
│
├── docs/                               <-- Comprehensive Architecture Blueprint Docs
│   ├── ARCHITECTURE_BLUEPRINT.md       <-- System Design & Security Boundaries
│   ├── HYBRID_MYSQL_MODEL.md           <-- MySQL Integration & Paper Compliance ("Kagazraaj")
│   ├── PROTOCOL_SPEC.md                <-- Manifest & JSON Schema Contracts
│   └── DEPLOYMENT_GUIDE.md             <-- GitHub Pages & Gateway Setup Guide
│
├── schemas/                            <-- Versioned JSON Schema Contracts
│   ├── gitnode-manifest.schema.json    <-- Manifest Validation Contract
│   └── message-v1.schema.json          <-- Payload Validation Contract
│
├── node-a/                             <-- Public Sender Node Prototype
│   ├── gitnode.yaml                    <-- Node A Identity Manifest
│   ├── payload.json                    <-- Valid Sample Payload
│   └── sender.js                       <-- Transmission Test Client
│
├── node-b/                             <-- Private Storage Receiver Node Prototype
│   ├── gitnode.yaml                    <-- Node B Identity Manifest
│   ├── rbac-rules.json                 <-- Access Control & User Permissions Matrix
│   ├── receiver.js                     <-- Standalone Receiver Node Server
│   └── storage/                        <-- Local Verified Storage Directory
│
└── public/                             <-- Web Console Frontend (GitHub Pages)
    ├── index.html                      <-- Visual Network Console UI
    ├── style.css                       <-- GitHub Dark Mode Styling System
    └── app.js                          <-- Role Switching & GitHub Sync Engine
```

---

## ⚡ Quickstart Guide

### 1. Run the Visual Gateway & Web Console Locally
```bash
node server.js
```
Open **`http://localhost:3000`** in your browser to access the visual testing console!

### 2. Run Inter-Node Transmission Test (Node A -> Node B)
In one terminal, start Node B listener:
```bash
node node-b/receiver.js
```
In another terminal, transmit a payload from Node A:
```bash
node node-a/sender.js
```

### 3. Deploy Frontend Updates to Live GitHub Pages Repo
```bash
node deploy-pages.js
```

---

## 📚 Complete Documentation Index

For deep architectural specifications and operational guides, consult the `docs/` directory:
- 📄 [README.md](file:///home/kartikay/Projects/Gitnode/README.md): Main Project Overview
- 🏛️ [docs/ARCHITECTURE_BLUEPRINT.md](file:///home/kartikay/Projects/Gitnode/docs/ARCHITECTURE_BLUEPRINT.md): Topology, security boundaries, RBAC engine, and institutional scale model.
- 📜 [docs/HYBRID_MYSQL_MODEL.md](file:///home/kartikay/Projects/Gitnode/docs/HYBRID_MYSQL_MODEL.md): MySQL dual-sync integration & paper compliance ("Kagazraaj") PDF report generator blueprint.
- 📐 [docs/PROTOCOL_SPEC.md](file:///home/kartikay/Projects/Gitnode/docs/PROTOCOL_SPEC.md): `gitnode.yaml` specification, JSON schema rules, and REST API specification.
- 🚀 [docs/DEPLOYMENT_GUIDE.md](file:///home/kartikay/Projects/Gitnode/docs/DEPLOYMENT_GUIDE.md): Complete setup guide for GitHub Pages, PAT authentication, and Node.js gateway hosting.
