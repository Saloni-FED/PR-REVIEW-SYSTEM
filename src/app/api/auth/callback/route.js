import axios from "axios";
import { serialize } from "cookie"; // Import the serialize function from the cookie package

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Authorization code not provided", { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID, // Use env vars for security
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Set the cookie manually using the Set-Cookie header
    const cookie = serialize("token", accessToken, {
      httpOnly: true,  // This makes it inaccessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Only set over HTTPS in production
      path: "/",  // Cookie will be accessible across your entire site
      maxAge: 60 * 60 * 24 * 7,  // Token will expire after 1 week
    });

    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": cookie,  // Set the cookie in the response header
        Location: ` /dashboard?token=${accessToken}`,  // Redirect after setting the cookie
      },
    });
  } catch (error) {
    console.error("Error fetching access token:", error);
    return new Response("Error during GitHub authentication", { status: 500 });
  }
}
