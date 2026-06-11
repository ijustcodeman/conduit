-- CreateTable
CREATE TABLE "_ArticleFavorites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ArticleFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArticleFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleFavorites_AB_unique" ON "_ArticleFavorites"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleFavorites_B_index" ON "_ArticleFavorites"("B");
