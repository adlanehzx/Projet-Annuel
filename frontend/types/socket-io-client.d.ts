declare module "socket.io-client" {
  export type Socket = {
    on: (event: string, listener: (...args: any[]) => void) => void;
    off: (event: string, listener?: (...args: any[]) => void) => void;
    emit: (event: string, ...args: any[]) => void;
    disconnect: () => void;
  };

  export function io(url: string, options?: any): Socket;
}
