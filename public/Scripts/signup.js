 const signupBtn = document.getElementById('signupBtn');

        signupBtn.addEventListener('click', async () => {
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirm = document.getElementById('signupConfirm').value.trim();

            
            if (!name || !email || !password || !confirm) {
                alert("Please fill all fields.");
                return;
            }

           
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

           
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                alert("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
                return;
            }

            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }

            try {
                
                const existingRes = await fetch(`${window.API_BASE}/users?email=${encodeURIComponent(email)}`);
                const existingUsers = await existingRes.json();
                if (existingUsers.length > 0) {
                    alert("Email already registered. Please login.");
                    return;
                }

                const hashedPassword = await window.hashPassword(password);

               
                const newUser = {
                    name,
                    email,
                    password: hashedPassword,
                    isAdmin: false,
                    isActive: true
                };

                const res = await fetch(`${window.API_BASE}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser)
                });

                if (!res.ok) throw new Error("Failed to create user.");

                alert("Signup successful! You can now login.");
                window.location.href = "login.html";

            } catch (err) {
                console.error(err);
                alert("Error during signup. Please try again.");
            }
        });