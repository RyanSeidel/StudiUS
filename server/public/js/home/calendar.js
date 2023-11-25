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


