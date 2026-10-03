import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OxGame } from "@/components/game/ox-game";
import { auth } from "@/lib/auth";
import { readGame, readScore } from "@/lib/game-server";

export default async function GamePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="ox-game-page app-page-background">
      <div className="ox-page-wrap w-full max-w-280 mx-auto">
        <OxGame
          playerName={session.user.name}
          initialGame={await readGame(session.user.id)}
          initialScore={await readScore(session.user.id)}
        />
      </div>
    </main>
  );
}
