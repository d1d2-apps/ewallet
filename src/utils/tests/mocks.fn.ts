import { Chance } from 'chance';

const chance = new Chance();

export function mockUser() {
  return {
    name: chance.name(),
    picture: chance.url(),
    email: chance.email(),
    password: chance.string({ length: 10 }),
  };
}
