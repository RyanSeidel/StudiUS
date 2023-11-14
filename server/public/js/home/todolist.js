
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

