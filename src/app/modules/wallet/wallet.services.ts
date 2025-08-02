import { QueryBuilder } from "../../utils/QueryBuilder"
import Wallet from "./wallet.model"

const getAllWallet = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Wallet.find(), query)

    const users = queryBuilder
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ])
    return {
        data,
        meta
    }
}

export const WalletServices = {
    getAllWallet
}