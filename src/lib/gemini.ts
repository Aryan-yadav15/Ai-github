import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
});
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiSummariseCommit = async (diff: string): Promise<string> => {
  try {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff. Reminders about the git diff format:

      For every file, there are a few metadata lines, like (for example):
      \`\`\`
      diff --git a/lib/index.js b/lib/index.js
      index aadf691..bfef603 100644
      --- a/lib/index.js
      +++ b/lib/index.js
      @@ -1,6 +1,6 @@
      -console.log('Hello, world!');
      +console.log('Hello, universe!');
      \`\`\`

      Please summarize the following diff file:\n\n${diff}`,
    ]);
    return response.response.text();
  } catch (error) {
    if ((error as any).response?.status === 429) {
      console.warn("Rate limit exceeded, retrying after delay...");
      await delay(1000); // Delay for 1 second before retrying
      return aiSummariseCommit(diff);
    }
    throw error;
  }
};

// Shared promise chain to ensure sequential execution


let queuePromise: Promise<void> = Promise.resolve();
const requestQueue: (() => Promise<void>)[] = [];
const minDelayBetweenRequests = 3000; // 3 seconds minimum between requests
let lastRequestTime = 0;

export const summariseCode = async (doc: Document): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const task = async () => {
      try {
        // Ensure minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < minDelayBetweenRequests) {
          await new Promise(r => setTimeout(r, minDelayBetweenRequests - timeSinceLastRequest));
        }

        const code = doc.pageContent;
        lastRequestTime = Date.now();
        
        const response = await model.generateContent([
          `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects,
          You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file,
          Here is the code:
          ---
          ${code}
          ---
          Give me summary of no more than 100 words of the purpose of the ${doc.metadata.source} file
          `,
        ]);

        resolve(response.response.text());
      } catch (error) {
        reject(error);
      }
    };

    queuePromise = queuePromise.then(task).catch(() => {});
  });
};

export const generateEmbedding = async (summary: string) => {
  const result = await embeddingModel.embedContent(summary);
  const embedding = result.embedding;
  return embedding.values;
};

const generateEmbeddings = async (
  docs: Document[],
): Promise<
  {
    summary: string;
    embedding: number[];
    sourceCode: string;
    fileName: string;
  }[]
> => {
  const delayBetweenRequests = 1000; // 1 second delay between requests
  const results = [];

  for (const doc of docs) {
    await delay(delayBetweenRequests); // Delay before each request
    try {
      const summary = await summariseCode(doc);
      if (!summary) {
        console.warn(`Summary not generated for file: ${doc.metadata.source}`);
        continue;
      }
      const embedding = await generateEmbedding(summary);
      results.push({
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      });
    } catch (error) {
      console.error(
        `Error generating summary for file: ${doc.metadata.source}`,
        error,
      );
    }
  }

  return results;
};
