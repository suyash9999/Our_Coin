// main function
const{BlockChain,Transaction}=require('./engine');
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');
const myKey=ec.keyFromPrivate('769ce0f78e67b6c40f33a369ab116b14d02cdff79c691d5b2489ac1d10f262b1');
const myWalletAddress=myKey.getPublic('hex');





let bytecoin=new BlockChain(); // created a new currency
// let us create a new transaction
const tx1=new Transaction(myWalletAddress,"cody",10); // send from my public key
tx1.signTransaction(myKey); // sign this using my private key
// now add this transaction
bytecoin.addTransaction(tx1);
// bytecoin.createTransaction(new Transaction("sonny","perry",100));
// bytecoin.createTransaction(new Transaction("perry","cody",50));

// now we are starting mining to create a block which will store these transactions
console.log('Strating the miner!!');
bytecoin.minePendingTransactions(myWalletAddress);
// let us print this block's transactions
for(tran of bytecoin.chain[1].transactions)
{
    console.log(tran.from_add+' gave '+tran.amount+' to '+tran.to_add);
    //console.log('\n');
}
let balance=bytecoin.getBalanceOfUser(myWalletAddress);
console.log('balance of Mr.Pratyush is '+balance);


