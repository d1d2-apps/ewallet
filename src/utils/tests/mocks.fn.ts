import { Chance } from 'chance';

const chance = new Chance();

export const mockRandomPassword = (length = 10) => chance.string({ length });

export const mockRandomName = () => chance.name();

export const mockRandomEmail = () => chance.email();

export const mockRandomUuid = () => chance.guid();

export const mockRandomInvalidToken = () => chance.string({ length: 32 });
