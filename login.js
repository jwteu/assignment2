$(document).ready(function () {
    var isLogin = true;

    $("#confirm").hide();

    $("#change").click(function (event) {
        event.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            $("#formtitle").text("Login");
            $("#submitbutton").text("Login");
            $("#change").text("Don't have an account? Register here");
            $("#confirm").hide();
        } else {
            $("#formtitle").text("Register");
            $("#submitbutton").text("Register");
            $("#change").text("Already registered? Login here");
            $("#confirm").show();
        }
    });

    $("#form").submit(function (event) {
        event.preventDefault();

        var username = $("#username").val();
        var password = $("#password").val();

        var users = JSON.parse(localStorage.getItem("users")) || {};

        if (isLogin) {
            if (users[username] && users[username] === password) {
                localStorage.setItem('loggedInUser', username);
                window.location.href = 'main.html';
            } else {
                alert('Invalid username or password.');
            }
        } else {
            var confirmPassword = $("#confirmpassword").val();

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            if (users[username]) {
                alert("Username already exists.");
                return;
            }

            // Add new user to the users object
            users[username] = password;
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful. Please login.");

            // Switch back to login form
            isLogin = true;
        }
    });
});