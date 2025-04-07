import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new loan application
 */
export const createLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, purpose } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const loan = await prisma.loanApplication.create({
      data: {
        amount,
        purpose,
        userId,
      },
    });

    res.status(201).json({ message: "Loan application created", loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating loan application" });
  }
};

/**
 * Get all loan applications (based on user role)
 */
export const getLoanApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let loans;

    if (role === "ADMIN") {
      loans = await prisma.loanApplication.findMany({
        include: { user: true, verifier: true, approver: true },
      });
    } else if (role === "VERIFIER") {
      loans = await prisma.loanApplication.findMany({
        where: {
          OR: [{ verifierId: userId }, { status: "PENDING" }],
        },
        include: { user: true },
      });
    } else {
      loans = await prisma.loanApplication.findMany({
        where: { userId },
        include: { verifier: true, approver: true },
      });
    }

    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Error fetching loan applications" });
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    const verifiers = await prisma.user.findMany({
      where: { role: "VERIFIER" },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(200).json({ admins, verifiers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["ADMIN", "VERIFIER"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Could not update user role" });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Could not delete user" });
  }
};

/**
 * Verifier: Verify a loan application
 */
export const verifyLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== "VERIFIER") {
      res.status(403).json({ message: "Only verifiers can verify applications" });
      return;
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "VERIFIED",
        verifierId: userId,
      },
    });

    res.status(200).json({ message: "Loan application verified", loan: updatedLoan });
  } catch (error) {
    console.error("Error verifying loan:", error);
    res.status(500).json({ message: "Error verifying loan application" });
  }
};

/**
 * Verifier: Reject a loan application
 */
export const rejectLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== "VERIFIER") {
      res.status(403).json({ message: "Only verifiers can reject applications" });
      return;
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "REJECTED",
        verifierId: userId,
      },
    });

    res.status(200).json({ message: "Loan application rejected", loan: updatedLoan });
  } catch (error) {
    console.error("Error rejecting loan:", error);
    res.status(500).json({ message: "Error rejecting loan application" });
  }
};

/**
 * Admin/Verifier: Update loan status
 */
export const updateLoanStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;
    const { status } = req.body;

    const validStatuses = ["PENDING", "VERIFIED", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status provided." });
      return;
    }

    if (role === "VERIFIER" && status === "APPROVED") {
      res.status(403).json({ message: "Verifier cannot approve loans." });
      return;
    }

    if (role !== "VERIFIER" && role !== "ADMIN") {
      res.status(403).json({ message: "Unauthorized role." });
      return;
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status,
        verifierId: role === "VERIFIER" ? userId : undefined,
      },
    });

    res.status(200).json({ message: `Loan application marked as ${status}`, loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan status:", error);
    res.status(500).json({ message: "Failed to update loan status" });
  }
};
