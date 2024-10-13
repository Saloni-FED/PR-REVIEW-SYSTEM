// In the reviewPR function
import { cookies } from "next/headers";
export const reviewPR = async (prData) => {
  const prompt = `
      You are an AI reviewer. Please analyze the following pull request:
      - Title: ${prData.title}
      - Description: ${prData.body}
      - Files Changed: ${prData.changed_files}
      
      Provide feedback on code quality, style, and best practices. Include any possible improvements.
    `;

  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt,
      max_tokens: 500,
    });

    console.log("OpenAI Response:", response);
    return response.data.choices[0].text.trim(); // Trim to remove whitespace
  } catch (error) {
    console.error("Error generating OpenAI review:", error);
    throw new Error("Failed to generate review.");
  }
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

// In the POST handler
export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("Webhook Payload:", payload);

    if (payload.action === "opened" && payload.pull_request) {
      const prData = payload.pull_request;
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const prNumber = prData.number;

      console.log("New PR created:", prData);

      // Optional: Fetch actual changed files from GitHub
      const filesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        }
      );

      const filesData = await filesResponse.json();
      const changedFiles = filesData.map((file) => file.filename).join(", "); // Adjust this as needed

      // Generate AI review
      const reviewText = await reviewPR({
        title: prData.title,
        body: prData.body,
        changed_files: changedFiles,
      });

      console.log("Generated Review Text:", reviewText);

      // Get GitHub token from cookies
      const cookieStore = cookies();
      const githubToken = cookieStore.get("token");

      if (!githubToken) {
        throw new Error("GitHub token is missing.");
      }

      // Post review as a comment
      const commentResponse = await postReviewComment(
        prNumber,
        repo,
        owner,
        reviewText,
        githubToken
      );

      console.log("Posted Review Comment:", commentResponse);

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(
      JSON.stringify({ success: false, message: "Not a PR creation event" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response("Error handling webhook", { status: 500 });
  }
}
