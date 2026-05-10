"use client";

import { useState } from "react";

interface RSVPData {
  name: string;
  email: string;
  attending: string;
  guestCount: string;
  guestNames: string;
  dietaryRestrictions: string;
  welcomeEvent: string;
  sundayBrunch: string;
  optionalStockholmEvents: string;
  message: string;
  honeypot: string;
}

export default function RSVPForm() {
  const [formData, setFormData] = useState<RSVPData>({
    name: "",
    email: "",
    attending: "",
    guestCount: "",
    guestNames: "",
    dietaryRestrictions: "",
    welcomeEvent: "",
    sundayBrunch: "",
    optionalStockholmEvents: "",
    message: "",
    honeypot: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-lg text-[#35452C]">Thank you — your RSVP has been received.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#2D2923]">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#2D2923]">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="attending" className="block text-sm font-medium text-[#2D2923]">
          Attending? *
        </label>
        <select
          id="attending"
          name="attending"
          value={formData.attending}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="guestCount" className="block text-sm font-medium text-[#2D2923]">
          Guest Count
        </label>
        <input
          type="number"
          id="guestCount"
          name="guestCount"
          value={formData.guestCount}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="guestNames" className="block text-sm font-medium text-[#2D2923]">
          Guest Names
        </label>
        <textarea
          id="guestNames"
          name="guestNames"
          value={formData.guestNames}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-[#2D2923]">
          Dietary Restrictions
        </label>
        <textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="welcomeEvent" className="block text-sm font-medium text-[#2D2923]">
          Welcome Event Attendance
        </label>
        <select
          id="welcomeEvent"
          name="welcomeEvent"
          value={formData.welcomeEvent}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="sundayBrunch" className="block text-sm font-medium text-[#2D2923]">
          Sunday Brunch Attendance
        </label>
        <select
          id="sundayBrunch"
          name="sundayBrunch"
          value={formData.sundayBrunch}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="optionalStockholmEvents" className="block text-sm font-medium text-[#2D2923]">
          Optional Stockholm Events/Interests
        </label>
        <textarea
          id="optionalStockholmEvents"
          name="optionalStockholmEvents"
          value={formData.optionalStockholmEvents}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#2D2923]">
          Message to the Couple
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-[#A8B58A] bg-white px-3 py-2 shadow-sm focus:border-[#6F7A4B] focus:outline-none"
        />
      </div>

      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-[#6F7A4B] px-4 py-2 text-white hover:bg-[#35452C] focus:outline-none disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Submit RSVP"}
      </button>

      {status === "error" && (
        <p className="text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}