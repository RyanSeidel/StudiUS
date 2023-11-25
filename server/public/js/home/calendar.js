/*
   SIMPLE CALENDAR JAVASCRIPT

   This JavaScript code is designed to create a simple calendar on a web page. The calendar allows users to navigate between months, view the current date, and interact with date entries. The code leverages the DOM (Document Object Model) to manipulate HTML elements dynamically.

   Key components and functionalities:

   - The calendar is initialized by calling the `initializeCalendar` function.
   
   - The `initializeCalendar` function sets up event listeners for navigation icons and then calls the `manipulate` function to generate and display the calendar.

   - The `manipulate` function calculates and generates the HTML for the calendar based on the current month and year. It dynamically adds date entries with appropriate styling for active and inactive dates.

   - The calendar includes navigation icons for moving to the previous and next months.

   - The code uses an array of month names to display the current month.

   - To use this code, you need corresponding HTML elements in your web page, including navigation icons and elements for displaying the current month and dates.

   Source Code: https://www.geeksforgeeks.org/how-to-design-a-simple-calendar-using-javascript/
   --includes the css and html
   Updated: May 9, 2023
   Author: Not specified
*/




document.getElementById('openCalendar').addEventListener('click', function () {
    document.getElementById('calendarModal').style.display = 'block';
    initializeCalendar();
});
// Add an event listener to the element with the id 'openCalendar' and call the initializeCalendar function when clicked
// Function to initialize the calendar
function closeCalendarModal() {
    document.getElementById('calendarModal').style.display = 'none';
}



document.getElementById('openCalendar').addEventListener('click', function () {
    initializeCalendar(); });
        // Get the current date
    function initializeCalendar() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();

    // Select relevant DOM elements
    const day = document.querySelector(".calendar-dates");
    const currdate = document.querySelector(".calendar-current-date");
    const prenexIcons = document.querySelectorAll(".calendar-navigation span");
 // Array of month names
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // Function to generate and display the calendar

    function manipulate() {
        let dayone = new Date(year, month, 1).getDay();
        let lastdate = new Date(year, month + 1, 0).getDate();
        let dayend = new Date(year, month, lastdate).getDay();
        let monthlastdate = new Date(year, month, 0).getDate();
        let lit = "";
        // Loop to add the last dates of the previous month
        for (let i = dayone; i > 0; i--) {
            lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
        }
        // Loop to add the dates of the current month
        for (let i = 1; i <= lastdate; i++) {            // Check if the current date is today

            let isToday = i === date.getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? "active" : "";
            lit += `<li class="${isToday}">${i}</li>`;
        }
        // Loop to add the first dates of the next month

        for (let i = dayend; i < 6; i++) {
            lit += `<li class="inactive">${i - dayend + 1}</li>`
        }
        // Update the text of the current date element with the formatted current month and year
        currdate.innerText = `${months[month]} ${year}`;
        day.innerHTML = lit;        // Update the HTML of the dates element with the generated calendar

    }

    manipulate();
    // Attach a click event listener to each navigation icon

    prenexIcons.forEach(icon => {
        icon.addEventListener("click", () => {
                        // Check if the icon is "calendar-prev" or "calendar-next"
                    month = icon.id === "calendar-prev" ? month - 1 : month + 1;
            // Check if the month is out of range

            if (month < 0 || month > 11) {
                date = new Date(year, month, new Date().getDate());
                year = date.getFullYear();
                month = date.getMonth();
            } else {                // Set the date to the current date

                date = new Date();
            }
            // Call the manipulate function to update the calendar display

            manipulate();
        });
    });
}


