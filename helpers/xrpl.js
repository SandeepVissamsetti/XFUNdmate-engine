const xrpl = require("xrpl");

exports.createAccount = async () => {
  const client = new xrpl.Client(process.env.XRPL_WS_CLIENT_ADDRESS);
  await client.connect();
  const account = (await client.fundWallet()).wallet;
  client.disconnect();
  return account;
};

exports.getAccBalance = async (address) => {
  const client = new xrpl.Client(process.env.XRPL_WS_CLIENT_ADDRESS);
  await client.connect();
  const balance = await client.getXrpBalance(address);
  client.disconnect();
  return balance;
};

exports.sendXRP = async (
  sender_address,
  sender_secret,
  amount_xrp,
  destination_address
) => {
  const client = new xrpl.Client(process.env.XRPL_WS_CLIENT_ADDRESS);
  await client.connect();
  let wallet = xrpl.Wallet.fromSeed(sender_secret);
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: sender_address,
    Amount: xrpl.xrpToDrops(amount_xrp),
    Destination: destination_address,
  });

  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);
  client.disconnect();
  return tx;
};

exports.getAccInfo = async (address) => {
  const client = new xrpl.Client(process.env.XRPL_WS_CLIENT_ADDRESS);
  await client.connect();
  const response = await client.request({
    command: "account_tx",
    account: address,
    // ledger_index: "validated",
    // limit: 1,
  });
  client.disconnect();
  return response;
};
