const API = window.API_BASE;
const escapeHtml = window.escapeHtml;
const currentUser = window.getCurrentUser?.();

if (!currentUser || !currentUser.isAdmin) {
  alert("Access denied");
  window.location.href = "login.html";
}
// back btn
document.getElementById("backBtn").onclick = () => { 
  window.location.href = "index.html";
};

// Tabs
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
}

// Load all data
async function loadData() {
  await loadUsers();
  await loadCampaigns();
  await loadPledges();

  showTab("users");
}

// ================= USERS =================
async function loadUsers() {
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  const container = document.getElementById("users");

  container.innerHTML = `
  <h2>Users</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
    ${users.map(user => `
      <tr>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${user.isActive !== false ? "Active" : "Banned"}</td>
        <td>
          ${user.isAdmin === true
            ? 'Admin'
            : `<button class="action ban" onclick="banUser('${escapeHtml(user.id)}', ${user.isActive})">
                 ${user.isActive !== false ? "Ban" : "Unban"}
               </button>`}
        </td>
      </tr>
    `).join("")}
  </table>
`;
}

// Ban / Unban user
async function banUser(id) {
  const res = await fetch(`${API}/users/${id}`);
  const user = await res.json();
  const newStatus = user.isActive === false ? true : false;

  await fetch(`${API}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: newStatus })
  });
  loadUsers();
}

// ================= CAMPAIGNS =================
async function loadCampaigns() {
  const res = await fetch(`${API}/campaigns`);
  const campaigns = await res.json();
  const container = document.getElementById("campaigns");

  container.innerHTML = `
    <h2>Campaigns</h2>
    <table>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      ${campaigns.map(c => `
        <tr>
          <td>${escapeHtml(c.title)}</td>
          <td>${c.isApproved ? "Approved" : "Pending"}</td>
          <td>
          <button class="action approve" onclick="approve('${escapeHtml(c.id)}')">Approve</button>
          <button class="action reject" onclick="reject('${escapeHtml(c.id)}')">Reject</button>
          <button class="action delete" onclick="deleteCampaign('${escapeHtml(c.id)}')">Delete</button>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}


async function approve(id) {
  await fetch(`${API}/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isApproved: true })
  });

  loadCampaigns();
}


async function reject(id) {
  await fetch(`${API}/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isApproved: false })
  });

  loadCampaigns();
}


async function deleteCampaign(id) {
  if (!confirm("Delete this campaign?")) return;

  await fetch(`${API}/campaigns/${id}`, {
    method: "DELETE"
  });

  loadCampaigns();
}

// ================= PLEDGES =================
async function loadPledges() {
  const res = await fetch(`${API}/pledges`);
  const pledges = await res.json();

  const container = document.getElementById("pledges");

  container.innerHTML = `
    <h2>Pledges</h2>
    <table>
      <tr>
        <th>User ID</th>
        <th>Campaign ID</th>
        <th>Amount</th>
        <th>Action</th>
      </tr>
      ${pledges.map(p => `
        <tr>
          <td>${escapeHtml(p.userId)}</td>
          <td>${escapeHtml(p.campaignId)}</td>
          <td>$${p.amount}</td>
          <td>
            <button class="action delete" onclick="deletePledge('${escapeHtml(p.id)}')">Delete</button>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}
async function deletePledge(id) {
  const confirmDelete = confirm("Are you sure you want to delete this pledge?");
  if (!confirmDelete) return;

  try {
   
    const pledgeRes = await fetch(`${API}/pledges/${id}`);
    const pledge = await pledgeRes.json();

    if (!pledge) {
      alert("Pledge not found");
      return;
    }

    const campaignId = pledge.campaignId;
    const amount = Number(pledge.amount || 0);


    await fetch(`${API}/pledges/${id}`, { method: "DELETE" });
    alert("Pledge deleted");


    const campaignRes = await fetch(`${API}/campaigns/${campaignId}`);
    const campaign = await campaignRes.json();

    if (!campaign) {
      console.warn("Campaign not found for this pledge");
      return;
    }

    const newRaised = Math.max(0, Number(campaign.raised || 0) - amount);

    await fetch(`${API}/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raised: newRaised })
    });

    
    loadPledges();
    loadCampaigns(); 

  } catch (err) {
    console.error("Error deleting pledge:", err);
    alert("Could not delete pledge");
  }
}

// Init
loadData();