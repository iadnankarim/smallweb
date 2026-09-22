import { Suspense } from "react";
import { PublishForm } from "@/components/publish/publish-form";
import { PageCard } from "@/components/shell/page-card";

export default function PublishPage() {
  // useSearchParams (for ?address=) needs a Suspense boundary.
  return (
    <Suspense fallback={<PageCard>{null}</PageCard>}>
      <PublishForm />
    </Suspense>
  );
}
