"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface LoanApplication {
  id: string
  activity: string
  user: {
    name: string
  }
  date: string
  status: string
}

const AdminDashboard: React.FC = () => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) setToken(storedToken)
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return

      try {
        const response = await axios.get("https://loan-management-lpsh.onrender.com/api/loan/all", {
          params: { role: "VERIFIER" },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const data = response.data
        if (Array.isArray(data.loans)) setApplications(data.loans)
        else console.error("Expected 'loans' to be an array:", data.loans)
      } catch (error) {
        console.error("Error fetching applications:", error)
      }
    }

    fetchApplications()
  }, [token])

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) {
      alert("Token not found. Please login again.")
      return
    }

    try {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      )

      await axios.put(
        `https://loan-management-lpsh.onrender.com/api/loan/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      setHoveredId(null)
      alert(`Status updated to ${newStatus} successfully!`)
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update status. Reverting change...")
      // Refetch to revert
      const refetch = async () => {
        try {
          const response = await axios.get("https://loan-management-lpsh.onrender.com/api/loan/all", {
            params: { role: "VERIFIER" },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          setApplications(response.data.loans || [])
        } catch (err) {
          console.error("Error during revert fetch:", err)
        }
      }
      await refetch()
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 text-center font-bold text-xl">CREDIT APP</div>
        <nav className="flex-1">
          <ul className="space-y-2 p-4">
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Dashboard</a></li>
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Borrowers</a></li>
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Loans</a></li>
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Repayments</a></li>
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Reports</a></li>
            <li className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-white">
              <button onClick={() => router.push("/adminsetting")}>Admin Setting</button>
            </li>
          </ul>
        </nav>
        <div className="p-4">
          <button className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-white">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-200 p-2 rounded-full">🔔</button>
            <div className="flex items-center space-x-2">
              <span className="text-black">Admin</span>
              <Image
                src="https://via.placeholder.com/40"
                alt="Verifier Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow"><h2 className="text-lg font-bold text-black">200</h2><p className="text-black">Active Users</p></div>
          <div className="bg-white p-4 rounded shadow"><h2 className="text-lg font-bold text-black">100</h2><p className="text-black">Borrowers</p></div>
          <div className="bg-white p-4 rounded shadow"><h2 className="text-lg font-bold text-black">550,000</h2><p className="text-black">Cash Disbursed</p></div>
          <div className="bg-white p-4 rounded shadow"><h2 className="text-lg font-bold text-black">1,000,000</h2><p className="text-black">Cash Received</p></div>
        </section>

        {/* Loan Table */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-black mb-4">Applied Loans</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app, index) => {
                  const isActionable = ["PENDING", "VERIFIED"].includes(app.status)
                  return (
                    <tr key={app.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                        <Image
  src={`https://i.pravatar.cc/150?img=${index + 10}`}
  alt="avatar"
  width={40}
  height={40}
  className="rounded-full"
  unoptimized
/>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.activity}</div>
                            <div className="text-sm text-gray-500">Updated {Math.floor(Math.random() * 5) + 1} day(s) ago</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{app.user?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">on {new Date(app.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(app.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="relative inline-block text-left">
                          <button
                            disabled={!isActionable}
                            onClick={() => isActionable && setHoveredId(hoveredId === app.id ? null : app.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                              app.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : app.status === "VERIFIED"
                                ? "bg-green-100 text-green-800"
                                : app.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            } ${!isActionable ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                          >
                            {app.status}
                          </button>

                          {isActionable && hoveredId === app.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                              <div className="py-1">
                                {app.status !== "APPROVED" && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, "APPROVED")}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                                  >
                                    Approve
                                  </button>
                                )}
                                {app.status !== "REJECTED" && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, "REJECTED")}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard