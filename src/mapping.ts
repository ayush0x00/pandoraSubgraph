import { log, json } from "@graphprotocol/graph-ts";
import { Contract, Transfer } from "../generated/Contract/Contract";
import { TokenTransfer, TokenInfo } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let tokenTransfer = new TokenTransfer(
    event.transaction.hash.toHexString() + event.logIndex.toString()
  );
  tokenTransfer.from = event.params.from.toHexString();
  tokenTransfer.to = event.params.to.toHexString();
  tokenTransfer.transferredAt = event.block.timestamp;
  tokenTransfer.tokenId = event.params.tokenId;

  let tokenInfo = TokenInfo.load(
    event.params.tokenId.toString() + event.address.toHexString()
  );

  if (!tokenInfo) {
    tokenInfo = new TokenInfo(
      event.params.tokenId.toString() + event.address.toHexString()
    );
    tokenInfo.contractAddress = event.address.toHexString();
    tokenInfo.creatorAddress = event.params.to.toHexString();
    tokenInfo.blockNumber = event.block.number;
    tokenInfo.mintTransactionHash = event.transaction.hash.toHexString();
    tokenInfo.createdOn = event.block.timestamp;
    tokenInfo.owner = event.params.to.toHexString();
    tokenInfo.lastTransfer = event.block.timestamp;
    tokenInfo.numberOfTransfers = 1;
    //tokenInfo.transfers = [event.logIndex.toString()];
    let tokenContract = Contract.bind(event.address);
    let result = tokenContract.try_tokenURI(event.params.tokenId);
    if (result.reverted) tokenInfo.tokenURI = "";
    else tokenInfo.tokenURI = result.value;
  } else {
    tokenInfo.numberOfTransfers = tokenInfo.numberOfTransfers + 1;
    tokenInfo.owner = event.params.to.toHexString();
    tokenInfo.lastTransfer = event.block.timestamp;
    tokenInfo.blockNumber = event.block.timestamp;
    // tokenInfo.transfers.push(event.logIndex.toString());
  }
  tokenTransfer.tokenInfo =
    event.params.tokenId.toString() + event.address.toHexString();
  tokenTransfer.save();
  tokenInfo.save();
}
