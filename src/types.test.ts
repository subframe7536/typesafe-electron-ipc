import type { ParseArray } from './types'

type Expect<T extends true> = T
type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false

export type Primitive = {
  number: Expect<Equal<ParseArray<number>, [number]>>
  string: Expect<Equal<ParseArray<string>, [string]>>
  boolean: Expect<Equal<ParseArray<boolean>, [boolean]>>
  symbol: Expect<Equal<ParseArray<symbol>, [symbol]>>
  bigint: Expect<Equal<ParseArray<bigint>, [bigint]>>
  object: Expect<Equal<ParseArray<{ test: number }>, [{ test: number }]>>
  arrays: Expect<Equal<ParseArray<string[]>, [string[]]>>
}

export type SingleArrays = {
  number: Expect<Equal<ParseArray<[number]>, [number]>>
  string: Expect<Equal<ParseArray<[string]>, [string]>>
  boolean: Expect<Equal<ParseArray<[boolean]>, [boolean]>>
  symbol: Expect<Equal<ParseArray<[symbol]>, [symbol]>>
  bigint: Expect<Equal<ParseArray<[bigint]>, [bigint]>>
  object: Expect<Equal<ParseArray<[{ test: number }]>, [{ test: number }]>>
  arrays: Expect<Equal<ParseArray<[string[]]>, [string[]]>>
}
export type MultiArrays = {
  numbers: Expect<Equal<ParseArray<[number, number]>, [number, number]>>
  mix: Expect<Equal<ParseArray<[string, number, { test: number }]>, [string, number, { test: number }]>>
  mixArrays: Expect<Equal<ParseArray<[{ test: string }[]]>, [{ test: string }[]]>>
}

export type Nullish = {
  null: Expect<Equal<ParseArray<null>, []>>
  undefined: Expect<Equal<ParseArray<undefined>, []>>
  nullArray: Expect<Equal<ParseArray<[null]>, []>>
  void: Expect<Equal<ParseArray<void>, []>>
}
