import { inAppWallet } from "thirdweb/wallets";

export const wallets = [
    inAppWallet({
        auth: {
            options: [
                "email",
                "google",
            ],
        },
    })

];