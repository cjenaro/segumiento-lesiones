import { NavLink } from "react-router-dom";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
  Request,
} from "remix";
import { useRouteData, redirect, json } from "remix";
import { prisma } from "../db";
import { commitSession, getSession } from "../sessions";
import stylesUrl from "../styles/index.css";
import { hashPassword, sign } from "../utils.server";

interface RegisterSession {
  errors?: string[];
  email?: string;
}

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
  const registerSession: RegisterSession = {
    errors: JSON.parse(session.get("errors") || "[]"),
    email: session.get("email"),
  };
  return json(registerSession);
};

async function getRequestBody<BodyType extends Record<string, string>>(
  request: Request
) {
  return Object.fromEntries(
    new URLSearchParams(await request.text())
  ) as BodyType;
}

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const { email, password, confirmPassword } = await getRequestBody<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>(request);
  const errors = [];
  let redirectUrl = "/register";

  try {
    if (!email || !password) {
      throw new Error("Email y Contraseña son requeridos");
    }

    if (password !== confirmPassword) {
      throw new Error("Contraseñas no coinciden");
    }

    await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
      },
    });
  } catch (err) {
    errors.push(err.message);
  }

  if (errors.length > 0) {
    session.flash("errors", JSON.stringify(errors));
  } else {
    session.set("token", sign({ email }));
    redirectUrl = "/";
  }

  return redirect(redirectUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Index() {
  let data = useRouteData<RegisterSession>();
  return (
    <main>
      <h1>Registrarse</h1>
      <div className="form-tabs">
        <nav>
          <NavLink to="/login" activeClassName="active">
            Iniciar Sesión
          </NavLink>
          <NavLink to="/register" activeClassName="active">
            Registrarse
          </NavLink>
        </nav>
        <form method="post">
          <label htmlFor="email">
            Email:
            <input
              type="email"
              placeholder="juan.perez@gmail.com"
              id="email"
              defaultValue={data?.email}
              name="email"
            />
          </label>
          <label htmlFor="password">
            Contraseña:
            <input type="password" name="password" id="password" />
          </label>
          <label htmlFor="confirmPassword">
            Confirmar Contraseña
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
            />
          </label>
          <button type="submit">Registrarse</button>
          {data?.errors?.length
            ? data?.errors.map((error) => <p key={error}>{error}</p>)
            : null}
        </form>
      </div>
    </main>
  );
}
