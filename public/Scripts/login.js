const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    const hashedPassword = await window.hashPassword(password);

    const res = await fetch(`${window.API_BASE}/users?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error(`Server error (${res.status})`);
    const users = await res.json();

    if (users.length === 0) {
      alert("Email not found");
      return;
    }

    const user = users[0];

    if (user.isActive === false) {
      alert(`${user.name} is banned by admin`);
      return;
    }

    if (user.password !== hashedPassword) {
      alert("Invalid password");
      return;
    }

    window.saveCurrentUser(user);
    alert(`Welcome ${user.name}!`);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error. Make sure JSON Server is running on port 3000.");
  }
});