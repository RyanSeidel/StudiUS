document.addEventListener('DOMContentLoaded', function() {
    const signInButton = document.getElementById('signInButton');
    const createAccountButton = document.getElementById('createAccountButton');
    
    const closeButton1 = document.getElementById('closeButton1');
    const closeButton2 = document.getElementById('closeButton2');

    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const signUpLink = document.querySelector('.signup_link a');

    function showLoginForm() {        
        loginForm.style.display = 'block';
        loginForm.classList.add('show-form');
    }
    
    function showRegistrationForm() {
        registrationForm.style.display = 'block';
        registrationForm.classList.add('show-form');
    }
    
    function hideForms() {
        console.log("Hiding forms...");
        loginForm.style.display = 'none';
        registrationForm.style.display = 'none';

        loginForm.classList.remove('show-form');

        registrationForm.classList.remove('hide-form');
        registrationForm.classList.remove('show-form');
    }
    
    closeButton1.addEventListener('click', function() {
        console.log("Close button 1 clicked.");
        hideForms();
    });
    
    closeButton2.addEventListener('click', function() {
        console.log("Close button 2 clicked.");
        hideForms();
    });
    

    signInButton.addEventListener('click', showLoginForm);
    createAccountButton.addEventListener('click', showRegistrationForm);
    closeButton1.addEventListener('click', hideForms);
    closeButton2.addEventListener('click', hideForms);

    signUpLink.addEventListener('click', function(e) {
        e.preventDefault();
        hideForms();
        showLoginForm();
    });
});
