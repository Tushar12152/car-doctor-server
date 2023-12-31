const express = require('express');
// const jwt=require('jsonwebtoken')
// const cookieParser=require("cookie-parser")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt=require('jsonwebtoken')
const cookieParser=require("cookie-parser")
const cors = require('cors');
const port=process.env.PORT || 5002

const app= express()

// middleWare
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(cookieParser())
app.use(express.json())








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tgzt8q2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware

const logger=(req,res,next)=>{
    console.log("log:info",req.method,req.url);
    next();
}

const verifyToken=(req,res,next)=>{
   const token=req?.cookies?.token;
   console.log("token in middleWare",token)
   next()
}




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("car-doctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("booking");
  

//Authentication related

   app.post('/jwt',(req,res)=>{
       const user=req.body;
       console.log(req.body);
       const token=jwt.sign(user,process.env.SECRET,{expiresIn:"1h"})

       res
       .cookie("token",token ,{
           httpOnly:true,
           secure:false,

       })
       .send({success:true})
   })
   
   app.post("/logout",(req,res)=>{
        const user= req.body;
        res.clearCookie("token",{maxAge:0}).send({success:true})
   })








   //sevves  related apis 

    app.get('/services',async(req,res)=>{
        const cursor=serviceCollection.find();
        const result=await cursor.toArray();
        res.send(result)
    })

    app.get('/services/:id',async(req,res)=>{
        const id= req.params.id;
        const query={_id: new ObjectId(id)}

        const options = {
      
          // Include only the `title` and `imdb` fields in the returned document
          projection: {  title: 1, price: 1,service_id:1,img:1 },
        };


        const result=await serviceCollection.findOne(query,options)
        res.send(result)

    })


    app.post('/bookings',async(req,res)=>{
        const booking=req.body;
        // console.log(booking)
        const result=await bookingCollection.insertOne(booking)
        res.send(result)

    })

    app.get('/bookings',logger,verifyToken,async(req,res)=>{
      // console.log("cook cook cookkiihbh",req.cookies);
      let query={}
      if(req.query?.email){
            query={email:req.query.email}
      }
       const result=await bookingCollection.find().toArray()
       res.send(result)
    })

    app.delete('/bookings/:id',async(req,res)=>{
      const id=req.params.id;
      // console.log(id)
      const query={_id: new ObjectId(id)}
      const result=await bookingCollection.deleteOne(query)
      res.send(result)

    })

    app.patch("/bookings/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedBooking=req.body;
      console.log(updatedBooking)

      const updateDoc = {
        $set: {
          status:updatedBooking.status
        },
      };

      const result=await bookingCollection.updateOne(filter,updateDoc)
      res.send(result)

    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/',(req,res)=>{
    res.send("data will comming soon............")
})

app.listen(port,()=>{
    console.log(`this site is going on port ${port}`)
})