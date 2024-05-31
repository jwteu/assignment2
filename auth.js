$(document).ready(function() {
    let users = loadFromLocalStorage();

    $('#show-register').click(function() {
        $('#login-page').hide();
        $('#register-page').show();
    });

    $('#show-login').click(function() {
        $('#register-page').hide();
        $('#login-page').show();
    });

    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        const username = $('#register-username').val();
        const password = $('#register-password').val();

        if (!users[username]) {
            users[username] = { password: password, expenses: [] };
            saveToLocalStorage();
            alert('Registration successful! You can now log in.');
            $('#register-username').val('');
            $('#register-password').val('');
            $('#show-login').trigger('click');
        } else {
            alert('Username already exists!');
        }
    });

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        const username = $('#login-username').val();
        const password = $('#login-password').val();

        if (users[username] && users[username].password === password) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'expenses.html';
        } else {
            alert('Invalid username or password!');
        }
    });

    function saveToLocalStorage() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function loadFromLocalStorage() {
        const usersData = localStorage.getItem('users');
        return usersData ? JSON.parse(usersData) : {};
    }
});
