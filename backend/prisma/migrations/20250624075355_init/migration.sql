-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_uuid_key" ON "Reaction"("uuid");

-- CreateIndex
CREATE INDEX "Reaction_message_id_idx" ON "Reaction"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_user_id_message_id_emoji_key" ON "Reaction"("user_id", "message_id", "emoji");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
