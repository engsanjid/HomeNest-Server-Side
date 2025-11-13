const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { verifyTokenMiddleware } = require("./firebaseAuth");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_URI; 

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
  try {
    const { search, sort } = req.query;

    const filter = {};
    if (search) {
      filter.propertyName = { $regex: search, $options: "i" }; 
    }

    let sortOption = {};
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "date_asc") sortOption = { createdAt: 1 };
    else if (sort === "date_desc") sortOption = { createdAt: -1 };
    else sortOption = { createdAt: -1 };

    const data = await properties.find(filter).sort(sortOption).toArray();
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});

app.get("/details/:id", async (req, res) => {
  const {id} = req.params;
  const result=await properties.findOne({_id:new ObjectId(id)})
  console.log(id)
  res.send({
    success:true,
    result
  })
});

//POST Method
//insertOne
//insertMany
app.post("/all-properties",verifyTokenMiddleware,async(req,res)=>{
  const data1=req.body
  console.log(data1)
    data1.createdAt = new Date();
  const result=await properties.insertOne(data1)
  res.send({
    success:true,
    result
  })
})



// My Properties - get by user email
app.get("/my-properties/:email",verifyTokenMiddleware, async (req, res) => {
  const { email } = req.params;
  const data = await properties.find({ postedBy: email }).toArray();
  res.send(data);
});

// Delete Property
app.delete("/property/:id",verifyTokenMiddleware, async (req, res) => {
  const { id } = req.params;
  const result = await properties.deleteOne({ _id: new ObjectId(id) });
  res.send({ success: true, result });
});

// Update property
app.put("/property/:id",verifyTokenMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await properties.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  res.send({
    success: result.modifiedCount > 0,
  });
});



app.post("/reviews",verifyTokenMiddleware, async (req, res) => {
  const review = req.body;
  review.propertyId = review.propertyId.toString(); 
  const result = await db.collection("reviews").insertOne(review);
  res.send({ success: true, result });
});

app.get("/reviews/:propertyId", async (req, res) => {
  const { propertyId } = req.params;
  const result = await db
    .collection("reviews")
    .find({ propertyId: propertyId.toString() }) 
    .sort({ createdAt: -1 })
    .toArray();
  res.send(result);
});


app.get("/my-reviews/:email",verifyTokenMiddleware, async (req, res) => {
  const { email } = req.params;
  const reviews = await db
    .collection("reviews")
    .find({ reviewerEmail: email })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(reviews);
});


app.get("/featured-properties", async (req, res) => {
  try {
    const data = await db
      .collection("properties")
      .find()
         .sort({ _id: -1 })  
      .limit(6)
      .toArray();

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);





 
   


//  Routes
app.get("/", (req, res) => res.send(" HomeNest API running"));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
