const API_BASE_URL = "http://98.130.136.166";

let currentPage = 1;
let ITEMS_PER_PAGE = Number(localStorage.getItem("itemsPerPage")) || 10;
let editExpenseId = null;

//CENTRAL ERROR HANDLER

function handleApiError(error, fallbackMessage = "Something went wrong") {
  if (!error.response) {
    alert("Network error. Please check your internet connection.");
    return;
  }

  const status = error.response.status;
  const message = error.response.data?.message || fallbackMessage;

  if (status === 401 || status === 403) {
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "../login/login.html";
    return;
  }

  alert(message);
}

//AXIOS INTERCEPTOR

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "../login/login.html";
    }
    return Promise.reject(error);
  }
);

//PAGE LOAD 

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("../login/login.html");
    return;
  }

  //Token exists → show page
  document.getElementById("protected-content").style.display = "block";

  const username = localStorage.getItem("username");
  const welcomeDiv = document.getElementById("welcomeBox");
  if (username && welcomeDiv) {
    welcomeDiv.textContent = `Welcome ${username}!!`;
  }

  checkPremiumStatus();

  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  if (itemsPerPageSelect) {
    itemsPerPageSelect.value = ITEMS_PER_PAGE;

    itemsPerPageSelect.addEventListener("change", (e) => {
      ITEMS_PER_PAGE = Number(e.target.value);
      localStorage.setItem("itemsPerPage", ITEMS_PER_PAGE);
      currentPage = 1;
      getAllExpenses(currentPage);
    });
  }

  getAllExpenses();
});

//CREATE / UPDATE EXPENSE 

function handleFormSubmit(event) {
  event.preventDefault();

  const expenseDetails = {
    amount: event.target.amount.value,
    description: event.target.description.value,
    note: event.target.note.value,
    category: event.target.category.value
  };

  const token = localStorage.getItem("token");

  const request = editExpenseId
    ? axios.put(
      `${API_BASE_URL}/expenses/update/${editExpenseId}`,
      expenseDetails,
      { headers: { Authorization: token } }
    )
    : axios.post(
      `${API_BASE_URL}/expenses/add`,
      expenseDetails,
      { headers: { Authorization: token } }
    );

  request
    .then(() => {
      editExpenseId = null;
      document.getElementById("add-btn").textContent = "Add Expense";
      getAllExpenses(currentPage);
      event.target.reset();
    })
    .catch((err) => handleApiError(err, "Failed to save expense"));
}

//READ EXPENSES

function getAllExpenses(page = 1) {
  axios
    .get(`${API_BASE_URL}/expenses/?page=${page}&limit=${ITEMS_PER_PAGE}`, {
      headers: { Authorization: localStorage.getItem("token") }
    })
    .then((response) => {
      const { expenses, currentPage: backendPage, totalPages } = response.data;

      // handle invalid page after delete
      if (backendPage > totalPages && totalPages > 0) {
        getAllExpenses(totalPages);
        return;
      }

      const expenseList = document.getElementById("expenses-list");
      expenseList.innerHTML = "";

      expenses.forEach(displayExpenseOnScreen);

      renderPagination(backendPage, totalPages);

      currentPage = backendPage;
    })
    .catch((err) => handleApiError(err, "Unable to load expenses"));
}


//PAGINATION

function renderPagination(current, total) {
  let paginationDiv = document.getElementById("pagination");

  if (!paginationDiv) {
    paginationDiv = document.createElement("div");
    paginationDiv.id = "pagination";
    paginationDiv.style.textAlign = "center";
    paginationDiv.style.marginTop = "20px";
    document.querySelector(".left-section").appendChild(paginationDiv);
  }

  paginationDiv.innerHTML = `
    <button ${current === 1 ? "disabled" : ""} onclick="getAllExpenses(${current - 1})">⬅ Prev</button>
    <span style="margin: 0 10px;">Page ${current} of ${total}</span>
    <button ${current === total ? "disabled" : ""} onclick="getAllExpenses(${current + 1})">Next ➡</button>
    <button ${current === total ? "disabled" : ""} onclick="getAllExpenses(${total})">Last</button>
  `;
}

