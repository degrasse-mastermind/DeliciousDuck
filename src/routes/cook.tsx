import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/cook")({
  component: () => <Outlet />,
});
