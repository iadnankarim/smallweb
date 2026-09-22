"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border-line !shadow-card !font-sans",
          description: "!text-subtle",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
