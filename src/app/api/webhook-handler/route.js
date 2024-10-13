// In the reviewPR function
import { cookies } from "next/headers";
import OpenAI from "openai";
export const reviewPR = async (prData) => {
  try {
    const diffResponse = await fetch(prData.diff_url);
    const diff = await diffResponse.text();

    // Use OpenAI to review the PR

    const openai = new OpenAI(process.env.OPENAI_API_KEY);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful code reviewer. Provide a concise review of the following code changes.",
        },
        { role: "user", content: diff },
      ],
    });

    const review = completion.choices[0].message.content;
    return review;
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
      const prNumber = payload.number;

      console.log("New PR created:", prData);

      // Fetch actual changed files from GitHub

      const githubToken = process.env.GITHUB_ACCESS_TOKEN;

    
      // Generate AI review
      const reviewText = await reviewPR(
       prData
      );

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
