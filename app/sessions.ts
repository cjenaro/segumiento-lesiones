import type { LoaderFunction, Session, Request } from "remix";
import { createCookieSessionStorage, redirect } from "remix";
import { verify } from "./utils.server";

let exp = new Date(Date.now());
exp.setDate(exp.getDate() + 1);

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    expires: exp,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.COOKIE_SECRETS || "secrets"],
    secure: process.env.NODE_ENV === "production",
  },
});

export interface UserSession {
  email?: string;
  name?: string;
  id?: number;
}

export type Next = (session: UserSession | null) => ReturnType<LoaderFunction>;

export async function requireUser(request: Request, next: Next) {
  const userSession = await getUserSession(request);
  if (!userSession) {
    return redirect("/login");
  }

  return next(userSession);
}

export async function getUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) {
    return null;
  }
  const verified: UserSession = verify(token) as UserSession;
  return verified;
}

export { getSession, commitSession, destroySession };
