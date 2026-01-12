import React from "react";

export default function WhatsAppButton() {
  const phoneNumber = "212600000000"; // 👈 CHANGE to your WhatsApp number (no +, no spaces)
  const message = "Bonjour, je suis intéressé par un bien immobilier.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-[9999] flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-xl transition-transform hover:scale-110"
      aria-label="Contact WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-white text-3xl"></i>
    </a>
  );
}
