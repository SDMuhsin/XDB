import express from 'express';
let router = express.Router();
import DigitalBitsSdk from 'xdb-digitalbits-sdk';

var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
import {XdbAccount} from '../../models/xdb_account.js';
const GET_ASSET_CODE_URL =  "https://frontier.testnet.digitalbits.io/assets?";

import fetch from 'node-fetch';

router.post('/test', async(req,res)=>{
    res.status(200).send("Options router live");
})

// Change trust
router.post('/trust/:to', async(req,res)=>{
    
})
export {router as xdbOptionsRouter};