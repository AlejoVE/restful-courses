//the returned objet of Joi is a class
const Joi = require("joi");
const express = require("express");
const app = express();

app.use(express.json());

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body); //object destructuring
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    res.status(404).send("The course with the given ID was not found");
  res.send(course);
});

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

app.put("/api/courses/:id", (req, res) => {
  //Looking for the course
  //if not existing return 404 Not found
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    res.status(404).send("The course with the given ID was not found");

  //validate de course
  const { error } = validateCourse(req.body); //object destructuring
  //if invalid, return 400 Bad Request
  if (error) {
    //400 convention for Bad Response
    res.status(400).send(error.details[0].message);
    return;
  }
  //Update course
  course.name = req.body.name;
  //Return updated course to the client
  res.send(course);
});

function validateCourse(course) {
  const schema = {
    //name should be a string with a minimum of 3 characters
    name: Joi.string().min(3).required(),
  };

  return Joi.validate(course, schema);
}
