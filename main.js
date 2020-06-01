const SHA256 = require('crypto-js/sha256');

class Transaction{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block{
	constructor(timestamp,transactions, previousHash=''){
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		this.nonce = 0; //to calc hash
	}

	//to calculate hash of block
	calculateHash(){
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
	}

	mineBlock(difficulty){

		while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
			this.nonce++;
			this.hash = this.calculateHash();
		}

		console.log("Block mined: " + this.hash);
	}	
}

class Blockchain{
	constructor(chain, difficulty, pendingTransactions, miningReward){
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	//create the 1st block (object) in every chain
	createGenesisBlock(){
		return new Block("01/01/17", "Genesis block", "0");
	}

	//self explanatory
	getLatestBlock(){
		return this.chain[this.chain.length-1];
	}

	//self explanatory
	minePendingTransactions(miningRewardAddress){
		let block = new Block(Date.now(), this.pendingTransactions, this.previousHash);
		block.mineBlock(2); //difficulty level

		console.log('Block successfully mined');
		this.chain.push(block);

		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}

	createTransaction(transaction){
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address){
		let balance = 0;

		for(const block of this.chain){
			for(const trans of block.transactions){
				
				if(trans.fromAddress === address){
					balance -= trans.amount;
					console.log('Bal = ' + balance);
				}

				if(trans.toAddress === address){
					balance += trans.amount;
					console.log('Bal = ' + balance);
				}

			}
		}
		return balance;
	}

	//to check that the current chain is valid, and that it has not been tampered with
	isChainValid(){
		for(let i = 1; i < this.chain.length; i++){
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];

			if(currentBlock.hash !== currentBlock.calculateHash())
				return false;

			if(currentBlock.previousHash !== previousBlock.hash)
				return false;
		} 
		return true;
	}
}

//adding 2 blocks ahead of the genesis block
let savjeeCoin = new Blockchain();
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
savjeeCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\nStarting miner... ');
savjeeCoin.minePendingTransactions('address1');

console.log('\nBalance of user1 is ' + savjeeCoin.getBalanceOfAddress('address1') + '\n');