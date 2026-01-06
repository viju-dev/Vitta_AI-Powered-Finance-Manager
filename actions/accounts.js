"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "./auth";
import { serializeTransaction } from "./serialize";

// wrapped update actions in db transaction
export async function updateDefaultAccount(accountId) {
  try {
    const user = await getAuthenticatedUser();

    await db.$transaction([
      db.account.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      db.account.update({
        where: { id: accountId, userId: user.id },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransactions(accountId) {
  const user = await getAuthenticatedUser();

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const user = await getAuthenticatedUser();

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      // Round the change to 2 decimal places to avoid floating-point issues
      const roundedChange = Math.round(change * 100) / 100; // This ensures 2 decimals

      acc[transaction.accountId] =
        (acc[transaction.accountId] || 0) + roundedChange;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete Trasactions
      const deleteResponse = await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(
        // converting accountbalangecanges to array
        accountBalanceChanges
      )) {
        const updatResponse = await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    Object.keys(accountBalanceChanges).forEach((accountId) => {
      // triggering cache revalidation for each account page
      revalidatePath(`/account/${accountId}`);
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
