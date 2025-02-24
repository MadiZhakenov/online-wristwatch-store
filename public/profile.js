
const token = localStorage.getItem("token");

async function fetchProfile() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const user = await response.json();
        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;
    } catch (error) {
        console.error("Error fetching profile:", error);
        document.getElementById("message").textContent = "Failed to load profile.";
    }
}

document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value || undefined
    };

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("message").textContent = "Profile updated successfully!";
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        document.getElementById("message").textContent = "Error updating profile: " + error.message;
    }
});

// Load profile when the page loads
document.addEventListener("DOMContentLoaded", fetchProfile);
