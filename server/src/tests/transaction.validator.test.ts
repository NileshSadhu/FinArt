import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  transactionSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator.js";

const VALID_ACCOUNT_1 = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const VALID_ACCOUNT_2 = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";

describe("Transaction Validator Tests", () => {
  describe("INCOME validation", () => {
    it("accepts valid income with a single positive entry", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "October Salary",
        type: "INCOME",
        entries: [{ accountId: VALID_ACCOUNT_1, amount: 50000 }],
      });
      assert.equal(result.success, true);
    });

    it("rejects income with a negative or zero entry", () => {
      const resultZero = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Zero Salary",
        type: "INCOME",
        entries: [{ accountId: VALID_ACCOUNT_1, amount: 0 }],
      });
      assert.equal(resultZero.success, false);

      const resultNeg = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Negative Salary",
        type: "INCOME",
        entries: [{ accountId: VALID_ACCOUNT_1, amount: -500 }],
      });
      assert.equal(resultNeg.success, false);
    });

    it("rejects income with multiple entries", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Double income",
        type: "INCOME",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: 100 },
          { accountId: VALID_ACCOUNT_2, amount: 200 },
        ],
      });
      assert.equal(result.success, false);
    });
  });

  describe("EXPENSE validation", () => {
    it("accepts valid expense with a single negative entry", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Grocery shopping",
        type: "EXPENSE",
        entries: [{ accountId: VALID_ACCOUNT_1, amount: -1500 }],
      });
      assert.equal(result.success, true);
    });

    it("rejects expense with a positive or zero entry", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Invalid expense",
        type: "EXPENSE",
        entries: [{ accountId: VALID_ACCOUNT_1, amount: 1500 }],
      });
      assert.equal(result.success, false);
    });
  });

  describe("TRANSFER validation", () => {
    it("accepts valid transfer with 2 distinct accounts summing to zero", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Transfer Bank to Cash",
        type: "TRANSFER",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: -5000 },
          { accountId: VALID_ACCOUNT_2, amount: 5000 },
        ],
      });
      assert.equal(result.success, true);
    });

    it("rejects transfer when entries do not sum to zero", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Unbalanced transfer",
        type: "TRANSFER",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: -5000 },
          { accountId: VALID_ACCOUNT_2, amount: 4000 },
        ],
      });
      assert.equal(result.success, false);
    });

    it("rejects transfer between the same account", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Self transfer",
        type: "TRANSFER",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: -5000 },
          { accountId: VALID_ACCOUNT_1, amount: 5000 },
        ],
      });
      assert.equal(result.success, false);
    });
  });

  describe("LEND & REPAYMENT validation", () => {
    it("accepts valid lend transaction summing to zero", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Lent money to friend",
        type: "LEND",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: -10000 },
          { accountId: VALID_ACCOUNT_2, amount: 10000 },
        ],
      });
      assert.equal(result.success, true);
    });

    it("accepts valid repayment transaction summing to zero", () => {
      const result = transactionSchema.safeParse({
        transactionDate: "2026-10-17",
        description: "Partial loan repayment received",
        type: "REPAYMENT",
        entries: [
          { accountId: VALID_ACCOUNT_1, amount: 5000 },
          { accountId: VALID_ACCOUNT_2, amount: -5000 },
        ],
      });
      assert.equal(result.success, true);
    });
  });

  describe("UPDATE transaction validation", () => {
    it("accepts partial updates when at least one field is provided", () => {
      const result = updateTransactionSchema.safeParse({
        description: "Updated description",
      });
      assert.equal(result.success, true);
    });

    it("rejects empty update object", () => {
      const result = updateTransactionSchema.safeParse({});
      assert.equal(result.success, false);
    });
  });
});
