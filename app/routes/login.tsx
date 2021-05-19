import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "remix";
import { NavLink } from "react-router-dom";
import { useRouteData, json, redirect, Form } from "remix";
import { prisma } from "../db";
import { commitSession, getSession } from "../sessions";
import stylesUrl from "../styles/index.css";
import { comparePassword, sign } from "../utils.server";

interface LoginSession {
  errors?: string[];
  email?: string;
}

export let meta: MetaFunction = () => {
  return {
    title: "Iniciar Sesión | Seguimiento Deportivo",
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const loginSession: LoginSession = {
    errors: JSON.parse(session.get("errors") || "[]"),
    email: session.get("email") || "",
  };
  return json(loginSession, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let errors = [];
  const { email, password } = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  try {
    if (!email || !password) {
      throw new Error("Email y Contraseña son requeridos");
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (await comparePassword(password, user?.password!)) {
      session.set("token", sign({ email, name: user?.name }));
      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } else {
      throw new Error(
        "El usuario con esa combinación de email y contraseña no existe."
      );
    }
  } catch (err) {
    errors.push(err.message);
  }

  if (errors.length > 0) {
    session.flash("errors", JSON.stringify(errors));
    session.flash("email", email);
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Index() {
  let data = useRouteData<LoginSession>();
  return (
    <main>
      <h1>Iniciar Sesión</h1>
      <div className="form-tabs">
        <nav>
          <NavLink to="/login" activeClassName="active">
            Iniciar Sesión
          </NavLink>
          <NavLink to="/register" activeClassName="active">
            Registrarse
          </NavLink>
        </nav>
        <Form method="post">
          <label htmlFor="email">
            Email:
            <input
              defaultValue={data?.email}
              type="email"
              placeholder="juan.perez@gmail.com"
              id="email"
              name="email"
            />
          </label>
          <label htmlFor="password">
            Contraseña:
            <input type="password" name="password" id="password" />
          </label>
          <button type="submit">Iniciar Sesión</button>
          {data?.errors?.length
            ? data?.errors.map((error) => (
                <p key={error} className="error">
                  {error}
                </p>
              ))
            : null}
        </Form>
      </div>
    </main>
  );
}
