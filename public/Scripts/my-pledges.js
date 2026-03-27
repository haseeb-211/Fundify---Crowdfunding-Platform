const API = window.API_BASE;

let currentUser;
try {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
} catch {
  currentUser = null;
}
if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}


const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get("id");

const campaignInfoDiv = document.getElementById("campaignInfo");
const pledgesSection = document.getElementById("pledgesSection");

document.getElementById("backBtn").onclick = () => {
  window.location.href = "my-campign.html"; // adjust if needed
};


async function loadCampaign() {
  try {
    const res = await fetch(`${API}/campaigns/${encodeURIComponent(campaignId)}`);
    const campaign = await res.json();
    renderCampaignInfo(campaign);
  } catch (err) {
    console.error(err);
    campaignInfoDiv.innerHTML = "<p>Error loading campaign info.</p>";
  }
}

function renderCampaignInfo(c) {
  const raised = Number(c.raised) || 0;
  const goal = Number(c.goal) || 0;
  const percentage = Math.floor((raised / goal) * 100);

  campaignInfoDiv.innerHTML = `
    <h2>${c.title}</h2>
    <p><strong>Description:</strong> ${c.description || c.discription || ''}</p>
    <p><strong>Goal:</strong> $${goal}</p>
    <p><strong>Raised:</strong> $${raised} (${percentage}%)</p>
    <p><strong>Deadline:</strong> ${c.deadline}</p>
  `;
}


async function loadPledges() {
  try {
    const res = await fetch(`${API}/pledges?campaignId=${encodeURIComponent(campaignId)}`);
    const pledges = await res.json();

    if (!pledges.length) {
      pledgesSection.innerHTML = "<p>No pledges yet.</p>";
      return;
    }

    const total = pledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    pledgesSection.innerHTML = `
      <h3>Pledges</h3>
      <p>Total pledged: $${total}</p>
      <table>
        <thead>
          <tr>
            <th>Pledger User ID</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${pledges.map(p => `
            <tr>
              <td>${p.userId}</td>
              <td>$${Number(p.amount)}</td>
              <td>
                <button onclick="deletePledge('${p.id}', ${p.amount}, '${p.userId}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error(err);
    pledgesSection.innerHTML = "<p>Error loading pledges.</p>";
  }
}


async function deletePledge(id, amount, pledgeUserId) {

  if (String(pledgeUserId) !== String(currentUser.id)) {
    alert("Unauthorized: you can only delete your own pledges.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this pledge?");
  if (!confirmDelete) return;

  try {
    const deleteRes = await fetch(`${API}/pledges/${id}`, { method: "DELETE" });
    if (!deleteRes.ok) throw new Error(`Failed to delete pledge (${deleteRes.status})`);

    const campaignRes = await fetch(`${API}/campaigns/${encodeURIComponent(campaignId)}`);
    if (!campaignRes.ok) throw new Error(`Failed to fetch campaign (${campaignRes.status})`);
    const campaign = await campaignRes.json();
    const newRaised = Math.max(0, (Number(campaign.raised) || 0) - Number(amount));

    const patchRes = await fetch(`${API}/campaigns/${encodeURIComponent(campaignId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raised: newRaised }),
    });
    if (!patchRes.ok) throw new Error(`Failed to update campaign (${patchRes.status})`);

    alert("Pledge deleted successfully!");
    loadCampaign();
    loadPledges();
  } catch (err) {
    console.error(err);
    alert("Error deleting pledge.");
  }
}


loadCampaign();
loadPledges();