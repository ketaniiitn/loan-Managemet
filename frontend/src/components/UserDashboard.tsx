'use client'; // 👈 required for client-side navigation
import React from "react";
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
const UserDashboard: React.FC = () => {
  const router = useRouter();
  interface LoanApplication {
    id: string;
    loanOfficer?: string;
    amount: number;
    dateApplied: string;
    status: string;
  }

  const [applications, setApplications] = useState<LoanApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT stored after login
        const response = await fetch("http://34.45.133.198/api/loan/all",  {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          console.error("Failed to fetch applications:", await response.text());
          return;
        }
  
        const data = await response.json();
        interface LoanAPIResponse {
          id: string;
          amount: number;
          createdAt: string;
          status: string;
          verifier?: {
            name?: string;
          };
        }
        
        const formatted = data.loans.map((loan: LoanAPIResponse): LoanApplication => ({
          id: loan.id,
          amount: loan.amount,
          dateApplied: new Date(loan.createdAt).toLocaleDateString(),
          status: loan.status,
          loanOfficer: loan.verifier?.name || "N/A",
        }));
        
        setApplications(formatted);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
  
    fetchApplications();
  }, []);

    return (
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-green-800 text-white p-4 flex justify-between items-center">
          <div className="text-xl font-bold">CREDIT APP</div>
          <nav className="flex space-x-4">
            <a href="#" className="hover:underline">
              Home
            </a>
            <a href="#" className="hover:underline">
              Payments
            </a>
            <a href="#" className="hover:underline">
              Budget
            </a>
            <a href="#" className="hover:underline">
              Card
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-200 text-black p-2 rounded-full">
              <span className="material-icons">notifications</span>
            </button>
            <div className="flex items-center space-x-2">
              <span>User</span>
              

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

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Balance and Actions */}
          <section className="bg-white p-6 rounded shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Balance</h2>
                <p className="text-2xl font-bold text-green-800">₦0.0</p>
              </div>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => router.push("/loanapplication")}
              >
                Get A Loan
              </button>
            </div>
            <div className="mt-4 flex space-x-4">
              <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Borrow Cash
              </button>
              <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Transact
              </button>
              <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Deposit Cash
              </button>
            </div>
          </section>

          {/* Search Bar */}
          <section className="mb-6">
            <input
              type="text"
              placeholder="Search for loans"
              className="w-full p-4 border border-gray-300 rounded"
            />
          </section>

          {/* Applied Loans Table */}
          <section>
            <h2 className="text-xl font-bold mb-4">Applied Loans</h2>
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-4">Loan Officer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date Applied</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-t">
                    <td className="p-4">
                      {application.status === "Verified"
                        ? application.loanOfficer || "N/A"
                        : "N/A"}
                    </td>
                    <td className="p-4">₦{application.amount.toLocaleString()}</td>
                    <td className="p-4">{application.dateApplied}</td>
                    <td
                      className={`p-4 ${
                        application.status === "Pending"
                          ? "text-yellow-500"
                          : application.status === "Verified"
                          ? "text-green-500"
                          : application.status === "Rejected"
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {application.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    );
  };

export default UserDashboard;