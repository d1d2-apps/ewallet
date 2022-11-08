-- DropForeignKey
ALTER TABLE "reset_password_tokens" DROP CONSTRAINT "reset_password_tokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "reset_password_tokens" ADD CONSTRAINT "reset_password_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
