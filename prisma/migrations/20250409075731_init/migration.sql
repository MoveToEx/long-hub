-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('none', 'moderate', 'violent');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'cancelled', 'dismissed', 'approved', 'revoked');

-- CreateTable
CREATE TABLE "post" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "imageHash" VARCHAR(255) NOT NULL,
    "imageURL" VARCHAR(128) NOT NULL,
    "rating" "Rating" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletionReason" TEXT,
    "uploaderId" INTEGER,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion_request" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "postId" UUID NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "deletion_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alias" (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "alias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "name" VARCHAR(255) NOT NULL,
    "imageURL" VARCHAR(128) NOT NULL,
    "offsetX" INTEGER,
    "offsetY" INTEGER,
    "rectHeight" INTEGER,
    "rectWidth" INTEGER,
    "style" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" INTEGER,

    CONSTRAINT "template_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "permission" INTEGER NOT NULL DEFAULT 0,
    "accessKey" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_postTotag" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_postTotag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_accessKey_key" ON "user"("accessKey");

-- CreateIndex
CREATE INDEX "_postTotag_B_index" ON "_postTotag"("B");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_request" ADD CONSTRAINT "deletion_request_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_request" ADD CONSTRAINT "deletion_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alias" ADD CONSTRAINT "alias_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postTotag" ADD CONSTRAINT "_postTotag_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postTotag" ADD CONSTRAINT "_postTotag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
