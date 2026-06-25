"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "./auth";
import { serializeTransaction } from "./serialize";

export async function createAccount(data) {
  try {
    const user = await getAuthenticatedUser();

    // convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance Amount");

    // Check is this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // Use a transaction to atomically unset other defaults and create the new account
    const account = await db.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.account.create({
        data: {
          ...data,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  const user = await getAuthenticatedUser();

  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const serializedAccount = accounts.map(serializeTransaction); //i guess shortcut to to use that fn on each entry of map function
  return serializedAccount;
}

export async function getDashBoardData() {
  const user = await getAuthenticatedUser();

  //Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}
