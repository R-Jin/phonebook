const express = require('express')
const cors = require('cors')
const app = express()
var morgan = require('morgan')

// Create morgan token
morgan.token('data', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// Get all persons
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// Get number of persons and date
app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length}</p><p>${new Date()}</p>`)
})

// Get specific person
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    let person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

// Delete specific person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    let id = Math.floor(Math.random() * 100000)
    while (persons.some(person => person.id === id)) {
        id = Math.floor(Math.random() * 100000)
    }
    return id
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.post('/api/persons', (request, response) => {
    const newPerson = request.body

    if (!newPerson.name || !newPerson.number) {
        response.status(400).json({
            error: "Name or number is missing from the request"
        })
    }

    if (persons.some(person => person.name === newPerson.name)) {
        response.status(400).json({
            error: "Name must be unique"
        })
    }

    newPerson.id = generateId() 

    persons = persons.concat(newPerson)

    response.json(newPerson)
})


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})