// Importing necessary libraries and functions
import { z } from "zod" // zod is a validation library
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc" // Importing TRPC router utilities
import { pollCommits } from "@/lib/github"
import { indexGithubRerpo } from "@/lib/github-loader"

// Creating a router for project-related operations
export const projectRouter = createTRPCRouter({
  // Protected procedure to create a new project
  createProject: protectedProcedure
    .input(
      z.object({
        // Input validation schema using zod
        name: z.string(), // Project name must be a string
        githubUrl: z.string(), // GitHub URL must be a string
        githubToken: z.string().optional(), // GitHub token is optional
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Mutation to create a new project in the database
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl, // Assigning the GitHub URL from input
          name: input.name, // Assigning the project name from input
          userToProjects: {
            create: {
              userId: ctx.user.userId!, // Linking the project to the current user
            },
          },
        },
      })
      await pollCommits(project.id)
      await indexGithubRerpo(project.id, input.githubUrl, input.githubToken) // Indexing the GitHub repository
      // Returning the created project
      return project
    }),

  // Protected procedure to get all projects for the authenticated user
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    // Query to find all projects associated with the current user
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!, // Filtering projects by user ID
          },
        },
        deletedAt: null, // Ensuring that only non-deleted projects are returned
      },
    })
  }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId).then().catch(console.error)
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      })
    }),
})
