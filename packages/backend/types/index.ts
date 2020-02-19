export interface AnyObject<T> { [x: string]: T }
export type StringObject = AnyObject<string>
export type NumberObject = AnyObject<number>
