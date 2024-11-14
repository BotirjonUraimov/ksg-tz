import express, { Router } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import eventEmitter from "app";

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ksg",
});

const query = (text: string, params?: any[]) => pool.query(text, params);

const router: Router = express.Router();

router.post("/deduct", async (req, res) => {
  // const userId = parseInt(req.params.id, 10);
  // const { amount } = req.body;
  const { userId, amount } = req.body;

  // Validate input
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount provided." });
  }
  try {
    // Begin a transaction
    await query("BEGIN");

    // Fetch the user's current balance
    const userResult = await query(
      "SELECT balance FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentBalance = parseFloat(userResult.rows[0].balance);

    // Check if the balance is sufficient
    if (currentBalance < amount) {
      // Rollback transaction if balance is insufficient
      await query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Calculate the new balance
    const newBalance = currentBalance - amount;

    // Update the user's balance
    await query("UPDATE users SET balance = $1 WHERE id = $2", [
      newBalance,
      userId,
    ]);

    // Commit the transaction
    await query("COMMIT");

    // Return the new balance
    return res.json({ message: "Balance deducted successfully.", newBalance });
  } catch (error) {
    // Rollback transaction in case of any errors
    await query("ROLLBACK");
    console.error("Error processing transaction:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing the transaction." });
  }
});

eventEmitter.on("dataChanged", () => {
  console.log("Data changed!");
});

export default router;
