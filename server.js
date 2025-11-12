import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "8Hh@9Ii@",
  database: "chirag_fitness"
});

app.post("/api/signup", async (req, res) => {
  const { name, age, email, address } = req.body;
  try {
    await pool.execute(
      "INSERT INTO signups (name, age, email, address) VALUES (?,?,?,?)",
      [name, age, email, address]
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.json({ ok: false, msg: "Email already exists" });
    console.log(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(3000, () => console.log("✅ API running at http://localhost:3000"));
