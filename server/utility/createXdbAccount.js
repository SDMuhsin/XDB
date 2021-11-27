
import DigitalBitsSdk from 'xdb-digitalbits-sdk';
let server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
import fetch from 'node-fetch';
import {XdbAccount} from '../models/xdb_account.js';


const XDB_ACCOUNT_INFO_URL = "https://frontier.testnet.digitalbits.io/accounts/";
const SERVER_URL = "https://frontier.testnet.digitalbits.io";

async function createAccount(name,userId){

    // Generate keys
    const pair = DigitalBitsSdk.Keypair.random();
    const nameCheckRes = await XdbAccount.find({name:name,createdBy:userId});
    console.log("Duplicate name check :" ,nameCheckRes);
    if(nameCheckRes == null || nameCheckRes.length == 0){
      const response = await fetch(
        `https://friendbot.testnet.digitalbits.io?addr=${encodeURIComponent(
          pair.publicKey(),
        )}`,
      );
      const responseJSON = await response.json();
      console.log("SUCCESS! You have a new account :)\n");
      // Create a mongo entry
      let entry = new XdbAccount({
        pk:pair.publicKey(),
        sk:pair.secret(),
        createdBy:userId,
        name:name
      });
  
      
      let resp = await entry.save().catch(e => res.status(500).json(e));
      return resp;
    }
    else{
      throw new Error('Name already exists');
    }
  }
  
  async function createAccountFromSrc(srcId,startingBalance,name,userId){
    let logBase = "[CREATE ACCOUNT FROM ANOTHER] ";
    
    // Ensure the name does not exist
    const nameCheckRes = await XdbAccount.find({name,createdBy:userId}).catch(e =>{res.status(500).json(e)});
    console.log("Duplicate name check :" ,nameCheckRes);
    if(nameCheckRes == null || nameCheckRes.length == 0){
      // Get Source account
      console.log(logBase + "Fetching source account");
      let sourceAccount = await XdbAccount.findById(srcId);
      console.log(logBase + "Source account found (probably) : ",sourceAccount.pk );
      let srcPk = sourceAccount.pk;
      let srcSk = sourceAccount.sk;
      console.log(logBase + "Getting source account sequence number " );
      let srcInfo = await fetch(XDB_ACCOUNT_INFO_URL + srcPk);
      srcInfo = await srcInfo.json();
      console.log(logBase + "Found source sequence number :", srcInfo.sequence );
      console.log(logBase + "Creating transaction :");
  
      console.log(logBase + " Creating source object ");
      let source = new DigitalBitsSdk.Account(srcPk, srcInfo.sequence);
      console.log(logBase + " Source object : ", source);
      console.log(logBase + " Creating destination keypair ");
      const destPair = DigitalBitsSdk.Keypair.random();
  
      console.log(logBase + ` Creating transaction, starting balance ${startingBalance} : ${typeof(startingBalance)}`);
      let transaction = new DigitalBitsSdk.TransactionBuilder(source, { fee:100, networkPassphrase: DigitalBitsSdk.Networks.TESTNET })
      .addOperation(
        DigitalBitsSdk.Operation.createAccount({destination:destPair.publicKey(), startingBalance: startingBalance})
      )
      .setTimeout(30)
      .build();
      console.log(logBase + "Transaction made(probably)");
      transaction.sign(DigitalBitsSdk.Keypair.fromSecret(srcSk));
      console.log(logBase + "Transaction signed(probably)");
      let server = new DigitalBitsSdk.Server(SERVER_URL);
      let submissionResponse = await server.submitTransaction(transaction);
      console.log(logBase + "Transaction submitted, resp success status : ",submissionResponse.successful);
  
      // Put the account into mongodb
      let entry = new XdbAccount({
        pk:destPair.publicKey(),
        sk:destPair.secret(),
        createdBy:userId,
        name:name
      });
  
      let resp = await entry.save()
      return resp;
    }
    else{
      throw new Error("Duplicate name error");
    }
  }

  export {createAccount as createXdbAccount, createAccountFromSrc as createXdbAccountFromSrc }