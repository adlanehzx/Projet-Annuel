/*
  Warnings:

  - You are about to drop the `OAuthProvider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OAuthProvider" DROP CONSTRAINT "OAuthProvider_userId_fkey";

-- DropTable
DROP TABLE "OAuthProvider";
