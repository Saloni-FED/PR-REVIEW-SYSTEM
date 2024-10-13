export async function POST(req, res) {
    try {
      const payload = await req.json(); // Get the payload from the request
      console.log("Webhook Payload:", payload);
  
      // Handle the payload (e.g., when a PR is created)
      if (payload.action === "opened" && payload.pull_request) {
        console.log("New PR created:", payload.pull_request);
      }
  
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("Error handling webhook:", error);
      return new Response("Error handling webhook", { status: 500 });
    }
  }