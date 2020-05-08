//the returned objet of Joi is a class
const Joi = require("joi");
const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const filePath = __dirname + "/" + "course.json";

// const courses = [
//   { id: 1, name: "course1" },
//   { id: 2, name: "course2" },
//   { id: 3, name: "course3" },
// ];

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/courses", (req, res) => {
  fs.readFile(filePath, (err, content) => {
    if (err) throw err;
    res.send(content);
  });
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body); //object destructuring
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  fs.readFile(filePath, "utf-8", (err, content) => {
    if (err) res.status(400).send(err);
    let course = JSON.parse(content);

    const newCourse = {
      id: course.length + 1,
      name: req.body.name,
    };
    course.push(newCourse);

    const json = JSON.stringify(course, null, "");

    fs.writeFile(filePath, json, (err) => {
      if (err) res.status(400).send(err);
      res.send(newCourse);
    });
  });
});

app.get("/api/courses/:id", (req, res) => {
  fs.readFile(filePath, (err, content) => {
    if (err) throw err;
    let courses = JSON.parse(content);
    let courseFiltered = courses.find((c) => c.id === parseInt(req.params.id));

    if (!courseFiltered) {
      res.status(404).send("The course with the given ID was not found");
      return;
    }
    res.send(courseFiltered);
  });
});

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

app.put("/api/courses/:id", (req, res) => {
  //Looking for the course
  //if not existing return 404 Not found
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    res.status(404).send("The course with the given ID was not found");
    return;
  }

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

app.delete("/api/courses/:id", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    let courses = JSON.parse(data);
    let courseFiltered = courses.find((c) => c.id === parseInt(req.params.id));

    if (courseFiltered) {
      const index = courses.indexOf(courseFiltered);
      const courseSpliced = courses.splice(index, 1);
      const newText = JSON.stringify(courses, null, "");
      fs.writeFile(filePath, newText, (err) => {
        if (err) res.status(404).send(err);
        res.send(courseSpliced);
      });
    } else {
      res.status(404).send("The course with the given ID was not found");
      return;
    }
  });
});
