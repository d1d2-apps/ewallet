-- CreateTable
CREATE TABLE "bill_debtors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "billId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "debtorId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_debtors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bill_debtors" ADD CONSTRAINT "bill_debtors_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_debtors" ADD CONSTRAINT "bill_debtors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_debtors" ADD CONSTRAINT "bill_debtors_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
