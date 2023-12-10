import { FakeMailProvider } from './fakes/fake-mail.provider';
import { MailProvider } from './implementations/mail.provider';
import { SendInBlueMailProvider } from './implementations/send-in-blue-mail.provider';

export const mailServiceProvider = {
  provide: MailProvider,
  useClass: process.env.ENV === 'test' ? FakeMailProvider : SendInBlueMailProvider,
};
