// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5uGmM7zu3W8J-xGcNngT2A3m0VgCX3LE",
  authDomain: "todo-web-547a1.firebaseapp.com",
  projectId: "todo-web-547a1",
  storageBucket: "todo-web-547a1.appspot.com",
  messagingSenderId: "24532435669",
  appId: "1:24532435669:web:fe2b5ca22ebfb2ff74585c",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Globals
let currentUser = null;
let currentEditTaskId = null;

// DOM
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const userEmail = document.getElementById("userEmail");
const taskCount = document.getElementById("taskCount");
const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");

// Auth listener
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    userEmail.textContent = user.email;
    loadTasks();
  } else {
    window.location.href = "index.html";
  }
});

// Add Task
async function addTask() {
  const text = taskInput.value.trim();
  if (!text || !currentUser) return;

  try {
    await db.collection("tasks").add({
      text,
      userId: currentUser.uid,
      completed: false,
      // 👇 This is the key change:
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    });

    taskInput.value = "";
    showToast("✅ Task added successfully!", "success");
    loadTasks(); // refresh task list immediately
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}

window.addTask = addTask;

// Load Tasks
function loadTasks() {
  try {
    db.collection("tasks")
      .where("userId", "==", currentUser.uid)
      .orderBy("createdAt", "asc") // ✅ must match the index
      .onSnapshot((snapshot) => {
        taskList.innerHTML = "";
        let count = 0;

        if (snapshot.empty) {
          taskList.innerHTML = `
            <div class="empty-state">
              <h3>No tasks yet</h3>
              <p>Add your first task above to get started!</p>
            </div>
          `;
        } else {
          snapshot.forEach((doc) => {
            const task = doc.data();
            if (!task.text) return;
            const li = createTaskElement(doc.id, task);
            taskList.appendChild(li);
            count++;
          });
        }

        taskCount.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;
      }, (error) => {
        if (error.code === "failed-precondition") {
          showToast(
            "⚠️ Firestore requires an index for this query. Click the error link in the console to create it.",
            "error"
          );
          console.error("🔥 Firestore index needed. Create it here:", error.message);
        } else {
          showToast("Error loading tasks: " + error.message, "error");
        }
      });
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}




// Create Task HTML
function createTaskElement(id, task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const created = task.createdAt ? task.createdAt.toDate().toLocaleDateString() : "Just now";

  li.innerHTML = `
    <div class="task-content">
      <div class="task-text">${task.text}</div>
      <div class="task-date">Created: ${created}</div>
    </div>
    <div class="task-actions">
      <button onclick="editTask('${id}', '${task.text.replace(/'/g, "\\'")}')" class="edit-btn">Edit</button>
      <button onclick="deleteTask('${id}')" class="delete-btn">Delete</button>
    </div>
  `;

  return li;
}

// Edit
function editTask(id, text) {
  currentEditTaskId = id;
  editTaskInput.value = text;
  editModal.style.display = "block";
}
window.editTask = editTask;

function closeEditModal() {
  editModal.style.display = "none";
  currentEditTaskId = null;
  editTaskInput.value = "";
}
window.closeEditModal = closeEditModal;

async function saveEditTask() {
  const newText = editTaskInput.value.trim();
  if (!newText || !currentEditTaskId) return;

  try {
    await db.collection("tasks").doc(currentEditTaskId).update({
      text: newText,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast("✅ Task updated!", "success");
    closeEditModal();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}
window.saveEditTask = saveEditTask;

// Delete
async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await db.collection("tasks").doc(id).delete();
    showToast("🗑️ Task deleted!", "success");
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}
window.deleteTask = deleteTask;

// Logout
async function logout() {
  await auth.signOut();
  showToast("Logged out", "success");
  setTimeout(() => (window.location.href = "index.html"), 1000);
}
window.logout = logout;

// Toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

// Enter key support
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});
editTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") saveEditTask();
});

// Click outside modal
window.onclick = (e) => {
  if (e.target === editModal) closeEditModal();
};
