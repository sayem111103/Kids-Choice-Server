const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
  maxPoolSize: 10
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((error)=>{
      if(error){
        console.log(error);
        return;
      }
    });
    const toyCollection = client.db("ToyDB").collection("allToy");

    app.get("/allToy", async (req, res) => {
      const allToy = await toyCollection
        .find({})
        .sort({ subCategory: -1 })
        .toArray();
      res.send(allToy);
    });
    
    app.get('/allToy/:subCatagory', async(req, res)=>{
      const catagory = req.params.subCatagory;
      console.log(catagory)
      const query = {subCategory: catagory}
      const result = await toyCollection.find(query).toArray();
      res.send(result)
    })

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
