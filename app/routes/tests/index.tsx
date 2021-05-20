import { Test } from ".prisma/client";
import type { LoaderFunction } from "remix";
import { useRouteData } from "remix";
import { prisma } from "../../db";
import { requireUser } from "../../sessions";

export let loader: LoaderFunction = ({ request }) => {
  return requireUser(request, async (userSession) => {
    return await prisma.test.findMany({
      where: {
        User: {
          email: userSession?.email,
        },
      },
    });
  });
};

export default function Tests() {
  const tests = useRouteData<Test[]>();
  return (
    <div className="container">
      <h1>Tests</h1>

      {tests?.length ? (
        <ul>
          {tests.map((test) => (
            <li key={test.id}>{test.name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
