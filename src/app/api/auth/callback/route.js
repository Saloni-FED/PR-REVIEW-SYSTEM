import axios from "axios";
import { cookies } from 'next/headers'

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
    console.log(accessToken, "access token is here ");
    console.log(tokenResponse.data, "tokenResponse is here");

    // token saved
    cookies().set('token', accessToken)

    // Redirect to /dashboard with a token in the query parameter
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/dashboard?token=${accessToken}`, // Redirect with token as query param
      },
    });
  } catch (error) {
    console.error("Error fetching access token:", error);
    return new Response("Error during GitHub authentication", { status: 500 });
  }
}