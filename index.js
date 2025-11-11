const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_URI || "mongodb+srv://homeNest:2EjwCBYxVnCwVH3m@cluster0.cbri3dy.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
     const db = client.db("HomeNestBD");
  const properties = db.collection("properties");
//find
//findOne
app.get("/all-properties", async (req, res) => {
  const data = await properties.find().toArray();
  res.send(data);
});

//POST Method
//insertOne
//insertMany
app.post("/all-properties",async(req,res)=>{
  const data1=req.body
  console.log(data1)
  const result=await properties.insertOne(data1)
  res.send({
    success:true,
    result
  })
})




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);





 
   


//  Routes
app.get("/", (req, res) => res.send("🏡 HomeNest API running"));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
