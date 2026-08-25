# GitNode Deployment & Operations Guide

> **Document Version**: `1.0.0`  
> **Target Environment**: GitHub Pages + Node.js Gateway + GitHub Private Repositories

This guide provides end-to-end instructions for deploying a complete GitNode network.

---

## 1. Prerequisites

- **GitHub Account**: Active account (e.g. `@potatobun321`).
- **Node.js**: Version `18.x` or higher (`/usr/bin/node -v`).
- **GitHub Fine-Grained Personal Access Token (PAT)**:
  - Permissions: `Contents: Read & write` on targeted public & private repositories.

---

## 2. Step 1: Create GitHub Repositories

On [GitHub.com](https://github.com/new), create two repositories:

1. **`gec-ai-2a-public`**
   - Visibility: **Public**
   - Purpose: Hosts GitHub Pages website, `gitnode.yaml` manifest, and JSON Schemas.
2. **`gec-ai-2a-private`**
   - Visibility: **Private**
   - Purpose: Stores `rbac-rules.json` access control lists and verified JSON data records (`attendance/YYYY/MM/*.json`).

---

## 3. Step 2: Configure Local Environment Secrets

Create a `.env` file in the root directory:

```env
GITHUB_TOKEN=github_pat_YOUR_FINE_GRAINED_TOKEN_HERE
GITHUB_OWNER=potatobun321
PUBLIC_REPO=gec-ai-2a-public
PRIVATE_REPO=gec-ai-2a-private
PORT=3000
```

> ⚠️ **CRITICAL SECURITY NOTE**: Ensure `.env` is listed inside `.gitignore` so tokens are never pushed to public repositories.

---

## 4. Step 3: Deploy Frontend to GitHub Pages

Run the automated deployment script to sync all visual console frontend files (`index.html`, `style.css`, `app.js`, `gitnode.yaml`) to the public repo:

```bash
node deploy-pages.js
```

### Enable GitHub Pages in Web Browser
1. Open **`https://github.com/potatobun321/gec-ai-2a-public/settings/pages`**.
2. Under **Source**: Select **`Deploy from a branch`**.
3. Under **Branch**: Select **`main`** and **`/ (root)`**, then click **Save**.
4. Your website will be live within 2 minutes at:  
   👉 **`https://potatobun321.github.io/gec-ai-2a-public/`**

---

## 5. Step 4: Host the Node.js Gateway Service

### Option A: Local Testing & Development Server
Run locally on your machine:
```bash
node server.js
```
The gateway server listens on `http://localhost:3000`.

### Option B: Free Cloud Hosting (Render / Railway / Vercel)
To make the Node.js Gateway accessible to remote users:
1. Push `server.js` and `package.json` to a backend repository.
2. Deploy to **Render.com** (Web Service) or **Railway.app**.
3. Set Environment Variable `GITHUB_TOKEN` in the cloud dashboard.
4. Update `app.js` API endpoint to your cloud gateway URL (`https://your-gateway.onrender.com/api/transmit`).

---

## 6. Security Maintenance & Secret Rotation

- **Token Expiration**: Fine-grained PAT tokens expire periodically. When renewing, update `GITHUB_TOKEN` in `.env` or your cloud dashboard.
- **Revoking Tokens**: If a PAT is compromised, immediately revoke it at [GitHub Token Settings](https://github.com/settings/tokens).
- **Updating RBAC Rules**: Edit `node-b/rbac-rules.json` and push to the private storage repo to update institutional role permissions instantly.
