import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import { Document } from "@langchain/core/documents"
import { generateEmbedding, summariseCode } from "./gemini"
import { db } from "@/server/db"

/**
 * Retrieval-Augmented Generation (RAG) Overview
 *
 * @description This module implements a sophisticated document retrieval and processing pipeline
 * that enables intelligent, context-aware information extraction from a GitHub repository.
 *
 * RAG Workflow Breakdown:
 * 1. Document Retrieval
 *    - Fetch files from a GitHub repository using Langchain's GithubRepoLoader
 *    - Comprehensive file crawling with recursive directory search
 *    - Flexible configuration to ignore unnecessary files
 *
 * 2. File Content Extraction
 *    - Extract complete file contents
 *    - Capture metadata including file paths and names
 *
 * 3. Embedding Generation
 *    - Transform text documents into high-dimensional vector representations
 *    - Convert files into numeric arrays that capture semantic meaning
 *
 * Vector Embedding Mechanics:
 * - Each file is converted to a vector in a multi-dimensional space
 * - Similar documents cluster together in this vector space
 * - Enables advanced semantic similarity comparisons
 *
 * Semantic Search Process:
 * - Input query is also converted to a vector
 * - Compare query vector with document vectors
 * - Identify and retrieve most semantically relevant documents
 *
 * Database Integration:
 * - Utilize PostgreSQL for efficient vector storage and querying
 * - Leverage PG vector tools for high-performance similarity searches
 *
 * @example
 * // Typical workflow would involve:
 * // 1. Load repository documents
 * // 2. Generate embeddings
 * // 3. Perform semantic search on query
 */



export const loadGithubRepository = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN,
    branch: "main",
    ignoreFiles: [
      "README.md",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRrpo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepository(githubUrl, githubToken);
  // Generate embeddings for each document
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`Processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      // Update the summary embedding in the database
      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      try {
        const summary = await summariseCode(doc);
        if (!summary) {
          console.warn(`Summary not generated for file: ${doc.metadata.source}`);
          return null;
        }
        const embedding = await generateEmbedding(summary);
        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      } catch (error) {
        console.error(`Error generating summary for file: ${doc.metadata.source}`, error);
        return null;
      }
    }),
  ).then(results => results.filter(result => result !== null));
};