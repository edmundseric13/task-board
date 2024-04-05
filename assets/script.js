let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = parseInt(localStorage.getItem("nextId"), 10) || 1;

function generateTaskId() {
  localStorage.setItem("nextId", nextId + 1);
  return nextId++;
}

function createTaskCard(task) {
    const card = $("<div>").addClass("task-card").attr("id", "task-" + task.id);
    const title = $("<h3>").text(task.title);
    const description = $("<p>").text(task.description);
    const dueDate = dayjs(task.dueDate);
    const dueDateText = $("<p>").text(`Due Date: ${dueDate.format("YYYY-MM-DD")}`);
    const today = dayjs();
    const daysUntilDue = dueDate.diff(today, 'day');

    if (daysUntilDue < 0) {
      card.addClass("overdue");
    } else if (daysUntilDue <= 3) {
      card.addClass("due-soon");
    }
  //   const now = dayjs();
  //   const formattedDueDate = dayjs(task.dueDate, "YYYY-MM-DD");
  //   if (now.isSame(taskDueDate, 'day')) {
  //     taskCard.addClass('bg-warning text-white');
  // } else if (now.isAfter(taskDueDate)) {
  //     taskCard.addClass('bg-danger text-white');
  //     cardDeleteBtn.addClass('border-light');
  // }


    const deleteButton = $("<button>").text("Delete").click(function() {
      handleDeleteTask(task.id);
    });

    card.append(title, description, dueDateText, deleteButton);
    return card;
}

function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();
    taskList.forEach(task => {
      const card = createTaskCard(task);
      if (task.status === "to-do") {
        $("#todo-cards").append(card);
      } else if (task.status === "in-progress") {
        $("#in-progress-cards").append(card);
      } else if (task.status === "done") {
        $("#done-cards").append(card);
      }
      makeTasksDraggable();
    });
}

function makeTasksDraggable() {
    $(".task-card").draggable({
        revert: "invalid",
        containment: "document",
        start: function(event, ui) {
            $(this).addClass("dragging");
        },
        stop: function(event, ui) {
            $(this).removeClass("dragging");
        }
    });
}

function setupDroppableLanes() {
    $(".lane").droppable({
        accept: ".task-card",
        drop: function(event, ui) {
            const newStatus = this.id;
            const taskId = ui.draggable.attr('id').split('-')[1];
            updateTaskStatus(taskId, newStatus);
        }
    });
}

function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskName").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();
  const status = $("#taskStatus").val();
  const task = { id: generateTaskId(), title, description, dueDate, status };
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $('#formModal').modal('hide');
  $("#add-task-form").each(function() {
    this.reset();
  });
}

function handleDeleteTask(taskId) {
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

function handleDrop(event, ui) {
    const taskId = ui.draggable.attr('id').split('-')[1];
    const newStatus = $(this).data('status');
    const taskIndex = taskList.findIndex(task => task.id == taskId);
  
    if (taskIndex !== -1) {
      taskList[taskIndex].status = newStatus;

      if (newStatus === "done") {
      ui.draggable.removeClass("overdue");
      ui.draggable.removeClass("due-soon");
      }
      localStorage.setItem("tasks", JSON.stringify(taskList));
      renderTaskList();
    }
  }

$(document).ready(function () {
  renderTaskList();
  setupDroppableLanes();
  $("#add-task-form").on("submit", handleAddTask);
  $(".lane").droppable({ drop: handleDrop });
  $("#taskDueDate").datepicker({ dateFormat: "yy-mm-dd" });
});