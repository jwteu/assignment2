$(document).ready(function() {
    let currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.href = 'auth.html';
    }
  
    let users = loadFromLocalStorage();
    let editExpenseId = null;
    let expenseChart;
  
    $('#logout-btn').click(function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'auth.html';
    });
  
    $('#expense-form').on('submit', function(e) {
      e.preventDefault();
      const amount = $('#amount').val();
      const date = $('#date').val();
      const description = $('#description').val();
  
      if (editExpenseId === null) {
        addExpense(amount, date, description);
      } else {
        updateExpense(editExpenseId, amount, date, description);
      }
      clearForm();
      loadExpenses();
      editExpenseId = null;
    });
  
    function addExpense(amount, date, description) {
      const expense = { id: Date.now(), amount, date, description };
      users[currentUser].expenses.push(expense);
      saveToLocalStorage();
    }
  
    function getExpenses() {
      return users[currentUser].expenses;
    }
  
    function loadExpenses() {
      const expenses = getExpenses();
      const $tableBody = $('#expense-table-body');
      $tableBody.empty();
  
      expenses.forEach(expense => {
        const $row = $('<tr>');
        $row.append(`<td>${expense.amount}</td>`);
        $row.append(`<td>${expense.date}</td>`);
        $row.append(`<td>${expense.description}</td>`);
        $row.append(`
          <td>
            <button class="btn btn-sm btn-info" onclick="editExpense(${expense.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
          </td>
        `);
        $tableBody.append($row);
      });
  
      const totalExpenses = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
      $('#total-expenses').text(totalExpenses);
  
      updateChart(expenses);
    }
  
    function editExpense(id) {
      const expense = users[currentUser].expenses.find(exp => exp.id === id);
      $('#amount').val(expense.amount);
      $('#date').val(expense.date);
      $('#description').val(expense.description);
      editExpenseId = id;
    }
  
    function updateExpense(id, amount, date, description) {
      const expense = users[currentUser].expenses.find(exp => exp.id === id);
      expense.amount = amount;
      expense.date = date;
      expense.description = description;
      saveToLocalStorage();
    }
  
    function deleteExpense(id) {
      users[currentUser].expenses = users[currentUser].expenses.filter(exp => exp.id !== id);
      saveToLocalStorage();
      editExpenseId = null;
      loadExpenses();
    }
  
    function clearForm() {
      $('#amount').val('');
      $('#date').val('');
      $('#description').val('');
    }
  
    function updateChart(expenses) {
      const ctx = document.getElementById('expenseChart').getContext('2d');
      const labels = expenses.map(expense => expense.date);
      const data = expenses.map(expense => parseFloat(expense.amount));
  
      if (expenseChart) {
        expenseChart.destroy();
      }
  
      expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Expenses',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  
    function saveToLocalStorage() {
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    function loadFromLocalStorage() {
      const usersData = localStorage.getItem('users');
      return usersData ? JSON.parse(usersData) : {};
    }
  
    window.editExpense = editExpense;
    window.deleteExpense = deleteExpense;
    
    loadExpenses();
  });
  