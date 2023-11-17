/*
   LOGIN / REGISTER JAVASCRIPT
   
   This JavaScript code is responsible for managing a login and registration system on a web page. It makes use of the DOM (Document Object Model) to interact with various HTML elements and provides functionality for showing and hiding login and registration forms, as well as validating user input in the registration form.

   Key components and functionalities:
   
   - Event listeners are set up to trigger actions when certain elements are clicked or when the DOM content is loaded.
   
   - The code handles two main forms: the login form and the registration form.
   
   - The 'showLoginForm' and 'showRegistrationForm' functions are responsible for displaying the login and registration forms when respective buttons are clicked. These functions also clear any existing error messages.
   
   - The 'hideForms' function hides both forms when the close buttons are clicked. It removes CSS classes responsible for showing or hiding the forms.
   
   - Event listeners are attached to various elements, such as buttons and links, to perform actions like showing/hiding forms and preventing default behavior.
   
   - Form validation is implemented for the registration form. It checks the length of the email, name, and password inputs and displays error messages if they don't meet certain criteria. If all validations pass, the form is submitted.

   Note: The code mentions handling login form validation but doesn't contain the actual validation logic. You would need to add similar validation logic for the login form as needed.
*/

document.addEventListener('DOMContentLoaded', function() {
    const signInButton = document.getElementById('signInButton');
    const createAccountButton = document.getElementById('createAccountButton');
    
    const closeButton1 = document.getElementById('closeButton1');
    const closeButton2 = document.getElementById('closeButton2');

    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const signUpLink = document.querySelector('.signup_link a');

    const emailError = document.getElementById('emailError');
    const nameError = document.getElementById('nameError');
    const passwordError = document.getElementById('passwordError');

    function showLoginForm() {        
        loginForm.style.display = 'block';
        loginForm.classList.add('show-form');

        // Clear error messages when showing the login form
        emailError.textContent = '';
        passwordError.textContent = '';
    }
    
    function showRegistrationForm() {
        registrationForm.style.display = 'block';
        registrationForm.classList.add('show-form');

        // Clear error messages when showing the registration form
        emailError.textContent = '';
        nameError.textContent = '';
        passwordError.textContent = '';
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

    // Your form validation code (name, email, and password) should go here
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate email, name, and password
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        
        // Reset error messages
        emailError.textContent = '';
        nameError.textContent = '';
        passwordError.textContent = '';

        // Email validation
        if (email.length > 64) {
            emailError.textContent = 'Email is too long (maximum 64 characters).';
            return;
        }

        // Name validation
        if (name.length > 32) {
            nameError.textContent = 'Name is too long (maximum 32 characters).';
            return;
        }

        // Password validation
        if (password.length < 8) {
            passwordError.textContent = 'Password is too short (minimum 8 characters).';
            return;
        }

        // If all validations pass, you can submit the form
        registrationForm.submit();
    });

    // Your login form validation code should go here
    // ...

});
