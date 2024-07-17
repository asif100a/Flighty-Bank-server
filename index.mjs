import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
    // MongoDB database and collections
    const db = client.db("flightyBank");
    const userCollection = db.collection('users');

    // Generate jwt
    app.post('/jwt', async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1d' });
      return res.status(200).send({ token });
    });

    // bcrypt hash password generation
    const getHashedPassword = async(password) => {
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password with the salt
      const hashed = await bcrypt.hash(password, salt);
      return hashed;
    };

    // Compare hash password with stored password
    const getComparedPassword = async(password, hashPassword) => {
      const isCompared = await bcrypt.compare(password, hashPassword);
      console.log('password: ', password);
      console.log('hashPassword', hashPassword);
      if(!isCompared) {
        return false;
      }
      return true;
    };

    // Try to save user data to the database
    app.post('/user_info', async (req, res) => {
      const userInfo = req.body;
      const PIN = req.body.PIN;

      // Find the existing user
      const query = { email: req.body.email }
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.status(409).send('User already exist');
      }

      try {
        const hashedPassword = await getHashedPassword(PIN);
        // Packed data to save in the db collection
        const data = { ...userInfo, PIN: hashedPassword }
        console.log('packed data', data);
        const result = await userCollection.insertOne(data);
        return res.status(201).send(result);

      } catch (error) {
        return res.status(500).send('internal server error');
      }
    })

    // Login user
    app.post('/login', async (req, res) => {
      const data = req.body;
      const emailOrPhone = data.number_email;
      const password = data.PIN;
      // console.log(data.number_email)
      try {
        // Identify the query either email or phone number
        let query = {};
        if (emailOrPhone.includes('@')) {
          console.log('Email ok', emailOrPhone);
          query = { email: data.number_email }

        } else {
          query = { mobile_number: emailOrPhone }
          console.log(emailOrPhone);
        }

        // Find the user
        const findedUser = await userCollection.findOne(query);

        if (!findedUser) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        console.log(findedUser);

        // Match the given password with stored password
        const isMatched = await getComparedPassword(password, findedUser.PIN);
        console.log('password matched:', isMatched)
        if (!isMatched) {
          return res.send('Invalid PIN');
        }
        return res.status(200).send({message: 'Login successful'});

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