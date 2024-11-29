"use client";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";

type Props = {};

type FormInaput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInaput>();

  function onSubmit(data: FormInaput) {
    window.alert(JSON.stringify(data));
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
            <Input {...register("repoUrl", { required: true })} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
