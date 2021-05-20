import React from "react";
import { NavLink } from "react-router-dom";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "remix";
import { json, useRouteData, redirect, Form } from "remix";
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
  const session = await getSession(request.headers.get("Cookie"));
  return await requireUser(request, (userSession) => {
    const indexSession: IndexSession & UserSession = {
      error: session.get("error"),
      ...userSession,
    };
    return json(indexSession);
  });
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const body = Object.fromEntries(new URLSearchParams(await request.text()));

  if (!body.name || !body.email) {
    session.flash("error", "No name entered or no email found");
  } else {
    await prisma.user.update({
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

interface IndexSession {
  error?: string;
}

export default function Index() {
  let data = useRouteData<IndexSession & UserSession>();
  return (
    <main>
      <div className="container">
        <h1>Seguimiento Deportivo</h1>
        <div>
          {!data?.name ? (
            <Form method="post">
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
              {data?.error ? <p className="error">{data.error}</p> : null}
            </Form>
          ) : (
            <p>Bienvenido, {data.name}</p>
          )}
        </div>
        <nav className="index-nav">
          <p>Tests</p>
          <ul>
            <li>
              <NavLink to="/tests/new">Agregar Test</NavLink>
            </li>
            <li>
              <NavLink to="/tests">Ver Tests</NavLink>
            </li>
          </ul>
          <p>Deportista</p>
          <ul>
            <li>
              <NavLink to="/players/new">Agregar Deportista</NavLink>
            </li>
            <li>
              <NavLink to="/players">Ver Deportistas</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
