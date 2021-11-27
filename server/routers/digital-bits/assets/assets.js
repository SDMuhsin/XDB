import express from 'express';
let router = express.Router();
import DigitalBitsSdk from 'xdb-digitalbits-sdk';

var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
import {XdbAccount} from '../../../models/xdb_account.js';
const GET_ASSET_CODE_URL =  "https://frontier.testnet.digitalbits.io/assets?";

import fetch from 'node-fetch';


router.get('/info', async (req,res)=>{ 
    let code = req.query.code ;
    let issuer = req.query.issuer;
    
    try {
        let url = GET_ASSET_CODE_URL;
        if (code) url += `asset_code=${code}&`;
        if(issuer) url += `asset_issuer=${issuer}`;

        const response = await fetch(
            url
        );
        const responseJSON = await response.json();
        res.status(200).json(responseJSON);

      } catch (e) {
        console.error("ERROR!", e);
        res.status(500).json(e);
      }
});

router.post('/create/:issId/:distId', async (req,res) =>{
  let logBase = "[CREATE XDB ASSET]";
  /*
    1. GET/Create an issuing account
    2. GET/Create a distribution account
    3. Trust line distribution -> issuer

    4. Payment : Issuer -> Distributer
  */
  console.log(logBase + " Verifying iss and dist exists")
  try{
    let issAccount = await XdbAccount.find({_id:req.params.issId});
    let distAccount = await XdbAccount.find({_id:req.params.distId});

    if(issAccount.length && distAccount.length){
      issAccount = issAccount[0];
      distAccount = distAccount[0];
      console.log(logBase + "  They do");
      console.log(logBase + " Changing trust");
      console.log(logBase + "  Creating asset object with code " + req.body.code);
      let asset = new DigitalBitsSdk.Asset(req.body.code,issAccount.pk);
      console.log(logBase + "  Creating operation object, asset : ", asset);
      let operation = DigitalBitsSdk.Operation.changeTrust({asset:asset,source:distAccount.pk});
      console.log(logBase + "  Bulding transaction");
      console.log(logBase + "   Getting source (xdb) account")

      const distXdbAccount = await server.loadAccount(distAccount.pk);
      const distKeypair = DigitalBitsSdk.Keypair.fromSecret(distAccount.sk);
      const fee = await server.fetchBaseFee();
      console.log(logBase + "   Fetched base fee " + fee);
      const transaction = new DigitalBitsSdk.TransactionBuilder(distXdbAccount, {
        fee,
        networkPassphrase: DigitalBitsSdk.Networks.TESTNET
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    transaction.sign(distKeypair);
    console.log(logBase + "  Transaction built : ");
    console.log(logBase + " Submitting transaction");
    const transactionResult = await server.submitTransaction(transaction);
    




    // iss pays dist () asset creation )
    
    const issXdbAccount = await server.loadAccount(issAccount.pk);
    const issKeypair = DigitalBitsSdk.Keypair.fromSecret(issAccount.sk);
    console.log(logBase + " Creating payment operation")
    const paymentTransaction = new DigitalBitsSdk.TransactionBuilder(issXdbAccount, {
      fee,
      networkPassphrase: DigitalBitsSdk.Networks.TESTNET
    })
    // Add a payment operation to the transaction
    .addOperation(DigitalBitsSdk.Operation.payment({
      destination: distAccount.pk,
      asset: asset,
      amount: req.body.amount,
    }))
    .setTimeout(30)
    .build();
    console.log(logBase + " Signing transaction");
    paymentTransaction.sign(issKeypair);
    
    console.log(logBase + " submitting transaction");
    const paymentTransactionResult = await server.submitTransaction(paymentTransaction);

    res.status(200).json(paymentTransactionResult);

    }
    else{
      console.log(logBase + " They dont");
      res.status(500).json({iss:issAccount,dist:distAccount});
    }
  }
  catch(e){
    console.log(e.stack);
    res.status(500).json(e.message);
  }
    
});
export {router as xdbAssetRouter};