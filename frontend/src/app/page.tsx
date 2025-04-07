"use client";
import React from "react";
import { jwtDecode } from "jwt-decode";
import AdminPage from "./admin/page";
import LoginPage from "./login/page";
import UserPage from "./user/page";
import VerifierPage from "./verifier/page";

interface MyTokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "VERIFIER" | "USER";
  // any other fields you include in the JWT
}

export default function Home() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return <LoginPage />;
  }

  try {
    const decoded = jwtDecode<MyTokenPayload>(token);
    const role = decoded.role;

    switch (role) {
      case "ADMIN":
        return <AdminPage />;
      case "VERIFIER":
        return <VerifierPage />;
      case "USER":
        return <UserPage />;
      default:
        return <LoginPage />;
    }
  } catch (error) {
    console.error("Invalid token", error);
    return <LoginPage />;
  }
  // return (
  //   <div>
  //     <UserPage />

  //   </div>)
}
