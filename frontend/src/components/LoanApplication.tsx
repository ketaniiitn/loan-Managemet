"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface LoanFormData {
  fullName: string;
  amount: string;
  tenure: string;
  employmentStatus: string;
  reason: string;
  employmentAddress1: string;
  employmentAddress2: string;
  agreeTerms: boolean;
  agreeCreditInfo: boolean;
}

const LoanApplicationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoanFormData>({
    fullName: "",
    amount: "",
    tenure: "",
    employmentStatus: "",
    reason: "",
    employmentAddress1: "",
    employmentAddress2: "",
    agreeTerms: false,
    agreeCreditInfo: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms || !formData.agreeCreditInfo) {
      alert("You must agree to the terms and credit information disclosure.");
      return;
    }

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        purpose: formData.reason || "Not specified",
      };
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://34.45.133.198/api/loan/create",
        payload,
        { withCredentials: true ,
        
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Loan application submitted successfully!");
      console.log("Backend Response:", res.data);
      router.push("/user");
    }  catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Submission error:", error);
        alert(error.response?.data?.message || "Submission failed.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-8 rounded-lg w-full max-w-3xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">APPLY FOR A LOAN</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full name as it appears on bank account"
            value={formData.fullName}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
            required
          />

          <input
            type="text"
            name="amount"
            placeholder="How much do you need?"
            value={formData.amount}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
            required
          />

          <input
            type="number"
            name="tenure"
            placeholder="Loan tenure (in months)"
            value={formData.tenure}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
            required
          />

          <input
            type="text"
            name="employmentStatus"
            placeholder="Employment status"
            value={formData.employmentStatus}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
            required
          />

          <textarea
            name="reason"
            placeholder="Reason for loan"
            value={formData.reason}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
            rows={2}
          />

          <input
            type="text"
            name="employmentAddress1"
            placeholder="Employment address"
            value={formData.employmentAddress1}
            onChange={handleChange}
            className="border p-2 rounded col-span-1"
          />

          <input
            type="text"
            name="employmentAddress2"
            placeholder="Employment address"
            value={formData.employmentAddress2}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          />
        </div>

        <div className="mt-6 space-y-3 text-sm text-gray-700">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1"
            />
            I have read the important information and accept that by completing
            this application I will be bound by the terms.
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeCreditInfo"
              checked={formData.agreeCreditInfo}
              onChange={handleChange}
              className="mt-1"
            />
            Any personal and credit information entered may be disclosed from
            time to time to other lenders, court bureaus or credit reporting
            agencies.
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LoanApplicationForm;
