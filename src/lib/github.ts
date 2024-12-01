import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = "https://github.com/docker/genai-stack"; // Fixed typo in URL

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitMessage: commit.commit.message ?? "",
    commitHash: commit.sha as string,
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  console.log("Project Details:", project, "GitHub URL:", githubUrl);

  const commitHashes = await getCommitHashes(githubUrl);
  console.log("Fetched Commits:", commitHashes);

  // Filter out already processed commits
  const unProcessedCommits = await filterUnProcessedCommits(projectId, commitHashes);
  console.log("Unprocessed Commits:", unProcessedCommits);

  // Generate summaries for unprocessed commits
  const summaryResponses = await Promise.allSettled(
    unProcessedCommits.map((commit) => summarizeCommit(githubUrl, commit.commitHash)),
  );

  // Extract summaries and log errors for failed promises
  const summaries = summaryResponses.map((response, index) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    console.error("Error summarizing commit:", unProcessedCommits[index], response.reason);
    return "";
  });

  console.log("Summaries Generated:", summaries);

  // Add commits to the database
  const commits = await db.commit.createMany({
    data: summaries
      .filter((summary) => summary) // Exclude empty summaries
      .map((summary, index) => {
        console.log("Processing Commit:", unProcessedCommits[index]);
        return {
          projectId,
          commitHash: unProcessedCommits[index]!.commitHash,
          commitMessage: unProcessedCommits[index]!.commitMessage,
          commitAuthorName: unProcessedCommits[index]!.commitAuthorName,
          commitAuthorAvatar: unProcessedCommits[index]!.commitAuthorAvatar,
          commitDate: unProcessedCommits[index]!.commitDate,
          summary,
        };
      }),
  });

  console.log("Commits Saved to Database:", commits);
  return commits;
};

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project does not have a GitHub URL");
  }

  return { project, githubUrl: project.githubUrl };
}

export async function filterUnProcessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });

  const processedHashes = new Set(processedCommits.map((commit) => commit.commitHash));

  const unProcessedCommits = commitHashes.filter(
    (commit) => !processedHashes.has(commit.commitHash),
  );

  console.log("Processed Commits Hashes:", processedHashes);
  return unProcessedCommits;
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
  try {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
    });

    console.log("Fetched Commit Diff:", data);
    return await aiSummariseCommit(data);
  } catch (error) {
    console.error("Error fetching commit diff:", error);
    throw error;
  }
}
