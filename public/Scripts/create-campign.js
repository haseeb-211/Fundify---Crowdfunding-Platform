const API = window.API_BASE;
const getCampaignDescription = window.getCampaignDescription;
const safeNumber = window.safeNumber;
const currentUser = JSON.parse(localStorage.getItem("currentUser"));


if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}
// back btn
document.getElementById("backBtn").onclick = () => {
  window.location.href = "index.html";
};

const createBtn = document.getElementById("createBtn");
const createFormStatus = document.getElementById("createFormStatus");
const imageInput = document.getElementById("image");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const goalInput = document.getElementById("goal");
const deadlineInput = document.getElementById("deadline");
const today = new Date().toISOString().split("T")[0];

function updateCreateButtonState() {
  const titleOk = titleInput.value.trim().length > 0;
  const descOk = descriptionInput.value.trim().length > 0;
  const goalOk = goalInput.value !== "" && Number(goalInput.value) > 0;
  const deadlineOk = deadlineInput.value !== "";
  createBtn.disabled = !(titleOk && descOk && goalOk && deadlineOk);
}

const inputs = [titleInput, descriptionInput, goalInput, deadlineInput];
const events = ["input", "change"];

inputs.forEach(input => {
  events.forEach(evt => {
    input.addEventListener(evt, updateCreateButtonState);
  });
});
deadlineInput.setAttribute("min", today);
deadlineInput.addEventListener("change", () => {
  const selectedDate = new Date(deadlineInput.value);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert("You cannot select a past date!");
    deadlineInput.value = "";
  }
});

updateCreateButtonState();

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("imagePreview");
    if (img) {
      img.src = String(reader.result || "");
      img.style.display = "block";
    }
  };
  reader.readAsDataURL(file);
});

async function createCampaign() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const goal = document.getElementById("goal").value;
  const deadline = document.getElementById("deadline").value;
  const file = document.getElementById("image").files[0];

  if (!title || !description || !goal || !deadline) {
    return alert("Please fill all fields");
  }

 
  let imgData = "";
  if (file) {
    imgData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.readAsDataURL(file);
    });
  }

  const newCampaign = {
    title,
    description,
    goal: Number(goal),
    deadline,
    img: imgData,
    raised: 0,
    donors: 0,
    isApproved: false,
    creatorId: Number(currentUser.id),
  };

  try {
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.textContent = "Creating...";
    }
    if (createFormStatus) createFormStatus.textContent = "";

    const res = await fetch(`${API}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server Error: ${errorText}`);
    }

    const data = await res.json();
    console.log("Created:", data);
    alert("Campaign created successfully 🎉");

    
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("goal").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("image").value = "";

    
  } catch (err) {
    console.error("Fetch Error:", err);
    if (createFormStatus) createFormStatus.textContent = err.message;
    alert(err.message);
  } finally {
    if (createBtn) {
      createBtn.textContent = "Create";
      updateCreateButtonState();
    }
  }
}
