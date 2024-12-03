import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import React from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesRefrences, setFilesRefrence] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
  const [answer, setAnswer] = React.useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!project?.id) return;
    setLoading(true);
    e.preventDefault();
    setIsDialogOpen(true);

    const { output, filesRefrences } = await askQuestion(question, project.id);
    setFilesRefrence(filesRefrences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const handleDialogClose = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
    if (!isOpen) {
      setAnswer("");
      setFilesRefrence([]);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <h1>Logo</h1>
            <DialogTitle>{question}</DialogTitle>
          </DialogHeader>
          {answer}
          <h1>Files referred</h1>
          {filesRefrences.map((file) => {
            return <span key={file.fileName}>{file.fileName}</span>;
          })}
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit">Ask</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;