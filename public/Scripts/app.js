//// navbar ////
const toggleBtn = document.getElementById("toggleBtn");
const navLinks = document.getElementById("navLinks");
toggleBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
const getCurrentUser = window.getCurrentUser;
const getCampaignDescription = window.getCampaignDescription;
const safeNumber = window.safeNumber;

const container = document.getElementById("camp-cont");
const searchInput = document.getElementById("searchInput");
const viewAllBtn = document.getElementById("viewAllBtn");

let campaigns = [];
let showAll = false; 
// Fetch campaigns
async function fetchCampaigns() {
  try {
    container.innerHTML =
      "<p style='color:#666; text-align:center;'>Loading campaigns...</p>";
    campaigns = await window.fetchJson("/campaigns?isApproved=true");

    renderCampaigns();
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    container.innerHTML =
      "<p style='color:#b00020; text-align:center;'>Failed to load campaigns.</p>";
  }
}

function campaignCardHTML(campaign) {
  const goal = safeNumber(campaign.goal, 0);
  const raised = safeNumber(campaign.raised, 0);
  const donors = safeNumber(campaign.donors, 0);

  const percentage = goal > 0 ? Math.floor((raised / goal) * 100) : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const desc = getCampaignDescription(campaign);

  return `
    <div class="campaign-card">
      <img src="${campaign.img}" class="campaign-img">
      <div class="card-content">
        <h3>${campaign.title ?? ""}</h3>
        <p>${desc}</p>

        <div class="progress-bar">
          <div class="progress" style="width:${clampedPercentage}%"></div>
        </div>

        <div class="campaign-stats">
          <span class="percentage">${clampedPercentage}%</span>
          <span class="deadline">Deadline: ${campaign.deadline ?? ""}</span>
          <span>$${raised} / $${goal}</span>
        </div>

        <div class="donors">👥 ${donors} donors</div>

        <div class="card-buttons">
          <button class="view-btn" data-id="${campaign.id}">Donate</button>
        </div>
      </div>
    </div>
  `;
}

function renderCampaignList(list) {
  container.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML =
      "<p style='color:#555; text-align:center;'>No campaigns found.</p>";
    return;
  }
  list.forEach((campaign) => {
    container.insertAdjacentHTML("beforeend", campaignCardHTML(campaign));
  });
}

// Render campaigns
function renderCampaigns() {
  let filtered = campaigns.filter((c) => c.isApproved);

  if (!showAll) {
    filtered = filtered.slice(0, 3); 
  }

  renderCampaignList(filtered);
}

// Search
searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim();

 
  clearTimeout(window.SearchTimeout);
  window.SearchTimeout = setTimeout(async () => {
    try {
      if (!value) {
        await fetchCampaigns();
        return;
      }

    const data = await window.fetchJson(`/campaigns?isApproved=true`);
    const query = value.toLowerCase();

    campaigns = data.filter(c =>
      c.title?.toLowerCase().includes(query) ?? false
    );
      renderCampaigns();
    } catch (err) {
      console.error("Error searching campaigns:", err);
    }
  }, 250);
});

// View All toggle
viewAllBtn.addEventListener("click", () => {
  showAll = !showAll;

  viewAllBtn.textContent = showAll
    ? "Show Featured Only"
    : "View All Campaigns";

  renderCampaigns();
});
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-btn")) {

    const campaignId = e.target.getAttribute("data-id");

    const currentUser = getCurrentUser?.();

    if (currentUser) {
    
      window.location.href = `campign.html?id=${campaignId}`;
    } else {
      
      window.location.href = "login.html";
    }
  }
});
// Initial load
fetchCampaigns();
//// scroll up btn
const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const authButtons = document.getElementById("authButtons");
const userPanel = document.getElementById("userPanel");
const userNameSpan = document.getElementById("userName");
const dashboardLink = document.getElementById("dashboardLink");
const logoutBtn = document.getElementById("logoutBtn");


const currentUser = getCurrentUser?.();

if (currentUser) {
 
  authButtons.style.display = "none";


  userPanel.style.display = "flex"; 
  userNameSpan.textContent = `Welcome, ${currentUser.name}`;

  if(currentUser.isAdmin === true) {
      dashboardLink.style.display = "block";
  }
}

// Logout functionality
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser"); 
  window.location.href = "index.html";
});
