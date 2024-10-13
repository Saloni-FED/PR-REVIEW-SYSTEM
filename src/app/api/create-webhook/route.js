import axios from "axios";

export async function POST(req) {
  const { repoOwner, repoName, auth_token } = await req.json(); // Use await req.json() to parse JSON body

  console.log(repoOwner, repoName, auth_token); // Debug output

  if (!repoOwner || !repoName || !auth_token) {
    return new Response(JSON.stringify({ message: "Missing required parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // The URL where your webhook event handler will be hosted
  const webhookUrl = 'https://pr-review-system.vercel.app/api/webhook-handler';

  try {
    // API URL to create a webhook in the specified repository
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`;

    // Payload for the webhook configuration
    const webhookConfig = {
      name: "web",
      active: true,
      events: ["pull_request"], // Trigger when PR is opened
      config: {
        url: webhookUrl, // Your webhook handler endpoint
        content_type: "json",
      },
    };

    // Call the GitHub API to create the webhook
    const response = await axios.post(apiUrl, webhookConfig, {
      headers: {
        Authorization: `token ${auth_token}`, // OAuth token from GitHub
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Successfully created webhook
    return new Response(JSON.stringify({ message: "Webhook created", data: response.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating webhook:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Error creating webhook",
        error: error.response?.data || error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
