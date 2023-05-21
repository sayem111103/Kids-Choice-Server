const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Kids Choice");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.glhjkho.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((error) => {
      if (error) {
        console.log(error);
        return;
      }
    });

    const toyCollection = client.db("ToyDB").collection("allToy");
    const indexKey = { name: 1 };
    const indexOption = { name: "toyname" };
    const index = await toyCollection.createIndex(indexKey, indexOption);

    app.get("/allToy", async (req, res) => {
      const allToy = await toyCollection.find({}).limit(20).toArray();
      res.send(allToy);
    });

    app.get("/allToy/:subCatagory", async (req, res) => {
      const catagory = req.params.subCatagory;
      const query = { subCategory: catagory };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/mytoy", async (req, res) => {
      const email = req.query.email;
      const query = { sellerEmail: email };
      if (!req.query?.email) {
        return res.status(404).send({ error: true, message: "not found" });
      } else {
        const result = await toyCollection
          .find(query)
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      }
    });

    app.get("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toydetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toysearch/:name", async (req, res) => {
      const toyName = req.params.name;
      const query = { name: { $regex: toyName, $options: "i" } };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/allToy", async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const toyBody = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = {
        upsert: true,
      };
      const updateDoc = {
        $set: {
          img: toyBody.img,
          name: toyBody.name,
          sellerName: toyBody.sellerName,
          sellerEmail: toyBody.sellerEmail,
          subCategory: toyBody.subCategory,
          price: toyBody.price,
          rating: toyBody.rating,
          availableQuantity: toyBody.availableQuantity,
          description: toyBody.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.delete("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
