let expenseChart; 

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const incomeBtn = document.getElementById('addIncomeBtn');
const expenseBtn = document.getElementById('addExpenseBtn');
const tableBody = document.getElementById('transactionTableBody');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');

incomeBtn.addEventListener('click', () => addTransaction('income'));
expenseBtn.addEventListener('click', () => addTransaction('expense'));
filterType.addEventListener('change', renderTable);
filterCategory.addEventListener('change', renderTable);

function addTransaction(type) {
  const date = document.getElementById(`${type}-date`).value;
  const description = document.getElementById(`${type}-description`).value.trim();
  const category = document.getElementById(`${type}-category`).value;
  const amount = parseFloat(document.getElementById(`${type}-amount`).value);

  if (!date || !description || !category || isNaN(amount)) {
    alert('Please fill all fields correctly!');
    return;
  }
  if (amount <= 0) {
  alert('Amount must be greater than 0!');
  return;
}


  const transaction = { date, description, category, amount, type };
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTable();

  // Clear form
  document.getElementById(`${type}-date`).value = '';
  document.getElementById(`${type}-description`).value = '';
  document.getElementById(`${type}-category`).value = '';
  document.getElementById(`${type}-amount`).value = '';
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTable();
}

function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
    }
  });

  const netBalance = totalIncome - totalExpense;

  document.getElementById('summaryIncome').textContent = `₹${totalIncome}`;
  document.getElementById('summaryExpense').textContent = `₹${totalExpense}`;
  document.getElementById('summaryBalance').textContent = `₹${netBalance}`;
}

function updateExpenseChart() {
  // Filter only expense transactions
  const expenseData = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
    }
  });

  const categories = Object.keys(expenseData);
  const amounts = Object.values(expenseData);

  const ctx = document.getElementById('expenseChart').getContext('2d');

  // Destroy existing chart if it exists
  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function renderTable() {
  tableBody.innerHTML = ''; 

  const filtered = transactions.filter(t => {
    const typeMatches = (filterType.value === 'all') || (t.type === filterType.value);
    const categoryMatches = (filterCategory.value === 'all') || (t.category === filterCategory.value);
    return typeMatches && categoryMatches;
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 15px; color: #777;">
        🚫 No transactions match the selected filters.
      </td>
    `;
    tableBody.appendChild(tr);
    return;
  }

  filtered.forEach((tran, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tran.date}</td>
      <td>${tran.description}</td>
      <td><span class="category-label ${tran.type === 'income' ? 'income-label' : 'expense-label'}">${tran.category}</span></td>
      <td>₹${tran.amount}</td>
      <td>${tran.type.charAt(0).toUpperCase() + tran.type.slice(1)}</td>
      <td><button class="delete-btn" onclick="deleteTransaction(${index})">X</button></td>
    `;
    tableBody.appendChild(tr);
  });
  updateSummary();
  updateExpenseChart();
}



// Initial render
renderTable();
