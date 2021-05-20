import type { LinksFunction, LoaderFunction } from "remix";
import {
  Meta,
  json,
  Links,
  Form,
  Scripts,
  useRouteData,
  LiveReload,
} from "remix";
import { NavLink, Outlet } from "react-router-dom";

import stylesUrl from "./styles/global.css";
import { getUserSession } from "./sessions";
import React from "react";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  return json(session);
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        {/* <Scripts /> */}
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
              <Form method="post" action="/logout">
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
