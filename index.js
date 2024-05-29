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

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

// Get info about phonebook
app.get("/info", (_request, response) => {
  Person.find({})
    .then((persons) => {
      response.send(
        `<p>Phonebook has info for ${persons.length} people<br/>${new Date()}</p>`,
      );
    })
    .catch((error) => next(error));
});

// Get all persons in phonebook
app.get("/api/persons", (_request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// Get a person in phonebook
app.get("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // const person = persons.find((person) => person.id === id);
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Delete person from phonebook
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((_result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

// Add new person to phonebook
app.post("/api/persons", (request, response, next) => {
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
      newPersonInstance
        .save()
        .then((newPerson) => {
          response.json(newPerson);
        })
        .catch((error) => next(error));
    }
  }
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    response.status(400).json({ error: "name is missing" });
  } else if (!body.number) {
    response.status(400).json({ error: "number is missing" });
  } else {
    const updatedPerson = {
      name: body.name,
      number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
      .then((updatedPerson) => {
        response.json(updatedPerson);
      })
      .catch((error) => next(error));
  }
});

const errorHandler = (error, _request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    // Format of id in request is wrong
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
