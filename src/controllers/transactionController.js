const validateUserTransactionData = require("../helpers/validateTransactionData");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");

const createTransaction = async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    //validate the data coming from the user
    const isDatavalid = await validateUserTransactionData({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
    });

    if (!isDatavalid) {
      return res
        .status(400)
        .json({ status: "failed", message: "Data is not valid" + err.message });
    }

    // validatre idempotency key
    const isTransactionAlreadyExits = await transactionModel.findOne({
      idempotencyKey: idempotencyKey,
    });
    if (isTransactionAlreadyExits) {
      if (isTransactionAlreadyExits.status === "COMPLETED") {
        return res.status(401).json({
          message: "Transaction already procceded",
          transaction: isTransactionAlreadyExits,
        });
      }
      if (isTransactionAlreadyExits.status === "PENDING") {
        return res.status(202).json({
          message: "Transaction still in progress",
          transaction: isTransactionAlreadyExits,
        });
      }
      if (isTransactionAlreadyExits.status === "FAILED") {
        return res.status(500).json({
          message: "Transaction failed",
          transaction: isTransactionAlreadyExits,
        });
      }
      if (isTransactionAlreadyExits.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction failed due to some reason, amount refunded",
          transaction: isTransactionAlreadyExits,
        });
      }
    }

    //calculate the balance
    const balance = await isDatavalid.fromAccount.getBalance();

    if (balance < amount) {
      return res.status(402).json({
        message: `Insuffecient balance. Current balance is ${balance} and requested balance is ${amount}`,
      });
    }

    //create a transaction

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );
    

    await session.commitTransaction();
    session.endSession();

    //send transaction email
    emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction: transaction,
    });
  } catch (err) {
    return res.status(401).json({
      status: "failed",
      message: "Oops! something went wrong! " + err.message,
    });
  }
};

const createInitialFunds = async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;
  try {
    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(401).json({ message: "Required data is missing" });
    }

    const toUserAcc = await accountModel.findOne({ _id: toAccount });

    if (!toUserAcc) {
      return res.status(401).json({
        status: "failed",
        message: "account you are trying to send doesnt exists",
      });
    }

    //create a transaction
    const fromUser = req.user;
    const fromUserAcc = await accountModel.findOne({ user: fromUser._id });

    if (!fromUserAcc) {
      return res.status(401).json({
        status: "failed",
        message: "you dont have account associated with your profile",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
      fromAccount: fromUserAcc._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromUserAcc._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    ((transaction.status = "COMPLETED"), await transaction.save({ session }));

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: `Amount successfully sent to ${toUserAcc._id}`,
    });
  } catch (err) {
    return res.status(402).json({ status: "failed", message: err.message });
  }
};

module.exports = {
  createTransaction,
  createInitialFunds,
};
