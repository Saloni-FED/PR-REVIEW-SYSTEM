import { Configuration, OpenAIApi } from "openai";
import { cookies } from "next/headers";

// Set up OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Function to review the PR using OpenAI
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
    return response.data.choices[0].text;
  } catch (error) {
    console.error("Error generating OpenAI review:", error);
    throw new Error("Failed to generate review.");
  }
};

// Function to post the AI-generated review as a comment on GitHub
const postReviewComment = async (prNumber, repo, owner, reviewText, githubToken) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: reviewText }),
    });

    if (!response.ok) {
      console.error("GitHub API error:", await response.json());
      throw new Error(`Failed to post comment: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error posting review comment:", error);
    throw new Error("Failed to post review comment on GitHub.");
  }
};

// Handler for webhook POST events
export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("Webhook Payload:", payload, payload.action);

    // Ensure this is a PR creation event
    if (payload.action === "opened" && payload.pull_request) {
      const prData = payload.pull_request;
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const prNumber = prData.number;

      console.log("New PR created:", prData);

      // Step 1: Generate the AI review for the PR
      const reviewText = await reviewPR({
        title: prData.title,
        body: prData.body,
        changed_files: prData.changed_files,
      });

      console.log("Generated Review Text:", reviewText);

      // Step 2: Get the GitHub token from cookies
      const cookieStore = cookies();
      const githubToken = cookieStore.get("token");

      if (!githubToken) {
        throw new Error("GitHub token is missing.");
      }

      // Step 3: Post the review as a comment on the PR
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
