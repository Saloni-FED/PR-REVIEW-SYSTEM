// In the reviewPR function
import { cookies } from "next/headers";
import OpenAI from "openai";
export const reviewPR = async (prData) => {
  const prompt = `You are an AI reviewer. Please analyze the following pull request:
        - Title: ${prData.title}
        - Description: ${prData.body}
        - Files Changed: ${prData.changed_files}
        
        Provide feedback on code quality, style, and best practices. Include any possible improvements.
      `;

  try {
    const openai = new  OpenAI(process.env.OPENAI_API_KEY)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an experienced code reviewer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
    });

    console.log("OpenAI Response:", response);
    return response.data.choices[0].message.content.trim(); // Trim to remove whitespace
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

      // Fetch actual changed files from GitHub
      
      const githubToken = process.env.GITHUB_ACCESS_TOKEN;

      
      const filesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        }
      );

      if (!filesResponse.ok) {
        throw new Error("Failed to fetch PR files.");
      }

      const filesData = await filesResponse.json();
      const changedFiles = filesData.map((file) => file.filename).join(", ");

      // Generate AI review
      const reviewText = await reviewPR({
        title: prData.title,
        body: prData.body,
        changed_files: changedFiles,
      });

      console.log("Generated Review Text:", reviewText);

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
