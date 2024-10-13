
"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";

const ConnectGithubButton = () => {
    const [error, setError] = useState("")
  const handleConnectGithub = () => {
    // Replace this URL with your actual OAuth authorization URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=Ov23li0OuRXZ9xuJy8E6&scope=repo`;
    try {
      window.location.href = githubAuthUrl;
    } catch (err) {
      setError("Failed to initiate GitHub connection. Please try again.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connect to GitHub</CardTitle>
          <CardDescription>
            Link your GitHub account to start reviewing PRs automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnectGithub} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            Connect GitHub
          </Button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            By connecting, you're allowing this app to access your GitHub
            repositories for PR reviews.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectGithubButton;
