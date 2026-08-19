const INTERNAL_ROUTE_PREFIX = "/internal";

export function isInternalPath(pathname: string): boolean {
  return pathname === INTERNAL_ROUTE_PREFIX || pathname.startsWith(`${INTERNAL_ROUTE_PREFIX}/`);
}

/**
 * Internal tools have no owner-authentication boundary yet. Fail closed in
 * production while keeping the local-development workbench available.
 */
export function shouldBlockInternalRequest(input: {
  pathname: string;
  isProduction: boolean;
}): boolean {
  return input.isProduction && isInternalPath(input.pathname);
}

export function internalNotFoundResponse(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}
