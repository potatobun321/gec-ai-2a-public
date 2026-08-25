document.addEventListener('DOMContentLoaded', () => {
  const roleSelect = document.getElementById('roleSelect');
  const payloadForm = document.getElementById('payloadForm');
  const corruptBtn = document.getElementById('corruptBtn');
  const terminalScreen = document.getElementById('terminalScreen');
  const receiptCard = document.getElementById('receiptCard');
  const statusBadge = document.getElementById('statusBadge');

  const stepRbac = document.getElementById('stepRbac');
  const stepSchema = document.getElementById('stepSchema');
  const stepDigest = document.getElementById('stepDigest');
  const stepGitHub = document.getElementById('stepGitHub');

  function log(msg, type = 'info') {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${msg}`;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function resetSteps() {
    [stepRbac, stepSchema, stepDigest, stepGitHub].forEach(s => {
      s.className = 'step-box';
    });
    receiptCard.classList.add('hidden');
    statusBadge.textContent = 'READY';
    statusBadge.className = 'tag-badge green';
  }

  roleSelect.addEventListener('change', () => {
    const [userId, role] = roleSelect.value.split('|');
    log(`User context switched to User: '${userId}', Role: '${role}'`, 'warning');
  });

  // Handle Form Submission
  payloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleTransmission(false);
  });

  // Handle Corrupt Payload Test
  corruptBtn.addEventListener('click', async () => {
    await handleTransmission(true);
  });

  async function handleTransmission(simulateError) {
    resetSteps();
    const [userId, role] = roleSelect.value.split('|');
    
    log(`Initiating GitNode Network Transmission...`, 'info');
    log(`Selected Context: User='${userId}', Role='${role}'`, 'info');

    // Build Payload
    const classId = document.getElementById('classIdInput').value;
    const subject = document.getElementById('subjectInput').value;
    const period = parseInt(document.getElementById('periodInput').value) || 1;

    const checkboxes = document.querySelectorAll('.roster-list input[type="checkbox"]');
    const records = Array.from(checkboxes).map(cb => ({
      student_id: cb.dataset.stuid,
      name: cb.dataset.stuname,
      status: cb.checked ? 'PRESENT' : 'ABSENT'
    }));

    let payload = {
      protocol: "gitnode-transmission-v1",
      sender_node: "gec-ai-2a-public",
      target_node: "gec-jaipur-private-storage",
      payload_id: `att-${classId.toLowerCase()}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: {
        type: "attendance_batch",
        class_id: classId,
        subject: subject,
        period: period,
        records: records
      }
    };

    if (simulateError) {
      log(`⚠️ Simulating Schema Corruption (removing required 'protocol' and 'timestamp' fields)...`, 'warning');
      delete payload.protocol;
      delete payload.timestamp;
      delete payload.target_node;
      payload.data.records = "invalid_string_instead_of_array";
    }

    // Step 1: RBAC Check Animation
    stepRbac.classList.add('active');
    log(`[Step 1] Checking RBAC Permissions against private rbac-rules.json...`, 'info');
    await new Promise(r => setTimeout(r, 400));

    try {
      const res = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: role, payload: payload })
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          stepRbac.className = 'step-box failed';
          statusBadge.textContent = 'RBAC DENIED';
          statusBadge.className = 'tag-badge red';
          log(`[Step 1 REJECTED] HTTP 403 Forbidden: ${result.error}`, 'error');
          log(`[RBAC Failure] ${result.message}`, 'error');
          return;
        }

        stepRbac.className = 'step-box success';
        stepSchema.className = 'step-box failed';
        statusBadge.textContent = 'SCHEMA ERROR';
        statusBadge.className = 'tag-badge red';
        log(`[Step 1 PASSED] RBAC Permission granted for role '${role}'.`, 'success');
        log(`[Step 2 REJECTED] HTTP 400 Schema Validation Failed!`, 'error');
        if (result.details) {
          result.details.forEach(err => log(`  ↳ Error: ${err}`, 'error'));
        }
        return;
      }

      // Step 1 & 2 Passed
      stepRbac.className = 'step-box success';
      log(`[Step 1 PASSED] RBAC Authority confirmed for user '${userId}' (${role}).`, 'success');

      stepSchema.classList.add('active');
      await new Promise(r => setTimeout(r, 300));
      stepSchema.className = 'step-box success';
      log(`[Step 2 PASSED] JSON Payload validated against message-v1.schema.json.`, 'success');

      // Step 3: Digest Computation
      stepDigest.classList.add('active');
      await new Promise(r => setTimeout(r, 300));
      stepDigest.className = 'step-box success';
      log(`[Step 3 PASSED] SHA-256 Digest calculated: ${result.receipt.sha256_hash.substring(0, 16)}...`, 'success');

      // Step 4: Live GitHub Commit
      stepGitHub.classList.add('active');
      await new Promise(r => setTimeout(r, 400));
      stepGitHub.className = 'step-box success';
      log(`[Step 4 PASSED] Data record committed live to GitHub: ${result.receipt.github_repo}`, 'success');
      log(`[GitHub Commit URL] ${result.receipt.github_commit_url}`, 'warning');

      statusBadge.textContent = 'SUCCESS';
      statusBadge.className = 'tag-badge green';

      // Display Receipt Card
      document.getElementById('rcptStatus').textContent = result.receipt.status;
      document.getElementById('rcptId').textContent = result.receipt.receipt_id;
      document.getElementById('rcptUser').textContent = `${userId} (${role})`;
      document.getElementById('rcptHash').textContent = result.receipt.sha256_hash;
      const ghBtn = document.getElementById('rcptGithubUrl');
      ghBtn.href = result.receipt.github_commit_url;
      receiptCard.classList.remove('hidden');

    } catch (err) {
      log(`Network error: ${err.message}`, 'error');
    }
  }
});
