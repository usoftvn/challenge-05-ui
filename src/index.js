import 'regenerator-runtime/runtime'

import { initContract, login, logout, isAccountExist } from './utils'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

// global variable used throughout
let nftBalances = [];

// const submitButton = document.querySelector('form button');
window.showHideNftBody = showHideNftBody;
window.showHideTranferForm = showHideTranferForm;
window.sendNFT = sendNFT;

function showHideNftBody(nftId) {
    let obj = document.querySelector(`#nft-body-${nftId}`);
    if (obj.style.display=="none") {
        obj.style.display = "block";
    } else {
        obj.style.display = "none";
    }
}

function showHideTranferForm(nftId) {
    let obj = document.querySelector(`#nft-transfer-${nftId}`);
    if (obj.style.display=="none") {
        obj.style.display = "block";
    } else {
        obj.style.display = "none";
    }
}

async function sendNFT(nftId) {
    try {
        let memo = document.querySelector(`#transfer-memo-${nftId}`).value;
        let reciever = document.querySelector(`#transfer-reciever-${nftId}`).value;
        if (!await isAccountExist(reciever)) {
            alert(`The reciever '${reciever}' is not existed. Please enter the other reciever!`);
            return;
        }
        let resp = await window.contract.nft_transfer({
            token_id: "" + nftId,
            receiver_id: reciever,
            memo: memo
        }, (60*10**12).toFixed(), 1);
        console.log("resp");
    } catch(ex) {
        console.error("Send NFT error", ex);
        alert(`Unable to send NFT!!!`);
    }
}

async function mintNFT() {
    try {
        let tokenId = document.querySelector(`#mint-nft-token-id`).value;
        let reciever = document.querySelector(`#mint-nft-receiver`).value;
        let title = document.querySelector(`#mint-nft-title`).value;
        let media = document.querySelector(`#mint-nft-media`).value;
        let copies = document.querySelector(`#mint-nft-copy`).value;
        let description = document.querySelector(`#mint-nft-description`).value;
        // console.log(tokenId, reciever, title, media, copies, description);
        
        if (!await isAccountExist(reciever)) {
            alert(`The reciever '${reciever}' is not existed. Please enter the other reciever!`);
            return;
        }

        await window.contract.nft_mint({
            token_id: tokenId,
            receiver_id: reciever,
            token_metadata: {
                title: title,
                description: description,
                media: media,
                copies: Number(copies)
            }
        }, (60*10**12).toFixed(), "10000000000000000000000");

        
        console.log("resp");
    } catch(ex) {
        console.error("Send NFT error", ex);
        alert(`Unable to send NFT!!!`);
    }
}

function updateEventForSendButton(nftId) {
    let btnTransfer = document.querySelector(`#btn-transfer-${nftId}`);
    let receiver = document.querySelector(`#transfer-reciever-${nftId}`);
    receiver.oninput = (event) => {
        if (event.target.value !== "") {
            btnTransfer.disabled = false;
        } else {
            btnTransfer.disabled = true
        }
    }
}

function updateEventForSendButtons() {
    for (let idx=0; idx<nftBalances.length; idx++) {
        let nft = nftBalances[idx];
        updateEventForSendButton(nft.token_id);
    }
}

async function getNFTBalances() {
    let balances = await window.contract.nft_tokens_for_owner({
        account_id: window.accountId
    });
    console.log("NFT Balances", balances);
    if (balances) nftBalances = balances;
}

async function updateNftBalance(autoGet) {
    if (autoGet) await getNFTBalances();
    document.querySelector("#nftAssetNum").innerHTML = `(${nftBalances.length})`;

    let html = "";
    for (let idx=0; idx<nftBalances.length; idx++) {
        let nft = nftBalances[idx];
        // console.log(nft)

        // Container
        let assetHtml = "<div class='nftContainer'>";

        // Header
        assetHtml += `<div class="nftHeader" style="font-weight:bold; cursor:pointer">`;
        assetHtml += `<span>#${nft.token_id} - ${nft.metadata.title} (${nft.metadata.copies})</span>`;
        assetHtml += `<span><div id="btn-info-${nft.token_id}" class="infoButton" onclick="showHideNftBody('${nft.token_id}')"></div></span>`;
        assetHtml += `<span><div id="btn-transfer-show-hide-${nft.token_id}" class="transferButton" onclick="showHideTranferForm('${nft.token_id}')"></div></span>`;
        assetHtml += `</div>`;
        
        // Body
        assetHtml += `<div id="nft-body-${nft.token_id}" class="nftBody" style="display:none">`;
        assetHtml += `<div class="seperator"></div>`;
        assetHtml += `<div style="text-align:center"><img style="width: 80%" src="${nft.metadata.media}" /></div>`;
        assetHtml += `<div style="font-size:smaller">${nft.metadata.description}</div>`;
        assetHtml += `</div>`;

        // Transfer
        assetHtml += `<div id="nft-transfer-${nft.token_id}" class="nftBody" style="display:none">`;
        assetHtml += `<div class="seperator"></div>`;
        assetHtml += `<form>`;
        assetHtml += `<fieldset id="fieldset">`;
        assetHtml += `<label>Memo:</label>`;
        assetHtml += `<div style="display: flex"><input style="flex: 1" autocomplete="off" id="transfer-memo-${nft.token_id}" data-behavior="memo" /><div>`;
        assetHtml += `</fieldset>`;
        assetHtml += `<fieldset id="fieldset">`;
        assetHtml += `<label>Receiver account:</label>`;
        assetHtml += `<div style="display: flex"><input style="flex: 1" autocomplete="off" id="transfer-reciever-${nft.token_id}" data-behavior="reciever" /><button id="btn-transfer-${nft.token_id}" type="button" disabled style="border-radius: 0 5px 5px 0" onclick="sendNFT(${nft.token_id})">Send</button></div>`;
        assetHtml += `</fieldset>`;
        assetHtml += `</form>`;
        assetHtml += `</div>`;

        assetHtml += "</div>";
        html += assetHtml;
    }
    document.querySelector("#nftAssetList").innerHTML = html;
    updateEventForSendButtons();
}

function updateNftMintForm() {
    if (window.accountId=="daothang.testnet") {
        document.querySelector("#mintForm").style.display = "block";
    } else {
        document.querySelector("#mintMessage").style.display = "block";
    }
}

document.querySelector('#mintForm').onsubmit = async (event) => {
    event.preventDefault()

    let btnMintNFT = document.querySelector("#btnMintNFT");
    btnMintNFT.disabled = true;

    // Get and check data
    await mintNFT();    

    btnMintNFT.disabled = false;
}

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })

    // populate links in the notification box
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)

    updateNftBalance(true);
    updateNftMintForm();
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)
