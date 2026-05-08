import * as React from "react";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={["text-sm font-medium", className].filter(Boolean).join(" ")} {...props} />;
}

export { Label };
