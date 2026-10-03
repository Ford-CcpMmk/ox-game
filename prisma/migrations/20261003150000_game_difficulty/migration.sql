ALTER TABLE "game" ADD COLUMN "difficulty" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "game" ADD CONSTRAINT "game_difficulty_check" CHECK ("difficulty" IN (1, 2, 3));
