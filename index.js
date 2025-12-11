require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;

// --- Firebase Initialization ---
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64")?.toString(
  "utf-8"
);
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// -------------------------------

const app = express();

// --- Global Middleware ---
// Note: Using cors() without options allows all origins, which is okay for testing
app.use(cors());
app.use(express.json());
// -------------------------

// --- JWT Middleware ---
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (!token) return res.status(401).send({ message: "Unauthorized Access!" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized Access!", err });
  }
};
// ----------------------

app.get("/", (req, res) => {
  res.send("Hello Ritu World!");
});

// --- MongoDB Setup ---
const client = new MongoClient(
  `mongodb+srv://Ritu27:0P4Zey56E8itZ0zV@cluster0.5ylkwje.mongodb.net/?appName=Cluster0`,
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

async function run() {
  try {
    await client.connect(); // ✅ CRITICAL FIX: Establish MongoDB connection

    const db = client.db("university-db");
    const universityCollection = db.collection("universities"); // Public Route: Get all data
    // const usersCollection = db.collection("users");

    // const verifyADMIN = async (req, res, next) => {
    //   const email = req.tokenEmail;
    //   const user = await usersCollection.findOne({ email });
    //   if (user?.role !== "admin")
    //     return res
    //       .status(403)
    //       .send({ message: "Admin only Actions!", role: user?.role });

    //   next();
    // };
    // const verifySELLER = async (req, res, next) => {
    //   const email = req.tokenEmail;
    //   const user = await usersCollection.findOne({ email });
    //   if (user?.role !== "seller")
    //     return res
    //       .status(403)
    //       .send({ message: "Seller only Actions!", role: user?.role });

    //   next();
    // };
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

    app.post("/data", verifyJWT, async (req, res) => {
      const versitydata = { ...req.body, postedBy: req.tokenEmail };
      const result = await universityCollection.insertOne(versitydata);
      res.send(result);
    });
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
