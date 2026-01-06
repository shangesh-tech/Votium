import { createThirdwebClient, getContract } from "thirdweb";
import { defaultChain } from "@/lib/chains";

export const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const VotiumContract = getContract({
  client,
  chain: defaultChain,
  address: process.env.NEXT_PUBLIC_VOTIUM_CONTRACT_ADDRESS!,
});