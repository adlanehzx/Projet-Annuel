declare module "socket.io-client" {
  export type Socket = {
    on: (event: string, listener: (...args: any[]) => void) => void;
    disconnect: () => void;
  };

  export function io(url: string, options?: any): Socket;
}
