"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Types
interface AuthPayload {
  email: string;
  password: string;
  role: "USER" | "ADMIN" | "VERIFIER";
  name?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "USER" | "ADMIN" | "VERIFIER";
}

const LoginRegister: React.FC = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    const payload: AuthPayload = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (!isLogin) payload.name = formData.name;

    try {
      const response = await axios.post(endpoint, payload, {
        baseURL: "https://loan-management-lpsh.onrender.com",
        withCredentials: true,
      });

      alert(response.data.message || "Success!");

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Redirect based on role
      switch (formData.role) {
        case "USER":
          router.push("/user");
          break;
        case "ADMIN":
          router.push("/admin");
          break;
        case "VERIFIER":
          router.push("/verifier");
          break;
        default:
          router.push("/");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data || err.message);
        alert(err.response?.data?.message || "Something went wrong");
      } else {
        console.error("Unexpected error", err);
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Select Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="ADMIN">Admin</option>
            <option value="VERIFIER">Verifier</option>
            <option value="USER">User</option>
          </select>

          {!isLogin && (
            <input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded"
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />

          {!isLogin && (
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded"
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
