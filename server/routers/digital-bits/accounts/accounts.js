/*
  XDB account name validations
*/

import express from 'express';
let router = express.Router();
import DigitalBitsSdk from 'xdb-digitalbits-sdk';

var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
import fetch from 'node-fetch';

const sourceSecretKey = 'nothing';

import {XdbAccount} from '../../../models/xdb_account.js';
import {createXdbAccount,createXdbAccountFromSrc} from '../../../utility/createXdbAccount.js';
import e from 'express';

const XDB_ACCOUNT_INFO_URL = "https://frontier.testnet.digitalbits.io/accounts/";
const SERVER_URL = "https://frontier.testnet.digitalbits.io";


router.get('/test', (req,res) =>{

    // Generate keys
    const pair = DigitalBitsSdk.Keypair.random();


    // Fund
    (async function main() {
        try {
          const response = await fetch(
            `https://friendbot.testnet.digitalbits.io?addr=${encodeURIComponent(
              pair.publicKey(),
            )}`,
          );
          const responseJSON = await response.json();
          console.log("SUCCESS! You have a new account :)\n", responseJSON);
          res.status(200).json(responseJSON);

        } catch (e) {
          console.error("ERROR!", e);
          res.status(500).json(e);
        }
      }
    )();
});

router.get('/my', async (req,res) =>{
  // Query xdb_accounts for 

  try{
    let xdbAccounts = await XdbAccount.find({createdBy:req.user._id});
    res.json(xdbAccounts);
  }
  catch(e){
    res.status(500).json(e);
  }
  

});

router.post('/create', async(req,res)=>{
  // Create a keypair, create an account, fund account
  // Create a database entry

  // Generate keys
  try{
    let resp = await createXdbAccount(req.body.name,req.user._id);
    res.status(200).json(resp);
  }
  catch(e){
    console.log("Error e ",e,typeof(e))
    res.status(500).json({err:e.message});
  }
});

router.post('/create/from/:id', async(req,res) =>{

  try{
    let resp = await createXdbAccountFromSrc(req.params.id,req.body.startingBalance,req.body.name,req.user._id);
    res.status(200).json(resp);
  }
  catch(e){
    res.status(500).json({err:e.message});
  }
  
});

router.get('/info/:pk', async (req,res) =>{

  // TO DO : Remove for production
  if(!!req.params.pk == 'default'){
    req.params.pk = 'GBI2MWFLX2AZ3K6YU6L3CAQKVZJ3IK4CCA5JAVG5KCZP5QZSD5VW35IX';
  }

  try{
    //console.log(`https://frontier.testnet.digitalbits.io/accounts/${req.params.pk}`);
    const response = await fetch(`https://frontier.testnet.digitalbits.io/accounts/${req.params.pk}`);
    const responseJson = await response.json();
    console.log("Response : \n",responseJson);
    res.status(200).json(responseJson);
  }
  catch(e){
    console.log(e);
    res.status(500).json(e);
  }
  
});

export {router as xdbAccountsRouter};