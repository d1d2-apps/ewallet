-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('HOUSE', 'EDUCATION', 'ELECTRONICS', 'LEISURE', 'OTHERS', 'RESTAURANT', 'HEALTH', 'SERVICES', 'SUPERMARKET', 'TRANSPORT', 'CLOTHING', 'TRAVEL');

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creditCardId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "installment" INTEGER,
    "totalOfInstallments" INTEGER,
    "description" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "category" "BillCategory" NOT NULL DEFAULT 'OTHERS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
