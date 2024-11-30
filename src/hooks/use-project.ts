// Importing the necessary hooks and React library
import { api } from "@/trpc/react"; // Importing the API for TRPC (Type-safe Remote Procedure Call)
import React from "react"; // Importing React for building components
import { useLocalStorage } from "usehooks-ts"; // Importing the useLocalStorage hook from the usehooks-ts library
// Custom hook to fetch project data
const useProject = () => {
  // Using the TRPC query to get projects from the server
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("projectId", " ");
  const project = projects?.find((project) => project.id === projectId);
  // Returning the fetched projects data
  return { projects, project, projectId, setProjectId };
};

// Exporting the custom hook for use in other components
export default useProject;

/*
  Comparison of State Management Approaches:

  1. Using `useState`:
     - Keeps the state in memory for the lifetime of the component.
     - State is lost when the component unmounts or the page is refreshed.
     - Suitable for temporary state (e.g., form inputs, toggles).
     - Simpler and avoids the overhead of managing local storage.
     - More performant for frequently changing state.

  2. Using `useLocalStorage`:
     - Stores state in the browser’s local storage, which persists across sessions.
     - Useful for data that should remain available after page reloads (e.g., user preferences).
     - Allows retrieval of previously saved data on component mount.
     - Facilitates cross-component sharing of state without prop drilling.

  When to use each:
  - Use `useState` when you only need temporary state that doesn't need to persist.
  - Use `useLocalStorage` when you need to remember user preferences or settings across sessions.
*/
