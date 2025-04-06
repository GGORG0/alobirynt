declare const __readonlyMarker: unique symbol;

export type ReadOnly<T> = T & { [__readonlyMarker]?: true };

type IsReadOnly<T> = [T] extends [{ [__readonlyMarker]?: true }] ? true : false;

export type Writeable<T> = {
  [K in keyof T as IsReadOnly<T[K]> extends true ? never : K]: T[K];
};
