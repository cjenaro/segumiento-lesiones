import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "remix";
import { json, useRouteData, redirect } from "remix";
import { prisma } from "../db";
import {
  commitSession,
  getSession,
  requireUser,
  UserSession,
} from "../sessions";
import stylesUrl from "../styles/index.css";
import { sign } from "../utils.server";

export let meta: MetaFunction = () => {
  return {
    title: "Seguimiento Deportivo",
    description: "Control de lesionados y vuelta a actividades.",
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({ request }) => {
  return await requireUser(request, (session) => {
    return json(session);
  });
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const body = Object.fromEntries(new URLSearchParams(await request.text()));

  if (!body.name || !body.email) {
    session.flash("error", "No name entered or no email found");
  } else {
    prisma.user.update({
      where: {
        email: body.email,
      },
      data: {
        name: body.name,
      },
    });
    session.set("token", sign({ email: body.email, name: body.name }));
  }
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Index() {
  let data = useRouteData<UserSession>();
  return (
    <main>
      <h1>Seguimiento Deportivo</h1>
      <div>
        <p>
          {!data?.name ? (
            <form method="post">
              <label htmlFor="name">
                Ingresá tu nombre:
                <br />
                <input type="text" name="name" id="name" />
                <input
                  type="hidden"
                  name="email"
                  id="email"
                  value={data.email}
                />
              </label>
              <button type="submit">Enviar</button>
            </form>
          ) : (
            `Bienvenido, ${data.name}`
          )}
        </p>
      </div>
    </main>
  );
}
