import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, 
});
const openai = new OpenAIApi(configuration);

export const reviewPR = async (prData) => {
  const prompt = `
      You are an AI reviewer. Please analyze the following pull request:
      - Title: ${prData.title}
      - Description: ${prData.body}
      - Files Changed: ${prData.changed_files}
  
      Provide feedback on code quality, style, and best practices. Include any possible improvements.
    `;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 500,
  });

  return response.data.choices[0].text;
};

const postReviewComment = async (
  prNumber,
  repo,
  owner,
  reviewText,
  githubToken
) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: reviewText,
    }),
  });

  if (!response.ok) {
    throw new Error("Error posting review comment");
  }

  return response.json();
};


// To get all the pr data
export async function POST(req, res) {
  try {
    const payload = await req.json(); 
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
