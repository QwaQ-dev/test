import type { Abi, GetContractReturnType } from "viem"
import { getContract } from "viem"
import { getAbi, type ContractAbis, type VanaContract } from "../abi"
import { getContractAddress } from "../addresses"
import { createClient } from "../client"

// Map to cache controller instances
const controllers = new Map<VanaContract, GetContractReturnType<Abi>>()

export const Controller = <T extends VanaContract>(
  contract: T,
  client: ReturnType<typeof createClient> = createClient(),
): GetContractReturnType<ContractAbis[T]> => {
  let controller = controllers.get(contract)
  if (!controller) {
    controller = getContract({
      address: getContractAddress(client.chain.id, contract),
      abi: getAbi(contract) as Abi,
      client,
    })
    controllers.set(contract, controller)
  }
  return controller as GetContractReturnType<ContractAbis[T]>
}
