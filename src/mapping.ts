import { log, json } from "@graphprotocol/graph-ts";
import { Contract, Transfer } from "../generated/Contract/Contract";
import { TokenTransfer, TokenInfo } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let tokenTransfer = new TokenTransfer(
    event.params.tokenId.toString() + event.address.toHexString()
  );
  let tokenInfo = TokenInfo.load(
    event.params.tokenId.toString() + event.address.toHexString()
  );

  if (!tokenInfo) {
    log.debug("Creating new token", []);
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
    let tokenContract = Contract.bind(event.address);
    tokenInfo.tokenURI = tokenContract.tokenURI(event.params.tokenId);
  } else {
    log.debug("Using existing token...", []);
    tokenInfo.numberOfTransfers = tokenInfo.numberOfTransfers + 1;
    tokenInfo.owner = event.params.to.toHexString();
    tokenInfo.lastTransfer = event.block.timestamp;
    tokenInfo.blockNumber = event.block.timestamp;
  }
  tokenTransfer.from = event.params.from.toHexString();
  tokenTransfer.to = event.params.to.toHexString();
  tokenTransfer.transferredAt = event.block.timestamp;
  tokenTransfer.tokenId = event.params.tokenId;
  tokenInfo.transfers =
    event.params.tokenId.toString() + event.address.toHexString();
  tokenTransfer.save();
  tokenInfo.save();
}
