const API_BASE_URL = "http://98.130.136.166";

//CENTRAL ERROR HANDLER

function handleApiError(error, fallbackMessage = "Something went wrong") {
  if (!error.response) {
    alert("Network error. Please check your internet connection.");
    return;
  }

  const status = error.response.status;
  const message = error.response.data?.message || fallbackMessage;

  if (status === 401 || status === 403) {
    alert(message || "Invalid credentials");
    return;
  }

  alert(message);
}

//LOGIN

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email and password are required");
    return;
  }

  axios
    .post(`${API_BASE_URL}/users/login`, { email, password })
    .then((res) => {
      if (!res.data.token) {
        throw new Error("Authentication token missing");
      }

      localStorage.setItem("username", res.data.username);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isPremium", res.data.isPremium ? "true" : "false");

      alert("Login successful");
      window.location.href = "../addExpenses/expense.html";
    })
    .catch((err) => handleApiError(err, "Login failed"));

  event.target.reset();
}

//FORGOT PASSWORD

function showForgotPasswordForm() {
  document.getElementById("forgot-form").style.display = "block";
}

function handleForgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("forgot-email").value.trim().toLowerCase();

  if (!email) {
    alert("Email is required");
    return;
  }

  axios
    .post(`${API_BASE_URL}/password/forgotpassword`, { email })
    .then(() => {
      alert("Password reset link sent to your email");
      document.getElementById("forgot-form").style.display = "none";
    })
    .catch((err) =>
      handleApiError(err, "Failed to send password reset email")
    );
}



