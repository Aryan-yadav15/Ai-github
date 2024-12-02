import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

//htttps://github.com/docker/genai-stack/commit/<commitHash>.diff
//diff the changes in a commit we can find it by going to  the github URL and appending /commit/commitHash and it will show the changes made in that commit
export const aiSummariseCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff. Reminders about the git diff format:
        
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index aadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.  
        Then there is a specifier of the lines that were modified.  
        A line starting with \`+\` means it was added.  
        A line starting with \`-\` means that line was deleted.  
        A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding. 
        It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts],[packages/server/constats.ts].
        * Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml].
        * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts].
        * Added an OpenAI API for completions [packages/utils/apis/openai.ts].
        * Lowered numeric tolerance for test files.
        \`\`\`
        
        Most commits will have less comments than this example's list.  
        The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit.  
        Do not include parts of the example in your summary.  
        It is given only as an example of appropriate comments.`,
    `Please summarize the following diff file:\n\n${diff}`,
  ]);
  console.log(response);
  return response.response.text();
};

{
  /*
    console.await(summariseCommit(`
    */
}

export async function summariseCode(doc: Document) {
  console.log("getting summary for", doc.metadata.source);

  const code = doc.pageContent.slice(0, 10000); // Limit to 10000 characters
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
  return response.response.text();
}


export async function generateEmbedding(summary:string){
    const model = genAI.getGenerativeModel({
        model:"text-embedding-004",
    })
    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}