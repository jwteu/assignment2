$(document).ready(function() {
  let currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
      window.location.href = 'auth.html';
  }

  let users = loadFromLocalStorage();
  let editExpenseId = null;
  let expenseChart;

  const categoryColors = {
      'Food': 'rgba(54, 162, 235, 0.2)', // Blue
      'Transport': 'rgba(255, 159, 64, 0.2)', // Orange
      'Daily Item': 'rgba(153, 102, 255, 0.2)', // Purple
      'Other': 'rgba(75, 192, 192, 0.2)' // Green
  };

  const categoryBorderColors = {
      'Food': 'rgba(54, 162, 235, 1)', // Blue
      'Transport': 'rgba(255, 159, 64, 1)', // Orange
      'Daily Item': 'rgba(153, 102, 255, 1)', // Purple
      'Other': 'rgba(75, 192, 192, 1)' // Green
  };

  $('#logout-btn').click(function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'auth.html';
  });

  $('#category').change(function() {
      if ($(this).val() === 'Other') {
          $('#other-category-group').show();
      } else {
          $('#other-category-group').hide();
      }
  });

  $('#expense-form').on('submit', function(e) {
      e.preventDefault();
      const amount = $('#amount').val();
      const date = $('#date').val();
      let category = $('#category').val();
      const otherCategory = $('#other-category').val();

      if (category === 'Other' && otherCategory) {
          category = `Other: ${otherCategory}`;
      }

      if (editExpenseId === null) {
          addExpense(amount, date, category);
      } else {
          updateExpense(editExpenseId, amount, date, category);
      }
      clearForm();
      loadExpenses();
      editExpenseId = null;
  });

  function addExpense(amount, date, category) {
      const formattedDate = formatDate(date);
      const expense = { id: Date.now(), amount, date: formattedDate, category };
      users[currentUser].expenses.push(expense);
      saveToLocalStorage();
  }

  function getExpenses() {
      return users[currentUser].expenses;
  }

  function loadExpenses() {
      let expenses = getExpenses();
      expenses.sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
      
      const $tableBody = $('#expense-table-body');
      $tableBody.empty();

      expenses.forEach(expense => {
          const $row = $('<tr>');
          $row.append(`<td>${expense.amount}</td>`);
          $row.append(`<td>${expense.date}</td>`);
          $row.append(`<td>${expense.category}</td>`);
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
      $('#date').val(expense.date.split('/').reverse().join('-')); // Reverse the date format for the input field
      if (expense.category.startsWith('Other: ')) {
          $('#category').val('Other');
          $('#other-category-group').show();
          $('#other-category').val(expense.category.replace('Other: ', ''));
      } else {
          $('#category').val(expense.category);
          $('#other-category-group').hide();
          $('#other-category').val('');
      }
      editExpenseId = id;
  }

  function updateExpense(id, amount, date, category) {
      const formattedDate = formatDate(date);
      const expense = users[currentUser].expenses.find(exp => exp.id === id);
      expense.amount = amount;
      expense.date = formattedDate;
      expense.category = category;
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
      $('#category').val('');
      $('#other-category').val('');
      $('#other-category-group').hide();
  }

  function updateChart(expenses) {
      const ctx = document.getElementById('expenseChart').getContext('2d');
      const chartType = $('#chartType').val();

      if (expenseChart) {
          expenseChart.destroy();
      }

      if (chartType === 'pie') {
          const aggregatedData = expenses.reduce((acc, expense) => {
              const category = expense.category.split(':')[0]; // Remove custom part for 'Other'
              if (!acc[category]) {
                  acc[category] = 0;
              }
              acc[category] += parseFloat(expense.amount);
              return acc;
          }, {});

          const labels = Object.keys(aggregatedData);
          const data = Object.values(aggregatedData);
          const backgroundColors = labels.map(label => categoryColors[label]);
          const borderColors = labels.map(label => categoryBorderColors[label]);

          expenseChart = new Chart(ctx, {
              type: chartType,
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Expenses',
                      data: data,
                      backgroundColor: backgroundColors,
                      borderColor: borderColors,
                      borderWidth: 1
                  }]
              },
              options: {}
          });

      } else {
          const aggregatedData = expenses.reduce((acc, expense) => {
              const key = `${expense.date}: ${expense.category}`;
              if (!acc[key]) {
                  acc[key] = 0;
              }
              acc[key] += parseFloat(expense.amount);
              return acc;
          }, {});

          const labels = Object.keys(aggregatedData);
          const data = Object.values(aggregatedData);
          const backgroundColors = labels.map(label => categoryColors[label.split(': ')[1].split(':')[0]] || categoryColors['Other']);
          const borderColors = labels.map(label => categoryBorderColors[label.split(': ')[1].split(':')[0]] || categoryBorderColors['Other']);

          expenseChart = new Chart(ctx, {
              type: chartType,
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Expenses',
                      data: data,
                      backgroundColor: backgroundColors,
                      borderColor: borderColors,
                      borderWidth: 1
                  }]
              },
              options: {
                  scales: chartType === 'line' ? {
                      y: {
                          beginAtZero: true
                      }
                  } : {},
                  plugins: {
                      legend: {
                          display: true,
                          labels: {
                              generateLabels: function(chart) {
                                  const uniqueCategories = new Set(chart.data.labels.map(label => label.split(': ')[1]));
                                  const categoryMap = Array.from(uniqueCategories).map((category, index) => ({
                                      text: category,
                                      fillStyle: categoryColors[category.split(':')[0]] || categoryColors['Other'],
                                      strokeStyle: categoryBorderColors[category.split(':')[0]] || categoryBorderColors['Other'],
                                      lineWidth: 1,
                                      hidden: false,
                                      index: index
                                  }));
                                  return categoryMap;
                              }
                          }
                      }
                  }
              }
          });
      }
  }

  function formatDate(date) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
  }

  function saveToLocalStorage() {
      localStorage.setItem('users', JSON.stringify(users));
  }

  function loadFromLocalStorage() {
      const usersData = localStorage.getItem('users');
      return usersData ? JSON.parse(usersData) : {};
  }

  $('#chartType').change(function() {
      updateChart(getExpenses());
  });

  window.editExpense = editExpense;
  window.deleteExpense = deleteExpense;

  loadExpenses();
});
