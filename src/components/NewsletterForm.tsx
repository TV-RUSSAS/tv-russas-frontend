"use client";

import { useState } from "react";
import { TEXTS } from "@/constants/texts";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simular inscrição
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className="newsletter-success">
        <i className="fas fa-check-circle"></i>
        <p>{TEXTS.newsletter.success}</p>
        <button onClick={() => setStatus("idle")} className="newsletter-btn-back">{TEXTS.actions.back}</button>
      </div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder={TEXTS.newsletter.placeholder} 
        required 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? TEXTS.newsletter.subscribing : TEXTS.newsletter.subscribe}
      </button>
    </form>
  );
}
