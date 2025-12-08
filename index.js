const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Ritu World!");
});

const uri =
  "mongodb+srv://Ritu27:0P4Zey56E8itZ0zV@cluster0.5ylkwje.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("university-db");
    const universityCollection = db.collection("universities");

    app.get("/data", async (req, res) => {
      const result = await universityCollection.find().toArray();
      res.send(result);
    });

    app.get("/data/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const result = await universityCollection.findOne({
        _id: new ObjectId(id),
      });
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
