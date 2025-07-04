let customers = JSON.parse(localStorage.getItem("customers") || "[]");
let currentPage = 1;
const rowsPerPage = 10;
const tableBody = document.querySelector("#customerTable tbody");
const nameInput = document.getElementById("name");
const bottleInput = document.getElementById("bottle");
const totalInput = document.getElementById("total");
const datetimeInput = document.getElementById("datetime");
const customerForm = document.getElementById("customerForm");
const search = document.getElementById("search");
const editForm = document.getElementById("editForm");
const editIndex = document.getElementById("editIndex");
const editName = document.getElementById("editName");
const editBottle = document.getElementById("editBottle");
const editTotal = document.getElementById("editTotal");
const editDatetime = document.getElementById("editDatetime");
const rewardIndex = document.getElementById("rewardIndex");
const rewardAmount = document.getElementById("rewardAmount");
const useRewardForm = document.getElementById("useRewardForm");
function renderTable(filtered = null) {
  const tableBody = document.querySelector("#customerTable tbody");
  tableBody.innerHTML = "";

  const data = filtered || customers;
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = data.slice(start, end);

  pageData.forEach((customer, index) => {
    const realIndex = customers.indexOf(customer);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" data-index="${realIndex}" onchange="handleCheckbox(this)"></td>
      <td>${customer.name}</td>
      <td>${customer.bottle}</td>
      <td>${customer.total}</td>
      <td>${Math.floor(customer.bottle / 10)}</td>
      <td>${customer.datetime}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editCustomer(${realIndex})">แก้ไข</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${realIndex})">ลบ</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  renderPagination(data);
}
function renderPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", () => {
      currentPage = i;
      renderTable();
    });
    pagination.appendChild(li);
  }
}


function saveToLocal() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

// เพิ่มข้อมูลใหม่
customerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const bottle = +bottleInput.value;
  const total = +totalInput.value;
  const datetime = datetimeInput.value;

  if (!name || !bottle || !total || !datetime) return;

  const dateOnly = datetime.split("T")[0];

  // ตรวจสอบว่ามีลูกค้าคนนี้ในวันเดียวกันหรือยัง
  const existingIndex = customers.findIndex(c => c.name === name && c.datetime.split("T")[0] === dateOnly);

  if (existingIndex !== -1) {
    // รวมจำนวนขวดและยอด
    customers[existingIndex].bottle += bottle;
    customers[existingIndex].total += total;
    customers[existingIndex].datetime = datetime; // อัปเดตเวลาใหม่สุด
  } else {
    customers.push({ name, bottle, total, datetime });
  }

  saveToLocal();
  currentPage = 1;
  renderTable();
  customerForm.reset();
});


// ลบ
function deleteCustomer(i) {
  if (confirm("ยืนยันการลบข้อมูล")) {
    customers.splice(i, 1);
    saveToLocal();
    renderTable();
  }
}

// แก้ไข
function editCustomer(i) {
  const c = customers[i];
  editIndex.value = i;
  editName.value = c.name;
  editBottle.value = c.bottle;
  editTotal.value = c.total;
  editDatetime.value = c.datetime;
  new bootstrap.Modal(editModal).show();
}

editForm.onsubmit = e => {
  e.preventDefault();
  const i = +editIndex.value;
  customers[i] = {
    name: editName.value.trim(),
    bottle: +editBottle.value,
    total: +editTotal.value,
    datetime: editDatetime.value
  };
  saveToLocal();
  renderTable();
  bootstrap.Modal.getInstance(editModal).hide();
};

// ค้นหา
search.oninput = e => {
  const keyword = e.target.value.toLowerCase();
  const filtered = customers.filter(c => c.name.toLowerCase().includes(keyword));
  renderTable(filtered);
};

// ใช้สิทธิ์
function handleCheckbox(checkbox) {
  const i = +checkbox.dataset.index;
  const customer = customers[i];
  const availableReward = Math.floor(customer.bottle / 10);

  if (availableReward < 1) {
    alert("ลูกค้ายังไม่มีสิทธิ์แถม");
    checkbox.checked = false;
    return;
  }

  // เตรียม modal
  rewardIndex.value = i;
  rewardAmount.innerHTML = "";

  for (let r = 1; r <= availableReward; r++) {
    rewardAmount.innerHTML += `<option value="${r}">${r}</option>`;
  }

  new bootstrap.Modal(document.getElementById("useRewardModal")).show();

  // เมื่อ modal ปิด ให้ยกเลิก checkbox
  document.getElementById("useRewardModal").addEventListener("hidden.bs.modal", () => {
    checkbox.checked = false;
  }, { once: true });
}


useRewardForm.onsubmit = e => {
  e.preventDefault();
  const i = +rewardIndex.value;
  const used = +rewardAmount.value;
  customers[i].bottle -= used * 10;
  saveToLocal();
  renderTable();
  bootstrap.Modal.getInstance(useRewardModal).hide();
};

renderTable();
