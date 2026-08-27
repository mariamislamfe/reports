"use client";

import { useState } from "react";
import type { Profile, Project } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { createReport } from "@/app/(app)/reports/new/actions";
import { StepIndicator } from "./step-indicator";
import { ProjectSelectStep } from "./project-select-step";
import { PhotoStep } from "./photo-step";
import { DetailsStep, type DetailsValues } from "./details-step";

export function ReportWizard({
  projects,
  profile,
  userId,
  recentLocations,
  dict,
}: {
  projects: Project[];
  profile: Profile;
  userId: string;
  recentLocations: string[];
  dict: Dictionary;
}) {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState<Project | null>(null);
  const [violationName, setViolationName] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [details, setDetails] = useState<DetailsValues>({
    observationLocation: "",
    fieldValues: {},
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!project || !violationName.trim() || photos.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const photoPaths: string[] = [];

      for (const photo of photos) {
        const ext = photo.type === "image/png" ? "png" : "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("violation-photos")
          .upload(path, photo, { contentType: photo.type, upsert: false });

        if (uploadError) {
          setError(dict.wizard.uploadError);
          setSubmitting(false);
          return;
        }
        photoPaths.push(path);
      }

      const result = await createReport({
        projectId: project.id,
        violationName: violationName.trim(),
        photoPaths,
        observationLocation: details.observationLocation,
        fieldValues: details.fieldValues,
        notes: details.notes,
      });

      if (result?.error) {
        setError(result.error);
        setSubmitting(false);
      }
    } catch {
      setError(dict.wizard.genericError);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <StepIndicator current={step} dict={dict} />

      {step === 1 && (
        <ProjectSelectStep
          projects={projects}
          dict={dict}
          onSelect={(p) => {
            setProject(p);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <PhotoStep
          photos={photos}
          dict={dict}
          onChange={setPhotos}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && project && (
        <DetailsStep
          project={project}
          violationName={violationName}
          onViolationNameChange={setViolationName}
          profile={profile}
          values={details}
          onChange={setDetails}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          recentLocations={recentLocations}
          dict={dict}
        />
      )}
    </div>
  );
}
