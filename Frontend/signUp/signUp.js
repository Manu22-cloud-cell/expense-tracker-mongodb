const API_BASE_URL = "http://98.130.136.166";

//CENTRAL ERROR HANDLER

function handleApiError(error, fallbackMessage = "Something went wrong") {
  if (!error.response) {
    showMessage("Network error. Please check your internet connection.", "error");
    return;
  }

  const status = error.response.status;
  const message = error.response.data?.message || fallbackMessage;

  if (status === 409) {
    showMessage("Email already registered", "error");
    return;
  }

  if (status === 400) {
    showMessage(message, "error");
    return;
  }

  showMessage(message, "error");
}

//SIGNUP

function handleFormSubmit(event) {
  event.preventDefault();

  const userDetails = {
    userName: event.target.userName.value.trim(),
    email: event.target.email.value.trim().toLowerCase(),
    password: event.target.password.value.trim()
  };

  if (!userDetails.userName || !userDetails.email || !userDetails.password) {
    showMessage("All fields are required", "error");
    return;
  }

  axios
    .post(`${API_BASE_URL}/users/signUp`, userDetails)
    .then(() => {
      showMessage("Signup successful! Please login.", "success");
      event.target.reset();
    })
    .catch((err) =>
      handleApiError(err, "Signup failed. Try again.")
    );
}

//MESSAGE UI

function showMessage(text, type) {
  const msgBox = document.getElementById("message");
  msgBox.textContent = text;
  msgBox.className = type; // CSS: .success or .error
}



