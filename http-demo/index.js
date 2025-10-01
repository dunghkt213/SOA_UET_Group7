const express = require("express");
const app = express();
app.use(express.json()); 

let users = [
  { id: 1, name: "Hieu", email: "hieu@example.com" },
  { id: 2, name: "Kien", email: "kien@example.com" },
];

app.use((req, res, next) => {
  res.set("X-Powered-By", "REST-Demo");
  next();
});

app.get("/users", (req, res) => {
  res.set("Cache-Control", "public, max-age=30");
  res.status(200).json({
    data: users,
    count: users.length,
  });
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const u = users.find((x) => x.id === id);
  if (!u) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json(u);
});

app.post("/users", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = { id, name, email };
  users.push(newUser);

  res.set("Location", `/users/${id}`);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: "PUT requires full representation: name & email" });
  }
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  users[idx] = { id, name, email };
  res.status(200).json(users[idx]);
});

app.patch("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const { name, email } = req.body || {};
  if (name !== undefined) users[idx].name = name;
  if (email !== undefined) users[idx].email = email;

  res.status(200).json(users[idx]);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = users.length;
  users = users.filter((u) => u.id !== id);
  if (users.length === before) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(204).send();
});

app.get("/_demo/500", (req, res) => {
  res.status(500).json({ error: "Internal Server Error (demo)" });
});

app.get("/_demo/429", (req, res) => {
  res.set("Retry-After", "30"); // giây
  res.status(429).json({ error: "Too Many Requests (demo)" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`REST demo listening on http://localhost:${PORT}`);
});
