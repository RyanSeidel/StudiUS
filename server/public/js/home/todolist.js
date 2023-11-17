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

    document.addEventListener("DOMContentLoaded", function () {
        // Selecting elements
        const taskInput = document.getElementById("taskInput");
        const addTaskButton = document.getElementById("addTask");
        const tasksContainer = document.getElementById("tasks");

        // Function to add a new task
        function addTask() {
            const taskText = taskInput.value.trim();
            if (taskText === "") {
                alert("Please enter a task!");
                return;
            }

            // Create task item
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-item");

            // Create task text
            const taskTextElement = document.createElement("div");
            taskTextElement.classList.add("task-text");
            taskTextElement.textContent = taskText;

            // Create delete button
            const deleteButton = document.createElement("div");
            deleteButton.classList.add("delete-task");
            deleteButton.textContent = "Delete";

            // Add click event to delete button
            deleteButton.addEventListener("click", function () {
                tasksContainer.removeChild(taskItem);
            });

            // Append elements to task item
            taskItem.appendChild(taskTextElement);
            taskItem.appendChild(deleteButton);

            // Append task item to the tasks container
            tasksContainer.appendChild(taskItem);

            // Clear input field
            taskInput.value = "";
        }

        // Add click event to "Add" button
        addTaskButton.addEventListener("click", addTask);
    });

