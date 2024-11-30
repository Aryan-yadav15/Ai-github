"use client";
import useProject from "@/hooks/use-project";
import { getCommitHashes } from "@/lib/github";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useEffect } from "react";
type Props = {};

const Dashboard = () => {
  const { project } = useProject();

  //use effect to set the project id
  {
    /*
   useEffect(() => {
    const fetchData = async () => {
      try {
        const commitHashes = await getCommitHashes(
          "https://github.com/docker/genai-stack",
        );
        console.log(commitHashes);
      } catch (error) {
        console.error("Error fetching commit hashes:", error);
      }
    };
    fetchData();
  }, []);
  */
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/** Githiub LInk */}
        <div className="flex w-fit flex-row items-center rounded-md bg-orange-700 px-4 py-3">
          <Github size={24} className="text-white" />
          <div className="ml-2">
            <p className="mt-1 text-sm font-medium text-white">
              This project is linkled to:{" "}
              <Link
                href={project?.githubUrl ?? ""}
                className="inline-flex items-center text-white/80 hover:underline"
              >
                {project?.githubUrl}
                <ExternalLink size={20} className="ml-4" />
              </Link>
            </p>
          </div>
        </div>
        <div className="h4"></div>
        <div className="flex items-center gap-4">
          {/** Team members */}
          {/** Ivite members */}
          {/** Archive button */}
          Team members invite members Archive button
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          AskQuestionCard MeetingCard
        </div>
      </div>
      <div className="mt-8"></div>
      CommitLog
    </div>
  );
};

export default Dashboard;
