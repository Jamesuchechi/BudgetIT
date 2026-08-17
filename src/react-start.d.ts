declare module "@tanstack/react-start/server-entry" {
  import type { RequestHandler } from "@tanstack/react-start/server";
  import type { Register } from "@tanstack/react-router";

  export type ServerEntry = {
    fetch: RequestHandler<Register>;
  };

  export function createServerEntry(entry: ServerEntry): ServerEntry;
  const defaultEntry: ServerEntry;
  export default defaultEntry;
}
