declare module 'realms-shim' {
  class Realm {
    evaluate<T = unknown>(code: string, endowments: any): T;
  }

  const exportObj: {
    makeRootRealm(): Realm;
  };

  export default exportObj;
}
