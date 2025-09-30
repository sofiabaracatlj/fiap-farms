import { createReducer, on } from '@ngrx/store';
import { setAccount, setBalance, setUserName } from './account.action';
import { Account } from '../shared/models/account';

export interface AccountState {
    account: Account | null;
    balance: number;
    name: string;
}

const initialState: AccountState = {
    account: null,
    balance: 0,
    name: '',
};

export const accountReducer = createReducer(
    initialState,
    on(setAccount, (state, { account }) => {
        console.log('Set Account Action:', account);
        return {
            ...state,
            account,
        };
    }),
    on(setBalance, (state, { balance }) => {
        console.log('Set Balance Action:', balance);
        return {
            ...state,
            balance,
        };
    }),
    on(setUserName, (state, { name }) => {
        console.log('Set Name Action:', name);
        return {
            ...state,
            name,
        };
    })
);