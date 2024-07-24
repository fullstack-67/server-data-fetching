import helmet from "helmet";
import express from "express";
import morgan from "morgan";
import { getTodos, createTodos, deleteTodo, updateTodo } from "./db";

const app = express();
app.set("view engine", "pug");
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  // "http://localhost:35729", // Livereload
];
const styleSources = ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"];
const connectSources = [
  "'self'",
  // "ws://localhost:35729" // Livereload
];
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: scriptSources,
        scriptSrcElem: scriptSources,
        styleSrc: styleSources,
        connectSrc: connectSources,
      },
      reportOnly: true,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

// Simulate latency
app.use(function (req, res, next) {
  setTimeout(next, 500);
});

app.get("/", async (req, res) => {
  // console.log(req.query);
  const message = req.query?.message ?? "";
  const todos = await getTodos();
  res.render("pages/index", {
    todos,
    message,
    mode: "ADD",
    curTodo: { id: "", todoText: "" },
  });
});

app.post("/create", async (req, res) => {
  const todoText = req.body?.todoText ?? "";
  try {
    await createTodos(todoText);
    res.redirect("/");
  } catch (err) {
    res.redirect(`/?message=${err}`);
  }
});

app.post("/delete", async (req, res) => {
  // console.log(req.body);
  const id = req.body?.curId ?? "";
  try {
    await deleteTodo(id);
    res.redirect("/");
  } catch (err) {
    res.redirect(`/?message=${err}`);
  }
});

app.post("/edit", async (req, res) => {
  // console.log(req.body);
  const id = req.body?.curId ?? "";
  try {
    const todos = await getTodos();
    const curTodo = todos.find((el) => el.id === id);
    if (!id || !curTodo) {
      throw new Error("Invalid ID");
    }
    res.render("pages/index", {
      message: "",
      mode: "EDIT",
      todos,
      curTodo,
    });
  } catch (err) {
    res.redirect(`/?message=${err}`);
  }
});

app.post("/update", async (req, res) => {
  // console.log(req.body);
  try {
    const id = req.body?.curId ?? "";
    const todoTextUpdated = req.body?.todoText ?? "";
    await updateTodo(id, todoTextUpdated);
    res.redirect("/");
  } catch (err) {
    res.redirect(`/?message=${err}`);
  }
});

// Running app
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
