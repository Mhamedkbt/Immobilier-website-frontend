// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              À propos de <span className="font-medium">IMMO</span>
            </h1>
            <div className="w-20 h-1 bg-indigo-200 mx-auto" />
          </div>

          {/* Hero Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-16">
            <div className="p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                Nous vous aidons à trouver le bien idéal — appartement, maison, villa ou
                local — en <span className="font-medium">vente</span> ou en{" "}
                <span className="font-medium">location</span>. Notre objectif : rendre la
                recherche simple, rapide et transparente, avec des annonces claires et
                des informations fiables.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 md:p-12">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Notre mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Simplifier votre parcours immobilier : rechercher, comparer, contacter et
                finaliser plus facilement. Nous mettons en avant des annonces de qualité
                et des filtres utiles (ville, prix, surface, chambres, disponibilité).
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 md:p-12">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Notre vision</h2>
              <p className="text-gray-700 leading-relaxed">
                Devenir une référence locale en connectant propriétaires, agences et clients
                dans un espace moderne, sécurisé et orienté confiance.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Notre équipe</h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                Une équipe passionnée (tech + immobilier) qui travaille pour améliorer
                l’expérience : meilleure présentation des annonces, rapidité, et support.
              </p>

              {/* Team Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Annonces fiables</h3>
                  <p className="text-sm text-gray-600">
                    Des informations claires et une présentation propre pour prendre de
                    bonnes décisions.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6l4 2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Rapidité</h3>
                  <p className="text-sm text-gray-600">
                    Recherchez vite grâce aux filtres : prix, ville, surface, chambres,
                    disponibilité.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Accompagnement</h3>
                  <p className="text-sm text-gray-600">
                    Une équipe disponible pour vous aider : questions, contact, prise de
                    rendez-vous.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Trouvez votre prochain bien
            </h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Consultez les annonces et contactez-nous facilement via WhatsApp ou la page
              Contact.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                Voir les annonces
              </Link>

              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
