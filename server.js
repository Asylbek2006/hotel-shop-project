require('dotenv').config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

app.use(express.json());

const MONGO_URL = process.env.MONGO_URI || "mongodb://localhost:27017";
const PORT = process.env.PORT || 3000;
let db;

MongoClient.connect(MONGO_URL)
    .then(client => {
        db = client.db("shop"); // Task 10 бойынша база аты: shop
        console.log("MongoDB-ге қосылды");
        app.listen(PORT, () => console.log(`Сервер ${PORT} портында қосулы`));
    })
    .catch(err => console.error(err));

// Task 10: GET /api/products (Filtering, Sorting, Projection)
app.get("/api/products", async (req, res) => {
    try {
        const { category, minPrice, sort, fields } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (minPrice) filter.price = { $gte: Number(minPrice) };

        let options = {};
        if (sort === "price") options.sort = { price: 1 };

        if (fields) {
            options.projection = {};
            fields.split(",").forEach(f => options.projection[f] = 1);
        }

        const products = await db.collection("products").find(filter, options).toArray();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Қате орын алды" });
    }
});

// Басқа CRUD маршруттары (Task 11 үшін керек)
app.post("/api/products", async (req, res) => {
    const result = await db.collection("products").insertOne(req.body);
    res.status(201).json(result);
});