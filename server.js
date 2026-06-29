const express = require("express");
const cors=require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let stays = [
  { id: 1, name: "Mountain Stay", location: "Manali" },
  { id: 2, name: "Village Stay", location: "Rajasthan" },
  { id: 3, name:"forest Stay",location:"kerala"}
];

// GET all stays
app.get("/stays", (req, res) => {
  res.json(stays);
});

// GET single stay
app.get("/stays/:id", (req, res) => {
  const stay = stays.find(s => s.id == req.params.id);

  if (!stay) {
    return res.status(404).json({ message: "Stay not found" });
  }

  res.json(stay);
});
app.put('/stays/:id', (req, res) => {
    res.json({
        message: "Stay updated successfully"
    });
});

// POST new stay
app.post("/stays", (req, res) => {
  const newStay = {
    id: stays.length + 1,
    name: req.body.name,
    location: req.body.location
  };

  stays.push(newStay);
  res.status(201).json(newStay);
});

// PUT update stay
app.put("/stays/:id", (req, res) => {
  const stay = stays.find(s => s.id == req.params.id);

  if (!stay) {
    return res.status(404).json({ message: "Stay not found" });
  }

  stay.name = req.body.name;
  stay.location = req.body.location;

  res.json(stay);
});

// DELETE stay
app.delete("/stays/:id", (req, res) => {
  stays = stays.filter(s => s.id != req.params.id);

  res.json({ message: "Stay deleted" });
});
app.get('/search', (req, res) => {
    res.json({
        message: "Search endpoint working"
    });
});

// Search endpoint
app.get("/search", (req, res) => {
  const keyword = req.query.name;

  const result = stays.filter(s =>
    s.name.toLowerCase().includes(keyword.toLowerCase())
  );

  res.json(result);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});