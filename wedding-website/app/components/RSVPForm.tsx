"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { rsvpContent } from "@/app/content/site";

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

const labelClass = "block text-xs font-medium uppercase tracking-[0.16em] text-[#35452C]";
const fieldClass =
  "mt-2 block w-full rounded-sm border border-[#A8B58A]/60 bg-[#F8F4EA] px-4 py-3 text-sm text-[#2D2923] shadow-none transition-colors placeholder:text-[#2D2923]/45 focus:border-[#35452C] focus:outline-none focus:ring-2 focus:ring-[#A8B58A]/25";
const textareaClass = `${fieldClass} min-h-28 resize-y leading-7`;

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
  const shouldReduceMotion = useReducedMotion();

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
      <motion.div
        className="mx-auto flex min-h-[28rem] max-w-xl flex-col items-center justify-center text-center"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-7 h-px w-28 bg-[#A8B58A]"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center" }}
          aria-hidden="true"
        />
        <p className="font-serif text-4xl leading-tight text-[#35452C]">
          J&amp;Z
        </p>
        <p className="mt-6 font-serif text-3xl leading-tight text-[#35452C]">
          {rsvpContent.success.title}
        </p>
        <p className="mt-4 text-base leading-8 text-[#2D2923]/76">
          {rsvpContent.success.body}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="attending" className={labelClass}>
          Will you be attending? *
        </label>
        <select
          id="attending"
          name="attending"
          value={formData.attending}
          onChange={handleChange}
          required
          className={fieldClass}
        >
          <option value="">Please choose</option>
          <option value="yes">Joyfully attending</option>
          <option value="no">Regretfully unable to attend</option>
        </select>
      </div>

      <div>
        <label htmlFor="guestCount" className={labelClass}>
          Number of guests
        </label>
        <input
          type="number"
          id="guestCount"
          name="guestCount"
          value={formData.guestCount}
          onChange={handleChange}
          min="0"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="guestNames" className={labelClass}>
          Guest names
        </label>
        <textarea
          id="guestNames"
          name="guestNames"
          value={formData.guestNames}
          onChange={handleChange}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className={labelClass}>
          Dietary Restrictions
        </label>
        <textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={handleChange}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor="welcomeEvent" className={labelClass}>
          Welcome Event Attendance
        </label>
        <select
          id="welcomeEvent"
          name="welcomeEvent"
          value={formData.welcomeEvent}
          onChange={handleChange}
          className={fieldClass}
        >
          <option value="">Please choose</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="sundayBrunch" className={labelClass}>
          Sunday Brunch Attendance
        </label>
        <select
          id="sundayBrunch"
          name="sundayBrunch"
          value={formData.sundayBrunch}
          onChange={handleChange}
          className={fieldClass}
        >
          <option value="">Please choose</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="optionalStockholmEvents" className={labelClass}>
          Optional Week-of Events/Interests
        </label>
        <textarea
          id="optionalStockholmEvents"
          name="optionalStockholmEvents"
          value={formData.optionalStockholmEvents}
          onChange={handleChange}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message to the Couple
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={textareaClass}
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
        className="w-full rounded-sm border border-[#35452C] bg-[#35452C] px-5 py-4 text-sm font-medium uppercase tracking-[0.18em] !text-[#F8F4EA] transition-colors hover:bg-[#2D2923] focus:outline-none focus:ring-2 focus:ring-[#A8B58A]/35 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send RSVP"}
      </button>

      {status === "error" && (
        <p className="rounded-sm border border-[#D8B8A6]/60 bg-[#F8F4EA]/70 p-3 text-sm leading-6 text-[#2D2923]">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
