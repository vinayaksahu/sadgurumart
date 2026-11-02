import { prisma } from '@/lib/prisma';
import { placeInAutoPool } from './autoPoolEngine';
import { TransactionType } from '@prisma/client';

export interface IncomeCreditParams {
  userId: string;
  amount: number;
  type: TransactionType;
  remarks: string;
  referenceId?: string;
  tx?: any;
}

export interface IncomeCreditResult {
  grossAmount: number;
  netCredited: number;
  autoPoolDeduction: number;
  enteredAutoPool: boolean;
}

/**
 * Credits income to a member's Main Wallet while enforcing the 1st Income AutoPool Deduction rule:
 * "1st income 100rs ka cut ke autopool me jayega."
 * 
 * - If user has not yet completed the ₹100 AutoPool entry deduction:
 *   - Up to ₹100 is deducted from this income.
 *   - Full gross income is recorded in ledger for transparency.
 *   - An AUTOPOOL_ENTRY_DEDUCTION debit transaction is recorded.
 *   - The deduction amount is added to wallet.autoPoolReserve.
 *   - When cumulative deduction reaches ₹100, user is placed into Universal AutoPool Level 1!
 * - Once ₹100 has been deducted, 100% of all future incomes are credited directly to Main Wallet.
 */
export async function creditIncomeWithAutoPoolCheck({
  userId,
  amount,
  type,
  remarks,
  referenceId,
  tx,
}: IncomeCreditParams): Promise<IncomeCreditResult> {
  const db = tx || prisma;

  if (amount <= 0) {
    return { grossAmount: 0, netCredited: 0, autoPoolDeduction: 0, enteredAutoPool: false };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user || !user.wallet) {
    return { grossAmount: amount, netCredited: 0, autoPoolDeduction: 0, enteredAutoPool: false };
  }

  const isExempt = user.userCode === 'SGM10001'; // Master root account
  const needsDeduction = !isExempt && !user.autoPoolDeducted && user.autoPoolDeductionPaid < 100;

  if (!needsDeduction) {
    // Standard 100% income credit
    const updatedWallet = await db.wallet.update({
      where: { id: user.wallet.id },
      data: {
        mainBalance: { increment: amount },
        totalEarned: { increment: amount },
      },
    });

    await db.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type,
        amount,
        closingBalance: updatedWallet.mainBalance,
        referenceId,
        remarks,
      },
    });

    return {
      grossAmount: amount,
      netCredited: amount,
      autoPoolDeduction: 0,
      enteredAutoPool: false,
    };
  }

  // 1st Income AutoPool Deduction calculation
  const paidSoFar = user.autoPoolDeductionPaid || 0;
  const needed = Math.max(0, 100 - paidSoFar);
  const deduction = Math.min(amount, needed);
  const netPayable = amount - deduction;
  const newPaid = paidSoFar + deduction;
  const isCompleted = newPaid >= 100;

  // 1. Update Wallet balances
  const updatedWallet = await db.wallet.update({
    where: { id: user.wallet.id },
    data: {
      mainBalance: { increment: netPayable },
      totalEarned: { increment: amount }, // Gross income is recognized
      autoPoolReserve: { increment: deduction }, // Transferred to AutoPool reserve
    },
  });

  const grossClosing = user.wallet.mainBalance + amount;
  const netClosing = updatedWallet.mainBalance;

  // 2. Record Gross Income Credit
  await db.walletTransaction.create({
    data: {
      walletId: user.wallet.id,
      type,
      amount,
      closingBalance: deduction > 0 ? grossClosing : netClosing,
      referenceId,
      remarks,
    },
  });

  // 3. Record AutoPool Entry Deduction Debit
  if (deduction > 0) {
    await db.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type: 'AUTOPOOL_ENTRY_DEDUCTION',
        amount: -deduction,
        closingBalance: netClosing,
        referenceId,
        remarks: `1st Income AutoPool Entry Deduction (प्रथम आमदनी से ₹${deduction} कटौती - 2x2 यूनिवर्सल ऑटोपूल एंट्री)`,
      },
    });
  }

  // 4. Update User record
  await db.user.update({
    where: { id: user.id },
    data: {
      autoPoolDeductionPaid: newPaid,
      autoPoolDeducted: isCompleted,
    },
  });

  // 5. If ₹100 target reached, place user in AutoPool Level 1
  let entered = false;
  if (isCompleted) {
    try {
      await placeInAutoPool(user.id, 1);
      entered = true;
    } catch (poolErr) {
      console.error('AutoPool placement error after 1st income deduction:', poolErr);
    }
  }

  return {
    grossAmount: amount,
    netCredited: netPayable,
    autoPoolDeduction: deduction,
    enteredAutoPool: entered,
  };
}
