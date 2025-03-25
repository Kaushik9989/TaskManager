const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const task = require("./models/task.js");
const ExpressError = require("./expressError.js");

// Setup
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Database connection
main()
  .then(() => console.log("Connection successful"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/tasks");
}

// HOME
app.get("/", async (req, res, next) => {
    try {
      const tasks = await task.find();
      res.render("home.ejs", { tasks });
    } catch (err) {
      next(err);
    }
  });

  
// TASKS
app.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await task.find();
    res.render("home.ejs", { tasks });
  } catch (err) {
    next(err);
  }
});


// ADD TASK
app.get("/tasks/new", (req, res) => {
  res.render("new.ejs");
});



// SHOW POSTED TASKS
app.post("/tasks", async (req, res, next) => {
  try {
    const { taskName, taskDesc } = req.body;
    const newTask = new task({
      title: taskName,
      description: taskDesc,
      completed: false,
      created_at: new Date(),
    });
    await newTask.save();
    res.redirect("/tasks");
  } catch (err) {
    next(err);
  }
});


// EDIT TASKS
app.get("/tasks/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const Task = await task.findById(id);
    if (!Task) {
      throw new ExpressError(404, "Task not found");
    }
    res.render("edit.ejs", { Task });
  } catch (err) {
    next(err);
  }
});



// MARK AS DONE FEATURE
app.post("/tasks/:id/toggle", async (req, res, next) => {
  try {
    const { id } = req.params;
    const Task = await task.findById(id);
    if (!Task) {
      throw new ExpressError(404, "Task not found");
    }
    Task.completed = !Task.completed;
    await Task.save();
    res.redirect("/tasks");
  } catch (err) {
    next(err);
  }
});



// UPDATE TASK
app.put("/tasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskName, taskDesc } = req.body;
    await task.findByIdAndUpdate(id, {
      title: taskName,
      description: taskDesc,
      updated_at: new Date(),
    });
    res.redirect("/tasks");
  } catch (err) {
    next(err);
  }
});



// DELETE TASK
app.delete("/tasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await task.findByIdAndDelete(id);
    res.redirect("/tasks");
  } catch (err) {
    next(err);
  }
});



// SHOW TASK
app.get("/tasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const Task = await task.findById(id);
    if (!Task) {
      throw new ExpressError(404, "Task not found");
    }
    res.render("show.ejs", { Task });
  } catch (err) {
    next(err);
  }
});



app.get("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});



// Error handling
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error.ejs", { message });
});



// Server start
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});