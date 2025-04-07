"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "VERIFIER"
}

const AdminSetting: React.FC = () => {
  const [verifiers, setVerifiers] = useState<User[]>([])
  const [admins, setAdmins] = useState<User[]>([])
//   const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchData = async () => {
      try {
        const res = await axios.get("https://loan-management-lpsh.onrender.com/api/loan/users/by-role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setVerifiers(res.data.verifiers)
        setAdmins(res.data.admins)

        // // Optional: decode token to check current user's role
        // const userData = JSON.parse(atob(token.split(".")[1]))
        // setUserRole(userData.role)

      } catch (err) {
        console.error("Failed to load users", err)
      }
    }

    fetchData()
  }, [])

  const promoteToAdmin = async (id: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await axios.put(
        `https://loan-management-lpsh.onrender.com/api/loan/users/${id}/role`,
        { role: "ADMIN" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      alert("User promoted to Admin")
      window.location.reload()
    } catch (err) {
      console.error("Error promoting user", err)
    }
  }

  const deleteVerifier = async (id: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await axios.delete(`https://loan-management-lpsh.onrender.com/api/loan/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert("Verifier deleted")
      window.location.reload()
    } catch (err) {
      console.error("Error deleting user", err)
    }
  }
//    console.log("User Role:", userRole);
//   if (userRole !== "ADMIN") {
//     return <p className="p-6 text-red-600 font-semibold">Access denied: Only Admins can view this page.</p>
//   }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Admins</h2>
        <ul className="list-disc pl-6">
          {admins.map((admin) => (
            <li key={admin.id}>{admin.name} - {admin.email}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Verifiers</h2>
        <ul className="space-y-3">
          {verifiers.map((verifier) => (
            <li key={verifier.id} className="flex justify-between items-center bg-white p-3 rounded shadow">
              <div>
                <p className="font-medium">{verifier.name}</p>
                <p className="text-sm text-gray-600">{verifier.email}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => promoteToAdmin(verifier.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => deleteVerifier(verifier.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AdminSetting
