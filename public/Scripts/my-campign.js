const API = window.API_BASE;
const escapeHtml = window.escapeHtml;
const currentUser = JSON.parse(localStorage.getItem("currentUser"));


if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

/// back btn
document.getElementById("backBtn").onclick = () => {
    window.location.href = "index.html";
};


async function loadMyCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns?creatorId=${encodeURIComponent(currentUser.id)}`);
    const campaigns = await res.json();
    renderCampaigns(campaigns);
  } catch (err) {
    console.error("Error loading campaigns:", err);
  }
}


function renderCampaigns(campaigns) {
  const container = document.getElementById("campaignList");
  container.innerHTML = "";

  campaigns.forEach(c => {
    const card = document.createElement("div");
    card.classList.add("campaign-card");

    const eid = escapeHtml(c.id);
    card.innerHTML = `
      <img src="${escapeHtml(c.img || '')}" id="img-${eid}" alt="Campaign Image"/>
      <input type="text" id="title-${eid}" value="${escapeHtml(c.title ?? '')}" placeholder="Title"/>
      <textarea id="desc-${eid}" placeholder="Description">${escapeHtml(c.description ?? '')}</textarea>
      <input type="number" id="goal-${eid}" value="${c.goal}" placeholder="Goal"/>
      <input type="date" id="deadline-${eid}" value="${c.deadline}"/>
      <input type="file" id="file-${eid}"/>
      <button onclick="updateCampaign('${eid}')">Update Campaign</button>
      <div class="status-msg" id="status-${eid}"></div>
      <button class="view-btn" onclick="viewCampaign('${eid}')">View Campaign</button>
    `;

    const fileInput = card.querySelector(`#file-${c.id}`);
    const imgPreview = card.querySelector(`#img-${c.id}`);
    fileInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => { imgPreview.src = ev.target.result; };
        reader.readAsDataURL(file);
      }
    });

    container.appendChild(card);
  });
}


async function updateCampaign(id) {
  const status = document.getElementById(`status-${id}`);
  status.textContent = "Updating...";

  const title = document.getElementById(`title-${id}`).value.trim();
  const description = document.getElementById(`desc-${id}`).value.trim();
  const goal = Number(document.getElementById(`goal-${id}`).value);
  const deadline = document.getElementById(`deadline-${id}`).value;
  const file = document.getElementById(`file-${id}`).files[0];

  let imgData = document.getElementById(`img-${id}`).src; // keep current image


  if (file) {
    imgData = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  const updates = { title, description, goal, deadline, img: imgData };

  try {
    const res = await fetch(`${API}/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error("Failed to update campaign");

    status.textContent = "Campaign updated successfully ";
  } catch (err) {
    console.error(err);
    status.textContent = "Error updating campaign ";
  }
}
function viewCampaign(campaignId) {
  
  window.location.href = `my-pledges.html?id=${encodeURIComponent(campaignId)}`;
}

loadMyCampaigns();