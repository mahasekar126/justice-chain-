// NOTE: For a real-world project, replace this 'users' array with a secure backend API
const users = [
    { username: "admin", password: "admin123", role: "Admin" },
    { username: "police1", password: "police123", role: "Police" },
    { username: "lawyer1", password: "lawyer123", role: "Lawyer" },
    { username: "judge1", password: "judge123", role: "Judge" },
    { username: "public", password: "public123", role: "Public" }
];

function handleLogin(event) {
    // If called by Enter keypress, prevent default
    if (event) event.preventDefault(); 

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleSelect = document.getElementById("role");
    const messageElement = document.getElementById("loginMessage");
    const loginButton = document.querySelector('.login-form button');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    messageElement.textContent = '';
    messageElement.style.color = '';

    // --- Validation ---
    if (!username || !password || !role) {
        messageElement.textContent = "⚠️ Please fill all fields!";
        messageElement.style.color = '#ff6b6b';
        (username ? (password ? roleSelect : passwordInput) : usernameInput).focus();
        return;
    }

    // --- Show loading ---
    loginButton.disabled = true;
    loginButton.textContent = 'AUTHENTICATING...';
    messageElement.textContent = 'Verifying credentials...';
    messageElement.style.color = '#ffc107';

    // --- Simulate server delay ---
    setTimeout(() => {
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );

        if (user) {
            // Store role and login flag
            localStorage.setItem("role", user.role);
            localStorage.setItem("isLoggedIn", "true");

            messageElement.textContent = `✅ Login successful! Redirecting...`;
            messageElement.style.color = '#28a745';

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);

        } else {
            messageElement.textContent = "❌ Invalid username, password, or role!";
            messageElement.style.color = '#ff6b6b';
            loginButton.disabled = false;
            loginButton.textContent = 'LOGIN';
            passwordInput.value = '';
        }
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-form button');

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);

        // Enable Enter key to submit login
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }
});
