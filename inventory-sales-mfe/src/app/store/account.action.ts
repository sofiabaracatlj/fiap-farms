import { createAction, props } from '@ngrx/store';
import { Account } from '../shared/models/account';

export const setAccount = createAction('[Account] setAccount', props<{ account: Account }>());
export const setBalance = createAction('[Account] setBalance', props<{ balance: number }>());
export const setUserName = createAction('[Account] setName', props<{ name: string }>());

