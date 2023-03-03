import 'dotenv/config';

//this matches the .env values, so if they are changed - this will block all functions.
export enum Environments {
  Production = 'PRODUCTION',
  Staging = 'STAGING',
  Development = 'DEVELOPMENT',
  Test = 'TEST',
}

export const Restrict = (environments: Environments[]) => {
  return (
    target: any,
    memberName: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const shouldRun = Object.values(environments).includes(
      process.env.NODE_ENV as Environments,
    );

    // references the method being decorated
    const method = propertyDescriptor.value;

    propertyDescriptor.value = function (...args) {
      // exit the function
      if (!shouldRun) return;

      method.apply(this, args);
    };
  };
};