//DISPLAY EXPENSE

function displayExpenseOnScreen(expense) {
  const expenseList = document.getElementById("expenses-list");
  const li = document.createElement("li");

  const textSpan = document.createElement("span");
  textSpan.innerHTML = `
    <strong>₹${expense.amount}</strong> -
    ${expense.description} -
    ${expense.category}
    ${expense.note ? `- ${expense.note}` : ""}
  `;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    document.getElementById("amount").value = expense.amount;
    document.getElementById("description").value = expense.description;
    document.getElementById("note").value = expense.note || "";
    document.getElementById("category").value = expense.category;
    document.getElementById("add-btn").textContent = "Update";
    editExpenseId = expense.id;
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => {
    axios
      .delete(`${API_BASE_URL}/expenses/delete/${expense.id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      })
      .then(() => getAllExpenses(currentPage))
      .catch((err) => handleApiError(err, "Failed to delete expense"));
  };

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("expense-actions");
  btnContainer.append(editBtn, deleteBtn);

  li.append(textSpan, btnContainer);
  expenseList.appendChild(li);
}

//PREMIUM

document.getElementById("premium-btn").addEventListener("click", () => {
  axios
    .post(
      `${API_BASE_URL}/payment/create-order`,
      {
        phone: "9999999999",
        email: "test@example.com"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        }
      }
    )
    .then((response) => {
      const cashfree = Cashfree({ mode: "sandbox" });
      cashfree.checkout({ paymentSessionId: response.data.sessionId });
    })
    .catch((err) => handleApiError(err, "Payment could not be started"));
});


document.getElementById("reports-btn").addEventListener("click", () => {
  window.location.href = "../reports/reports.html";
});

//PREMIUM UI

function checkPremiumStatus() {
  if (localStorage.getItem("isPremium") === "true") {
    showPremiumBadge();
    document.getElementById("premium-btn").style.display = "none";
    document.getElementById("reports-btn").style.display = "inline-block";
  }
}

function showPremiumBadge() {
  const badge = document.createElement("span");
  badge.textContent = "Premium Member";
  badge.classList.add("premium-badge");

  const leaderboardBtn = document.createElement("button");
  leaderboardBtn.textContent = "Show Leaderboard";
  leaderboardBtn.classList.add("leaderboard-btn");
  leaderboardBtn.onclick = getLeaderboard;

  document.getElementById("premium-member").appendChild(badge);
  document.getElementById("leader-board").appendChild(leaderboardBtn);
}

//LEADERBOARD

function getLeaderboard() {
  axios
    .get(`${API_BASE_URL}/expenses/leaderboard`, {
      headers: { Authorization: localStorage.getItem("token") }
    })
    .then((response) => {
      const container = document.getElementById("leaderboard-container");
      container.classList.remove("hidden");

      container.innerHTML = `
        <h3>Leaderboard</h3>
        <table border="1" style="border-collapse: collapse; width: 50%;">
          <tr><th>Name</th><th>Total Expense</th></tr>
          ${response.data.map(user => `
            <tr>
              <td>${user.userName || "Unknown"}</td>
              <td>₹${user.totalExpense || 0}</td>
            </tr>
          `).join("")}
        </table>
      `;
    })
    .catch((err) => handleApiError(err, "Unable to load leaderboard"));
}

//Logout 

function logoutUser() {
  // Optional backend call (does nothing but keeps API clean)
  axios
    .post(
      `${API_BASE_URL}/user/logout`,
      {},
      { headers: { Authorization: localStorage.getItem("token") } }
    )
    .finally(() => {
      // Clear all auth-related data
      localStorage.clear();

      // Redirect to login page
      window.location.href = "../login/login.html";
    });
}

document.getElementById("logout-btn")?.addEventListener("click", logoutUser);

