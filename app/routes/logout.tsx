import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { destroySession, getSession } from "../sessions";

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const cookieHeader = await destroySession(session);
  return redirect("/login", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
};

export default function Logout() {
  return null;
}
