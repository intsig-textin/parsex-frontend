/* eslint-disable @typescript-eslint/no-unused-vars */

export function storeCompose<Value, State = void>(...containers: any[]) {
  return function Component(props: any) {
    return containers.reduceRight((children, Container) => {
      return <Container.Provider>{children}</Container.Provider>;
    }, props.children);
  };
}
