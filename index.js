require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const url = process.env.MONGODB_URI;

console.log(`Connecting to ${url}`);

mongoose
  .connect(url)
  .then((_result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error.message}`);
  });

morgan.token("body", (request) => {
  return JSON.stringify(request.body);
});
const app = express();

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

// Get info about phonebook
app.get("/info", (_request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people<br/>${new Date()}</p>`,
  );
});

// Get all persons in phonebook
app.get("/api/persons", (_request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// Get a person in phonebook
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// Delete person from phonebook
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const getNewId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;

  return maxId + 1;
};

// Add new person to phonebook
app.post("/api/persons", (request, response) => {
  const newPerson = request.body;

  if (!newPerson.name) {
    response.status(400).json({ error: "name is missing" });
  } else if (!newPerson.number) {
    response.status(400).json({ error: "number is missing" });
  } else {
    if (
      persons.some(
        (person) => person.name.toLowerCase() === newPerson.name.toLowerCase(),
      )
    ) {
      response.status(400).json({ error: "name must be unique" });
    } else {
      const newPersonInstance = new Person({
        name: newPerson.name,
        number: newPerson.number,
      });
      newPersonInstance.save().then((newPerson) => {
        response.json(newPerson);
      });
    }
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
