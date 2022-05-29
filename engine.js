const sha256 = require('crypto-js/sha256');
const SHA256=require('crypto-js/sha256');
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');
class Transaction
{
    constructor(from_add,to_add,amount)
    {
        this.from_add=from_add;
        this.to_add=to_add;
        this.amount=amount;
    }
    
    calculateHash() // this is the hash which we are going to sign
    {
        return SHA256(this.from_add+this.to_add+this.amount).toString();
    }

    signTransaction(signingKey) // thsi is the public/private key pair of elliptic
    {
        // check if you are uing your own public key and not someone else's
        if(signingKey.getPublic('hex')!=this.from_add)
        throw new Error('Invalid attempt!! Check your public key');
        const hashTx=this.calculateHash(); // hash of the transaction
        const sig=signingKey.sign(hashTx,'base64'); // we have signed the transaction
        this.signature=sig.toDER('hex');
    }

    // check for validity of signatures
    isValid()
    {
        if(this.from_add=="system")  // this is the reward transaction
        return true;

        if(!this.signature || this.signature.length==0)
        throw new Error('No signature found in this transaction');

        const publicKey=ec.keyFromPublic(this.from_add,'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block
{
    constructor(timestamp,transactions,prevhash='')
    {
        
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.prevhash=prevhash;
        this.hash=this.calculateHash();
        this.nonce=0; // dummy variable
    }
    
    calculateHash()
    {
        return SHA256(this.prevhash+this.timestamp+JSON.stringify(this.transactions)+this.nonce).toString();
    }

    // to add blocks we add a method called mineBlock
    mineBlock(difficulty)
    {
        while(this.hash.substring(0,difficulty)!=Array(difficulty+1).join("0")) // till stattig me 0 ho itne
        {
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log('Block of '+this.index+' mined successfully!!!');
    }

    // now a method that can verify all the transactions in a block
    hasValidTransactions()
    {
        for(const tx of this.transactions)
        {
            // now check if this transaction is valid
            if(!tx.isValid())
            return false;
        }
        return true;
    }

}

class BlockChain
{
    constructor()
    {
        this.chain=[this.createGenesisBlock()]; // chain is an array
        this.difficulty=3;
        this.pendingTransactions=[];
        this.miningReward=100;
    }

    createGenesisBlock()
    {
        return new Block("00/00/00","genesis","na");
    }

    getLatestBlock()
    {
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(rewardAddress)
    {
        this.pendingTransactions.push(new Transaction("System",rewardAddress,100));
        let block=new Block(Date.now(),this.pendingTransactions);
        block.prevhash=this.getLatestBlock().hash;
        block.mineBlock(this.difficulty);

        console.log('Block mined successfully!!');

        this.chain.push(block);

        this.pendingTransactions=[]; // all transactions loaded in block
        // now define one more transaction to give reward
       // this.pendingTransactions=["system",rewardAddress,this.miningReward];
    }

    addTransaction(transaction)
    {
        // we will perform a few checks
        // 1) if this transaction has from address and to address
        if(!transaction.from_add || !transaction.to_add)
        throw new Error('Transaction must include from and to addresses');

        // 2) now check if this transaction is valid
        if(!transaction.isValid())
        throw new Error('Invalid transaction!!');
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfUser(addrress)
    {
        let bal=0;
        // we will loop over all the blocks of the chain
        for(const block of this.chain)
        {
            // now loop over each transaction of this block
            for(const tran of block.transactions)
            {
                if(tran.from_add==addrress)
                bal=bal-tran.amount;

                if(tran.to_add==addrress)
                bal=bal+tran.amount;
            }
        }
        return bal;
    }
    isChainValid()
    {
        for(let i=1;i<this.chain.length;i++)
        {
            const currBlock=this.chain[i];
            const prevBlock=this.chain[i-1];

            // first verify the hash of current block
            if(currBlock.hash!=currBlock.calculateHash())
            {
                console.log('error in hash of '+currBlock.index);
                return false;
            }
            // now check if current block has all valid transactions
            if(!currBlock.hasValidTransactions())
            return false;

            // now verify the link 
            if(currBlock.prevhash!=prevBlock.hash)
            {
                console.log('error in link of '+currBlock.index);
                return false;
            }
        }
        return true;
    }
}

module.exports.BlockChain=BlockChain;
module.exports.Transaction=Transaction;