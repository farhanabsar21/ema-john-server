const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;

require('dotenv').config();
app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihxuz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("emaJohnStore").collection("products");
  const orderCollection = client.db("emaJohnStore").collection("orders"); // order gula mongo te alada kore pabo

  app.post("/addProducts", (req, res)=>{
      const product = req.body;
      //collection.insertMany(product) eta keno baad dilo bujhi nai
      // eta baad diye insertOne dise
      collection.insertOne(product)
      .then(result => {
          console.log(result.insertedCount);
      })
  })
  // load all products 
  app.get("/products", (req, res)=>{
    //   collection.find({}).limit(20)
    collection.find({})
      .toArray((err, docs) => {
          res.send(docs);
      })
  })

  // load a single product
  app.get("/products/:key", (req, res)=>{
    //   collection.find({}).limit(20)
    collection.find({key: req.params.key})
      .toArray((err, docs) => {
        //res.send(docs); evabe likhsilam prothome..ete kore product er detail ashtesilo na 
        // kenona product array er vitor silo ta amra docs[0] single product banay nilam
          res.send(docs[0]);
      })
  })

  // load selected product for review with key
  app.post("/productsByKeys", (req, res)=>{
      const productKeys = req.body;
      // ektu critical..ekhane mongodb use krte hobe built in $in diye..eta onk gula khuje
      collection.find({key: { $in: productKeys } })
      .toArray((err, docs)=>{
          res.send(docs)
      }) 
  })

  //setting order data
    app.post("/addOrders", (req, res) => {
        const order = req.body;
        //collection.insertMany(product) eta keno baad dilo bujhi nai
        // eta baad diye insertOne dise
        orderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
});

app.get("/", (req, res)=>{
    res.send("hello ema watson!");
})

app.listen(port, () => {
  console.log("node is running");
})
