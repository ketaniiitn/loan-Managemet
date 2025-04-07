// backend/routes/loan.ts
import express from "express";
import {
  createLoanApplication,
  getLoanApplications,
  verifyLoanApplication,
  rejectLoanApplication,
  updateLoanStatus,
  getUsersByRole,
  updateUserRole,
  deleteUser
} from "../controllers/loanController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// User submits loan application
router.post("/create", authenticateToken, createLoanApplication);

// Get loans based on user role
router.get("/all", authenticateToken, getLoanApplications);

// Verifier actions
router.put("/verify/:id", authenticateToken, verifyLoanApplication);
router.put("/reject/:id", authenticateToken, rejectLoanApplication);
// Approver and Verifier actions
router.put("/:id/status", authenticateToken, updateLoanStatus)
//admin action
router.get("/users/by-role", authenticateToken, getUsersByRole);
router.put("/users/:id/role", authenticateToken, updateUserRole);
router.delete("/users/:id", authenticateToken, deleteUser);

export default router;
