import { log, json } from "@graphprotocol/graph-ts";
import { Contract, Transfer } from "../generated/Contract/Contract";
import { TokenTransfer, TokenInfo } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
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
    tokenInfo.transferredFrom = [event.params.from.toHexString()];
    tokenInfo.transferredTo = [event.params.to.toHexString()];
    tokenInfo.transferredAt = [event.block.timestamp];
    tokenInfo.tokenIds = [event.params.tokenId];
    let tokenContract = Contract.bind(event.address);
    tokenInfo.tokenURI = tokenContract.tokenURI(event.params.tokenId);
  } else {
    log.debug("Using existing token...", []);
    tokenInfo.numberOfTransfers = tokenInfo.numberOfTransfers + 1;
    tokenInfo.owner = event.params.to.toHexString();
    tokenInfo.lastTransfer = event.block.timestamp;
    tokenInfo.blockNumber = event.block.timestamp;
    tokenInfo.transferredFrom.push(event.params.from.toHexString());
    tokenInfo.transferredTo.push(event.params.to.toHexString());
    tokenInfo.transferredAt.push(event.block.timestamp);
    tokenInfo.tokenIds.push(event.params.tokenId);
  }

  tokenInfo.save();
}
