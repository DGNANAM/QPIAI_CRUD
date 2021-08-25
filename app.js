const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var mongoose = require("mongoose");

var dbUrl = "mongodb+srv://Gnanam:Gnanam123@cluster0.al4hg.mongodb.net/test";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Schema = mongoose.Schema({
  name: String,
  id: Number,
});
const Model = mongoose.model("test", Schema);

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Sucessfully connected");
  })
  .catch((error) => {
    console.log("DB connection issue", error);
  });

app.get("/", (request, response) => {
  return response.json({ Message: "Welcome to express application" });
});

app.post("/post", async (request, response) => {
  console.log(request.body);
  if (!request.body.name || !request.body.id) {
    return response
      .status(400)
      .send({ Message: "Id or Name is Missing in request body " });
  }
  const post1 = await Model.find({
    $or: [{ name: request.body.name }, { id: request.body.id }],
  }).exec();
  if (post1.length > 0) {
    return response.send({ error: "Given name or Id already exits" });
  }
  var post = new Model({ name: request.body.name, id: request.body.id });
  post
    .save()
    .then((result) => {
      console.log(result);
      return response.send(result);
    })
    .catch((error) => {
      return response.status(500).send({
        Message: error.message || "Error in DB Post data",
      });
    });
});

app.put("/put/:id", async (request, response) => {
  console.log(request.params.id);
  var put = await Model.find({ id: request.params.id }).exec();
  console.log(put);
  if (put.length > 0) {
    Model.updateOne(
      { id: request.params.id },
      { $set: { name: request.body.name } }
    )
      .then((result) => {
        if (!result) {
          return response.status(404).send({ message: "Not found" });
        }
        return response.send(result);
      })
      .catch((error) => {
        return response
          .status(500)
          .send({ message: error.message || "Error in updating with id" });
      });
  } else {
    var put = new Model({ name: request.body.name, id: request.params.id });
    put
      .save()
      .then((result) => {
        console.log(result);
        return response.send(result);
      })
      .catch((error) => {
        return response.status(500).send({
          Message: error.message || "Error in DB Post data",
        });
      });
  }
});

app.delete("/delete/:id", (request, response) => {
  Model.deleteOne({ id: request.params.id })
    .remove()
    .exec()
    .then((result) => {
      console.log(result);
      if (!result) {
        response.status(400).send({
          message: "Not found id:" + request.params.id,
        });
      }
      response.send({ message: "Id deleted successfully" });
    })
    .catch((err) => {
      response
        .status(500)
        .send({ message: err.message || "Could not delete the id from DB" });
    });
});

const Port = process.env.Port || 8080;
app.listen(Port, () => {
  console.log("Server listening the port:", Port);
});
