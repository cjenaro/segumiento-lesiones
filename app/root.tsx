import type { ActionFunction, LinksFunction, LoaderFunction } from "remix";
import {
  Meta,
  json,
  Links,
  Form,
  Scripts,
  useRouteData,
  LiveReload,
  redirect,
} from "remix";
import { NavLink, Outlet } from "react-router-dom";

import stylesUrl from "./styles/global.css";
import { destroySession, getUserSession } from "./sessions";
import React from "react";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  return json(session);
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  if (session) {
    const cookieHeader = await destroySession(session);
    return redirect("/login", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  }

  return redirect("/");
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  let data = useRouteData();
  return (
    <Document>
      <header>
        <nav>
          {data?.email ? (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/profile">Perfil</NavLink>
              <Form method="post">
                <button type="submit">Cerrar Sesión</button>
              </Form>
            </>
          ) : (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/">Iniciar Sesión</NavLink>
              <NavLink to="/">Registrarse</NavLink>
            </>
          )}
        </nav>
      </header>
      <Outlet />
      <footer>
        <p>Seguimiento Deportivo</p>
      </footer>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}
