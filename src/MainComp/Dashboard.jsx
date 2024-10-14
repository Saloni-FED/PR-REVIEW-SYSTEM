"use client"; // Ensure this is marked as a client component

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function Dashboard() {
  // Get the search params (query string)
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

 
  useEffect(() => {
    if (token) {
      localStorage.setItem("github_access_token", token);
    }

  }, [token]); // Run this effect only when token changes

  const createWebhook = async () => {
    const repoOwner = 'Saloni-FED'; // The repo owner
    const repoName = 'Figma-Clone-Assignment'; // The repo name
    const auth_token = token; // Store the GitHub token securely (already done in step 2)

    try {
      const response = await fetch("/api/create-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoOwner, repoName, auth_token }),
      });

      const data = await response.json();
      console.log(data); // Log the response data

      if (response.ok) {
        console.log("Webhook created successfully:", data);
      } else {
        console.error("Failed to create webhook:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col justify-center items-center">
      <h1>Welcome to your Dashboard!</h1>
      {token ? (
        <p>Your access token is: {token}</p>
      ) : (
        <p>No access token provided.</p>
      )}
      {/* <Button onClick={createWebhook}>Generate Connection</Button> */}
    </div>
  );
}

export default Dashboard;
