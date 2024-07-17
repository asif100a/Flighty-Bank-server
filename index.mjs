import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';

const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

const hashPassword = async (password) => {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;

    } catch (error) {
        throw error
    }
};

// Running server on the port
app.get('/', (req, res) => {
    res.send(`Server running-----------`);
});

// Listen the server
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});