require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgjk6dy.mongodb.net/bookCatalog`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("bookCatalog");
    const bookCollection = db.collection("book");

    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
    });

    app.post("/book", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.post("/book/:id", async (req, res) => {
      const bookId = req.params.id;
      const {
        title,
        author,
        genre,
        publicationYear,
        publisher,
        rating,
        price,
        image,
        reviews,
      } = req.body;

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        {
          $set: {
            title,
            author,
            genre,
            publicationYear,
            publisher,
            rating,
            price,
            image,
            reviews,
          },
        }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("book not found");
        res.json({ error: "book not found " });
        return;
      }

      console.log("book updated successfully");
      res.json({ message: "book updated successfully" });
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post("/review/:id", async (req, res) => {
      const bookId = req.params.id;
      const review = req.body;

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { reviews: review } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("book not found or review not added");
        res.json({ error: "book not found or review not added" });
        return;
      }

      console.log("review added successfully");
      res.json({ message: "review added successfully" });
    });

    app.get("/review/:id", async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Book Server Live!");
});

app.listen(port, () => {
  console.log(`Book Server listening on port ${port}`);
});
