const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amu9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("doctors_portal");
        const appointmentsCollections = database.collection("appointments");
        const usersCollections = database.collection("users");

        app.get("/appointments", async (req, res) => {
            let date = req.query.date;
            const query = { email: req.query.email, date: date };
            const cursor = appointmentsCollections.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

        app.post("/appointments", async (req, res) => {
            const appointments = req.body;
            const result = await appointmentsCollections.insertOne(
                appointments
            );
            console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post("/users", async (req, res) => {
            const users = req.body;
            const result = await usersCollections.insertOne(users);
            console.log(result);
            res.json(result);
        });

        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });

        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            console.log(req.headers.authorization)
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollections.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result);
        });

        console.log("Server Connected");
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Doctor Portal Server is Started");
});

app.listen(port, () => {
    console.log(`Listing to port :${port}`);
});
