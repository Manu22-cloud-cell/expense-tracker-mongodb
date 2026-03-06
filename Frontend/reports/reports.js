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
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "../login/login.html";
    return;
  }

  alert(message);
}

const isPremium = localStorage.getItem("isPremium");

if (isPremium !== "true") {
  document.getElementById("report-section").style.display = "none";
  document.getElementById("premium-warning").classList.remove("hidden");
  document.getElementById("download-btn").disabled = true;
}

//FETCH REPORT (VIEW ONLY)

async function fetchReport() {
  try {
    const type = document.getElementById("report-type").value;
    const month = document.getElementById("month-input").value; // yyyy-mm
    const year = document.getElementById("year-input").value;

    let url = `${API_BASE_URL}/reports?type=${type}`;

    if (type === "monthly" && month) {
      const [yyyy, mm] = month.split("-");
      url += `&month=${mm}&year=${yyyy}`;
    }

    if (type === "yearly" && year) {
      url += `&year=${year}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: localStorage.getItem("token") }
    });

    document.getElementById("report-table").innerHTML = "";

    if (type === "yearly") {
      renderYearlyTable(res.data.data, res.data.total);
    } else {
      renderExpenseTable(res.data.expenses, res.data.totalExpense);
    }

  } catch (err) {
    alert("Failed to fetch report");
    console.error(err);
  }
}

//TABLE RENDERING

function renderYearlyTable(data, total) {
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  let html = `
    <tr>
      <th>Month</th>
      <th>Expense</th>
    </tr>
  `;

  data.forEach(row => {
    const monthName = monthNames[row.month - 1];
    html += `
      <tr>
        <td>${monthName}</td>
        <td>₹${row.expense}</td>
      </tr>
    `;
  });

  html += `
    <tr>
      <td><strong>Total</strong></td>
      <td><strong>₹${total}</strong></td>
    </tr>
  `;

  document.getElementById("report-table").innerHTML = html;
}

function renderExpenseTable(expenses, total) {
  let html = `
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Category</th>
      <th>Note</th>
      <th>Expense</th>
    </tr>
  `;

  expenses.forEach(e => {
    html += `
      <tr>
        <td>${new Date(e.createdAt).toLocaleDateString()}</td>
        <td>${e.description}</td>
        <td>${e.category || "AI Selected"}</td>
        <td>${e.note || "-"}</td>
        <td>₹${e.amount}</td>
      </tr>
    `;
  });

  html += `
    <tr>
      <td colspan="4"><strong>Total</strong></td>
      <td><strong>₹${total}</strong></td>
    </tr>
  `;

  document.getElementById("report-table").innerHTML = html;
}

//DOWNLOAD REPORT (S3)

async function downloadReport() {
  try {
    const type = document.getElementById("report-type").value;
    const month = document.getElementById("month-input").value;
    const year = document.getElementById("year-input").value;

    let url = `${API_BASE_URL}/reports/download?type=${type}`;

    if (type === "monthly" && month) {
      url += `&month=${month}`;
    }

    if (type === "yearly" && year) {
      url += `&year=${year}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: localStorage.getItem("token") }
    });

    const container = document.getElementById("download-link-container");
    container.innerHTML = `
      <a href="${res.data.fileUrl}" target="_blank">
        Download Report
      </a>
    `;

    loadDownloadHistory();
  } catch (err) {
    console.error(err);
    alert("Failed to download report");
  }
}


//DOWNLOAD HISTORY

async function loadDownloadHistory() {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/reports/history`,
      { headers: { Authorization: localStorage.getItem("token") } }
    );

    const list = document.getElementById("download-history");
    list.innerHTML = "";

    res.data.forEach(r => {
      list.innerHTML += `
        <li>
          <a href="${r.fileUrl}" target="_blank">Download</a>
          (${new Date(r.downloadedAt).toLocaleDateString()})
        </li>
      `;
    });

  } catch (err) {
    console.error("Failed to load history", err);
  }
}

//INIT
loadDownloadHistory();
