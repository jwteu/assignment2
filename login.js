$(document).ready(function(){
    const loginForm = $('#loginform');
    const formTitle = $('#formtitle');
    const submitBtn = $('#submitbutton');
    const linkword = $('#linkword');
    const confirmPasswordGroup = $('#confirmpassword');
    
    let isLogin = true;

    if (localStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
    }
    
    loginForm.on('submit', function(event) {
        event.preventDefault(); 
        const username = $('#username').val();
        const password = $('#password').val()

        if (isLogin) {
            const storedUser = JSON.parse(localStorage.getItem(username));
            if (storedUser && storedUser.password === password) {
                localStorage.setItem('loggedInUser', username);
                window.location.href = 'index.html'; 
            } else {
                alert('Invalid username or password.');
            }

        } else{
            const confirmPassword = $('#confirmpassword').val();
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            if (localStorage.getItem(username)) {
                alert('Username already exists.');
            } else {
                localStorage.setItem(username, JSON.stringify({ password })); // Store new user
                alert('Registration successful. Please login.');
                toggleform();
            }
        }
    });

    linkword.on('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        toggleform(); // Call the function to switch forms
    });


    function toggleform(){
        isLogin=!isLogin;
        formTitle.text(isLogin ? 'Login' : 'Register');
        submitBtn.text(isLogin ? 'Login' : 'Register');
        linkword.text(isLogin ? "Don't have an account? Register now" : "Already Register? Login here");
        confirmPasswordGroup.toggle(!isLogin);
        loginForm[0].reset();
    }

});