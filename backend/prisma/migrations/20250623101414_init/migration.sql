-- CreateIndex
CREATE INDEX "GroupMembership_user_id_idx" ON "GroupMembership"("user_id");

-- CreateIndex
CREATE INDEX "GroupMembership_group_id_role_idx" ON "GroupMembership"("group_id", "role");

-- CreateIndex
CREATE INDEX "Message_created_at_idx" ON "Message"("created_at");

-- CreateIndex
CREATE INDEX "Message_sender_id_receiver_id_created_at_idx" ON "Message"("sender_id", "receiver_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Message_group_id_created_at_idx" ON "Message"("group_id", "created_at" DESC);
