import { BigInt, Entity, log, json } from "@graphprotocol/graph-ts";
import {
  Contract,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  SecondarySaleFees,
  Transfer,
} from "../generated/Contract/Contract";
import { TokenTransfer, TokenInfo } from "../generated/schema";

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSecondarySaleFees(event: SecondarySaleFees): void {}

export function handleTransfer(event: Transfer): void {
  // let transfer = new TokenTransfer(event.params.tokenId.toString());
  // transfer.from = event.params.from.toHexString();
  // transfer.to = event.params.to.toHexString();
  // transfer.transferredAt = event.block.timestamp;
  // transfer.tokenId = event.params.tokenId;
  log.debug("Transfer occured", [event.params.tokenId.toString()]);
  let tokenInfo = TokenInfo.load(event.params.tokenId.toString());

  if (!tokenInfo) {
    log.debug("Creating new token", []);
    tokenInfo = new TokenInfo(event.params.tokenId.toString());
    tokenInfo.contractAddress = event.address.toHexString();
    tokenInfo.creatorAddress = event.params.to.toHexString();
    tokenInfo.blockNumber = event.block.number;
    tokenInfo.mintTransactionHash = event.transaction.hash.toHexString();
    tokenInfo.createdOn = event.block.timestamp;
    tokenInfo.owner = event.params.to.toHexString();
    tokenInfo.lastTransfer = event.block.timestamp;
    tokenInfo.numberOfTransfers = 1;
    // tokenInfo.transfers.push(transfer.toString());
  }
  log.debug("Using existing token", []);
  tokenInfo.numberOfTransfers = tokenInfo.numberOfTransfers + 1;
  tokenInfo.owner = event.params.to.toHexString();
  tokenInfo.lastTransfer = event.block.timestamp;
  tokenInfo.blockNumber = event.block.timestamp;
  //tokenInfo.transfers.push(json.fromBytes(transfer).toString());
  // const tokenContract = Contract.bind(event.address);
  // tokenInfo.tokenURI = tokenContract.tokenURI(event.params.tokenId);
  tokenInfo.save();
}
