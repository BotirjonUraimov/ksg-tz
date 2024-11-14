"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/ksg",
});
const query = (text, params) => pool.query(text, params);
const router = express_1.default.Router();
router.post("/deduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = parseInt(req.params.id, 10);
    // const { amount } = req.body;
    const { userId, amount } = req.body;
    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount provided." });
    }
    try {
        // Begin a transaction
        yield query("BEGIN");
        // Fetch the user's current balance
        const userResult = yield query("SELECT balance FROM users WHERE id = $1 FOR UPDATE", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        const currentBalance = parseFloat(userResult.rows[0].balance);
        // Check if the balance is sufficient
        if (currentBalance < amount) {
            // Rollback transaction if balance is insufficient
            yield query("ROLLBACK");
            return res.status(400).json({ message: "Insufficient balance." });
        }
        // Calculate the new balance
        const newBalance = currentBalance - amount;
        // Update the user's balance
        yield query("UPDATE users SET balance = $1 WHERE id = $2", [
            newBalance,
            userId,
        ]);
        // Commit the transaction
        yield query("COMMIT");
        // Return the new balance
        return res.json({ message: "Balance deducted successfully.", newBalance });
    }
    catch (error) {
        // Rollback transaction in case of any errors
        yield query("ROLLBACK");
        console.error("Error processing transaction:", error);
        return res
            .status(500)
            .json({ message: "An error occurred while processing the transaction." });
    }
}));
exports.default = router;
