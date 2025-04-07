"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from 'next/image';
interface LoanApplication {
  id: string;
  activity: string;
  user: {
    name: string;
  };
  date: string;
  status: string;
}

const VerifierDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchApplications = async () => {
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/api/loan/all", {
        params: { role: "VERIFIER" },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (Array.isArray(data.loans)) {
        setApplications(data.loans);
      } else {
        console.error("Expected 'loans' to be an array:", data.loans);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) {
      alert("Token not found. Please login again.");
      return;
    }

    try {
      // Optimistically update UI
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      await axios.put(
        `http://localhost:5000/api/loan/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(`Status updated to ${newStatus} successfully!`);
      setHoveredId(null);
      await fetchApplications();
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update. Reverting change...");
      await fetchApplications();
    }
  };

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
            <li className="hover:bg-green-700 p-2 rounded"><a href="#">Settings</a></li>
          </ul>
        </nav>
        <div className="p-4">
          <button className="w-full bg-red-600 hover:bg-red-700 p-2 rounded">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Verifier - Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-200 p-2 rounded-full">🔔</button>
            <div className="flex items-center space-x-2">
              <span>Verifier</span>
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
        <section className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">{applications.length}</h2>
            <p className="text-gray-500">Loans</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">100</h2>
            <p className="text-gray-500">Borrowers</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">450,000</h2>
            <p className="text-gray-500">Savings</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">30</h2>
            <p className="text-gray-500">Repaid Loans</p>
          </div>
        </section>

        {/* Applied Loans Table */}
        <section>
          <h2 className="text-xl font-bold mb-4">Applied Loans</h2>
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4">Activity</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const isActionable = app.status === "PENDING";
                return (
                  <tr key={app.id} className="border-t">
                    <td className="p-4">{app.activity}</td>
                    <td className="p-4">{app.user?.name || "N/A"}</td>
                    <td className="p-4">
                      {new Date(app.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block text-left">
                        <button
                          disabled={!isActionable}
                          onClick={() =>
                            isActionable
                              ? setHoveredId(hoveredId === app.id ? null : app.id)
                              : null
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            app.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          } ${!isActionable ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        >
                          {app.status}
                        </button>

                        {isActionable && hoveredId === app.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusChange(app.id, "VERIFIED")}
                                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleStatusChange(app.id, "REJECTED")}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default VerifierDashboard;
