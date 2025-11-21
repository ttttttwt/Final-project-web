import React from "react";
import LessonViewerClient from "./LessonViewerClient";

interface LessonViewerPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonViewerPage(props: LessonViewerPageProps) {
  const params = await props.params;
  return (
    <LessonViewerClient courseId={params.courseId} lessonId={params.lessonId} />
  );
}
