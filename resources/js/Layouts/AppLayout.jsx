import React from "react";
import NavBar from "@/Components/NavBar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="p-6">{children}</main>
    </div>
  );
}