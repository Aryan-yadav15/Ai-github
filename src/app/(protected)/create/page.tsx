"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UseRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {};

type FormInaput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInaput>();

  const refetch = UseRefetch()
  const createProject = api.project.createProject.useMutation();

  function onSubmit(data: FormInaput) {
    createProject.mutate({
      name: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
    },{
      onSuccess: ()=>{
        toast.success("Project created successfully")
        refetch()
      },
      onError: ()=>{
        toast.error("Failed to create project")
      }
    });
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/undraw_github.svg" alt="Hero image" className="h-5/6 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your github repository
          </h1>
          <p className="testsm text-muted-foreground">
            Enter the URl of your repo to link it to our project
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input {...register("projectName", { required: true })} placeholder="Project name" required />
            <div className="h-2"></div>
            <Input {...register("repoUrl", { required: true })} placeholder="Github repo URL" type="url" required />
            <div className="h-2"></div>
            <Input {...register("githubToken", )} placeholder="Github Token(Optional)"  />
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
