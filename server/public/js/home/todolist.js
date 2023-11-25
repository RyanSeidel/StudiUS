/*
   TASK LIST JAVASCRIPT

   This JavaScript code is responsible for managing a simple task list on a web page. It allows users to add tasks, view them, and delete them. The code uses the DOM (Document Object Model) to interact with HTML elements.

   Key components and functionalities:

   - Event listener is set up to trigger actions when the DOM content is loaded.
   
   - The code selects relevant HTML elements using `getElementById`.

   - The `addTask` function is used to add a new task to the task list. It first checks if the input is empty and displays an alert if so. Then, it creates a task item with a task text and a delete button. Clicking the delete button removes the task item.

   - Event listeners are added to the "Add" button to call the `addTask` function when clicked.

   Note: To use this code, you should have corresponding HTML elements with matching IDs in your web page. You may also need to include appropriate CSS styles for the visual presentation of the task list.
*/
// Define closeModal and addTaskModal functions in the global scope
document.addEventListener("DOMContentLoaded", function () {
    const taskModal = document.getElementById("taskModal");
    const openTaskModalButton = document.getElementById("openTaskModal");
    const closeModalButton = document.querySelector(".close");
    const taskInputModal = document.getElementById("taskInputModal");
    const tasksContainer = document.getElementById("tasks");

    function openModal() {
        taskModal.style.display = "block";
    }

    function closeModal() {
        taskModal.style.display = "none";
        taskInputModal.value = "";
    }

    function addTaskModal() {
        const taskText = taskInputModal.value.trim();
        
        if (taskText === "") {
            alert("Please enter a task!");
            return;
        }

        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        const taskTextElement = document.createElement("div");
        taskTextElement.classList.add("task-text");
        taskTextElement.textContent = taskText;

        const deleteButton = document.createElement("div");
        deleteButton.classList.add("delete-task");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            taskItem.remove();
        });

        taskItem.appendChild(taskTextElement);
        taskItem.appendChild(deleteButton);
        tasksContainer.appendChild(taskItem);

        closeModal();
    }

    openTaskModalButton.addEventListener("click", openModal);
    closeModalButton.addEventListener("click", closeModal);
    window.addEventListener("click", function (event) {
        if (event.target === taskModal) {
            closeModal();
        }
    });
});
//dark mode
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Check user preference from local storage
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";

    // Set initial theme based on user preference
    if (isDarkMode) {
        body.classList.add("dark-mode");
    } else {
        body.classList.remove("dark-mode");
    }

    // Event listener for dark mode toggle button
    darkModeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");
        // Update user preference in local storage
        const newMode = body.classList.contains("dark-mode") ? "enabled" : "disabled";
        localStorage.setItem("darkMode", newMode);
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Check user preference from local storage
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";

    // Set initial theme based on user preference
    if (isDarkMode) {
        body.classList.add("dark-mode");
    }

    // Event listener for dark mode toggle button
    darkModeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");
        // Update user preference in local storage
        const newMode = body.classList.contains("dark-mode") ? "enabled" : "disabled";
        localStorage.setItem("darkMode", newMode);
    });
});
