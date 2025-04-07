// backend/controllers/loanController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new loan application
 */
export const createLoanApplication = async (req: Request, res: Response) => {
  try {
    const { amount, purpose } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const loan = await prisma.loanApplication.create({
      data: {
        amount,
        purpose,
        userId,
      },
    });

    return res.status(201).json({ message: "Loan application created", loan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating loan application" });
  }
};

/**
 * Get all loan applications (based on user role)
 */
export const getLoanApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    console.log(role);
    if (!userId || !role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let loans;

    if (role === "ADMIN") {
      loans = await prisma.loanApplication.findMany({
        include: {
          user: true,
          verifier: true,
          approver: true,
        },
      });
    } else if (role === "VERIFIER") {
      loans = await prisma.loanApplication.findMany({
        where: {
          OR: [
            { verifierId: userId },
            { status: "PENDING" }
          ]
        },
        include: {
          user: true,
        },
      });
    } else {
      loans = await prisma.loanApplication.findMany({
        where: { userId },
        include: {
          verifier: true,
          approver: true,
        },
      });
    }

    return res.status(200).json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return res.status(500).json({ message: "Error fetching loan applications" });
  }
};
// Get user by role
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true }
    });

    const verifiers = await prisma.user.findMany({
      where: { role: "VERIFIER" },
      select: { id: true, name: true, email: true, role: true }
    });

    return res.status(200).json({ admins, verifiers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// Update User role 
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["ADMIN", "VERIFIER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ message: "Could not update user role" });
  }
};


// Delete User by role 
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Could not delete user" });
  }
};


/**
 * Verifier: Verify a loan application
 */
export const verifyLoanApplication = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== "VERIFIER") {
      return res.status(403).json({ message: "Only verifiers can verify applications" });
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "VERIFIED",
        verifierId: userId,
      },
    });

    return res.status(200).json({ message: "Loan application verified", loan: updatedLoan });
  } catch (error) {
    console.error("Error verifying loan:", error);
    return res.status(500).json({ message: "Error verifying loan application" });
  }
};

/**
 * Verifier: Reject a loan application
 */
export const rejectLoanApplication = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== "VERIFIER") {
      return res.status(403).json({ message: "Only verifiers can reject applications" });
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "REJECTED",
        verifierId: userId,
      },
    });

    return res.status(200).json({ message: "Loan application rejected", loan: updatedLoan });
  } catch (error) {
    console.error("Error rejecting loan:", error);
    return res.status(500).json({ message: "Error rejecting loan application" });
  }
};

export const updateLoanStatus = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;
    const { status } = req.body;
   console.log(role, status)
    // Validate status input
    const validStatuses = ["PENDING", "VERIFIED", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    // Optional: Define role-specific permission logic
    if (role === "VERIFIER" && status === "APPROVED") {
      return res.status(403).json({ message: "Verifier cannot approve loans." });
    }

    if (role !== "VERIFIER" && role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const updatedLoan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: {
        status,
        verifierId: role === "VERIFIER" ? userId : undefined, // only set if VERIFIER
      },
    });

    return res.status(200).json({ message: `Loan application marked as ${status}`, loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan status:", error);
    return res.status(500).json({ message: "Failed to update loan status" });
  }
};