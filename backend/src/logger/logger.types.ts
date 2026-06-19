type DeepPrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | symbol
  | Date;

export type LogMessage =
  | DeepPrimitive
  | Error
  | { [key: string]: LogMessage }
  | LogMessage[];

export type LogContext = string | undefined;

export interface JsonLogEntry {
  timestamp: string;
  level: string;
  context: string;
  stack: string | null;
  message: LogMessage;
}

export interface TSKVLogEntry {
  [key: string]: string | undefined;
}
