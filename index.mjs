import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';
import mongodb from 'mongodb';
const { MongoClient, ServerApiVersion } = mongodb;

const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_CLIENT}:${process.env.MONGO_PASS}@cluster0.bu1vbif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Try to save user data to the database
    app.post('/user_info', async (req, res) => {
        const userInfo = req.body;
        console.log('User Data:', userInfo);
        const PIN = req.body.PIN;
        try {
            // Generate a salt
            const salt = await bcrypt.genSalt(10);
            // Hash the password with the salt
            const hashedPassword = await bcrypt.hash(PIN, salt);
            console.log(hashedPassword);
            return res.status(201).send('user data created successfully');
    
        } catch (error) {
            return res.status(500).send('internal server error');
        }
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


// Running server on the port
app.get('/', (req, res) => {
    res.send(`Server running-----------`);
});

// Listen the server
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});