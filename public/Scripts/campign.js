const container = document.getElementById("campaignDetails");
const getCampaignDescription = window.getCampaignDescription;
const safeNumber = window.safeNumber;

let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
} catch (e) {
  currentUser = null;
}
if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}


const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");


async function loadCampaignPledges(campaignId) {
  const section = document.getElementById("pledgesSection");
  if (!section) return;

  try {
    const [pledgesRes, usersRes] = await Promise.all([
      fetch(`${window.API_BASE}/pledges?campaignId=${campaignId}`),
      fetch(`${window.API_BASE}/users`),
    ]);

    if (!pledgesRes.ok) throw new Error(`Failed to load pledges (${pledgesRes.status})`);
    if (!usersRes.ok) throw new Error(`Failed to load users (${usersRes.status})`);

    const pledges = await pledgesRes.json();
    const users = await usersRes.json();

    const userMap = Object.fromEntries(users.map((u) => [String(u.id), u.name || "Anonymous"]));

    if (!pledges.length) {
      section.innerHTML = `
        <h3 class="pledges-title">Pledges</h3>
        <p class="no-pledges">No pledges yet. Be the first to donate!</p>
      `;
      return;
    }

    const rows = pledges
      .map(
        (p) => `
        <div class="pledge-item">
          <span class="pledge-donor">${userMap[String(p.userId)] ?? "Anonymous"}</span>
          <span class="pledge-amount">$${safeNumber(p.amount, 0)}</span>
        </div>`
      )
      .join("");

    section.innerHTML = `
      <h3 class="pledges-title">Pledges (${pledges.length})</h3>
      <div class="pledges-list">${rows}</div>
    `;
  } catch (err) {
    console.error("Error loading pledges:", err);
    if (section) {
      section.innerHTML = `<p class="pledges-error">Could not load pledges. Please try again later.</p>`;
    }
  }
}

//Fetch campaign
async function loadCampaign() {
  try {
    const res = await fetch(`${window.API_BASE}/campaigns/${campaignId}`);
    const campaign = await res.json();

    renderCampaign(campaign);
    await loadCampaignPledges(campaignId);
  } catch (err) {
    console.error("Error loading campaign:", err);
  }
}



//Render UI
function renderCampaign(campaign) {
  const raised = safeNumber(campaign.raised, 0);
  const goal = safeNumber(campaign.goal, 0);
  const percentage = goal > 0 ? Math.floor((raised / goal) * 100) : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const remaining = goal > 0 ? Math.max(0, goal - raised) : 0;

  container.innerHTML = `
    <img src="${campaign.img}" class="campaign-img">

    <div class="content">
      <h1>${campaign.title}</h1>
      <p class="description">${getCampaignDescription(campaign)}</p>

      <div class="progress-bar">
        <div class="progress" style="width:${clampedPercentage}% !important" data-percent="${clampedPercentage}"></div>
      </div>

      <div class="stats">
        <span>${clampedPercentage}% funded</span>
        <span>$${raised} / $${goal}</span>
        <span>👥 ${campaign.donors} donors</span>
      </div>

      <div class="donate-box">
        <input
          type="number"
          id="donationAmount"
          placeholder="Enter amount"
          min="1"
          step="1"
          ${goal > 0 ? `max="${remaining}"` : ""}
          ${goal > 0 && remaining <= 0 ? "disabled" : ""}
        >
        <button
          class="donate-btn"
          onclick="donate('${campaign.id}')"
          ${goal > 0 && remaining <= 0 ? "disabled style='background:#999; cursor:not-allowed;'" : ""}
        >
          Donate
        </button>
      </div>
      <p style="margin-top: 12px; color:#555;">
        ${goal > 0 ? `Remaining to goal: $${remaining}` : "Goal not set (donate any amount)."}
      </p>
    </div>
    <div class="pledges" id="pledgesSection"></div>
  `;
}

//Donation
async function donate(id) {
  const amountInput = document.getElementById("donationAmount");
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  try {
    const resLatest = await fetch(`${window.API_BASE}/campaigns/${id}`);
    const latest = await resLatest.json();

    const raised = safeNumber(latest.raised, 0);
    const donors = safeNumber(latest.donors, 0);
    const targetGoal = safeNumber(latest.goal, 0);
    const remaining = targetGoal > 0 ? Math.max(0, targetGoal - raised) : 0;

    if (targetGoal > 0 && remaining <= 0) {
      alert(
        "This campaign has already reached its goal! Thank you for your support.",
      );
      return;
    }

    if (targetGoal > 0 && amount > remaining) {
      alert(`You can only donate up to $${remaining} to finish this campaign.`);
      return;
    }

    const pledgeRes = await fetch(`${window.API_BASE}/pledges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        campaignId: id,
        userId: currentUser.id,
      }),
    });

    if (!pledgeRes.ok) {
      const details = await pledgeRes.text().catch(() => "");
      throw new Error(details ? `Failed to create pledge: ${details}` : "Failed to create pledge");
    }

    const newRaised = targetGoal > 0 ? Math.min(targetGoal, raised + amount) : raised + amount;
    const updatedData = { raised: newRaised, donors: donors + 1 };

    const res = await fetch(`${window.API_BASE}/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      alert("Donation successful 🎉");
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadCampaign();
    }
  } catch (err) {
    console.error("Donation error:", err);
  }
}

loadCampaign();
