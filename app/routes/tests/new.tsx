import type { ActionFunction, LoaderFunction } from "remix";
import type { UserSession } from "../../sessions";
import { Form, redirect, useRouteData } from "remix";
import { commitSession, getSession, requireUser } from "../../sessions";
import { getRequestBody } from "../../utils.server";
import { prisma } from "../../db";

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return requireUser(request, (userSession) => {
    return {
      ...userSession,
      errors: session.get("errors"),
    };
  });
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const { name, units, user } = await getRequestBody<{
    name: string;
    units: string;
    user: string;
  }>(request);
  const errors = [];

  if (!name) {
    errors.push("El nombre es requerido");
  }

  if (!units) {
    errors.push("Las unidades son requeridas");
  }

  if (!user) {
    errors.push("Tenemos un error verificando tu usuario");
  }

  if (errors.length === 0) {
    await prisma.test.create({
      data: {
        name,
        units,
        userId: Number(user),
      },
    });
  }

  session.flash("errors", JSON.stringify(errors));

  return redirect("/tests/new", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export function NewTest() {
  const data = useRouteData<UserSession & { errors?: string[] }>();
  return (
    <div>
      <h1>Nuevo Test</h1>
      <Form method="post">
        <label htmlFor="name">
          Nombre:
          <br />
          <input name="name" type="text" placeholder="Single Hop" />
        </label>
        <label htmlFor="name">
          Unidades:
          <br />
          <input name="units" type="text" placeholder="cm" />
        </label>
        <input name="user" type="hidden" defaultValue={data.id} />
        <button type="submit">Agregar</button>
        {data?.errors
          ? data.errors.map((err) => (
              <p className="error" key={err}>
                {err}
              </p>
            ))
          : null}
      </Form>
    </div>
  );
}
