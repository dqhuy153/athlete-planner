
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model GymExerciseMaster
 * 
 */
export type GymExerciseMaster = $Result.DefaultSelection<Prisma.$GymExerciseMasterPayload>
/**
 * Model RunningExerciseMaster
 * 
 */
export type RunningExerciseMaster = $Result.DefaultSelection<Prisma.$RunningExerciseMasterPayload>
/**
 * Model PrivateExercise
 * 
 */
export type PrivateExercise = $Result.DefaultSelection<Prisma.$PrivateExercisePayload>
/**
 * Model DailySchedule
 * 
 */
export type DailySchedule = $Result.DefaultSelection<Prisma.$DailySchedulePayload>
/**
 * Model ScheduleItem
 * 
 */
export type ScheduleItem = $Result.DefaultSelection<Prisma.$ScheduleItemPayload>
/**
 * Model BlogPost
 * 
 */
export type BlogPost = $Result.DefaultSelection<Prisma.$BlogPostPayload>
/**
 * Model BlogCategory
 * 
 */
export type BlogCategory = $Result.DefaultSelection<Prisma.$BlogCategoryPayload>
/**
 * Model Asset
 * 
 */
export type Asset = $Result.DefaultSelection<Prisma.$AssetPayload>
/**
 * Model AppConfig
 * 
 */
export type AppConfig = $Result.DefaultSelection<Prisma.$AppConfigPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserTier: {
  FREE: 'FREE',
  PRO: 'PRO'
};

export type UserTier = (typeof UserTier)[keyof typeof UserTier]


export const UserRole: {
  user: 'user',
  admin: 'admin',
  root: 'root'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const MuscleGroup: {
  Chest: 'Chest',
  Back: 'Back',
  Shoulders: 'Shoulders',
  Arms: 'Arms',
  Legs: 'Legs',
  Abs: 'Abs'
};

export type MuscleGroup = (typeof MuscleGroup)[keyof typeof MuscleGroup]


export const RunningType: {
  Interval: 'Interval',
  Easy: 'Easy',
  Tempo: 'Tempo',
  Long_Run: 'Long_Run'
};

export type RunningType = (typeof RunningType)[keyof typeof RunningType]


export const DayStatus: {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  REST: 'REST'
};

export type DayStatus = (typeof DayStatus)[keyof typeof DayStatus]

}

export type UserTier = $Enums.UserTier

export const UserTier: typeof $Enums.UserTier

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type MuscleGroup = $Enums.MuscleGroup

export const MuscleGroup: typeof $Enums.MuscleGroup

export type RunningType = $Enums.RunningType

export const RunningType: typeof $Enums.RunningType

export type DayStatus = $Enums.DayStatus

export const DayStatus: typeof $Enums.DayStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gymExerciseMaster`: Exposes CRUD operations for the **GymExerciseMaster** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GymExerciseMasters
    * const gymExerciseMasters = await prisma.gymExerciseMaster.findMany()
    * ```
    */
  get gymExerciseMaster(): Prisma.GymExerciseMasterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.runningExerciseMaster`: Exposes CRUD operations for the **RunningExerciseMaster** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RunningExerciseMasters
    * const runningExerciseMasters = await prisma.runningExerciseMaster.findMany()
    * ```
    */
  get runningExerciseMaster(): Prisma.RunningExerciseMasterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.privateExercise`: Exposes CRUD operations for the **PrivateExercise** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PrivateExercises
    * const privateExercises = await prisma.privateExercise.findMany()
    * ```
    */
  get privateExercise(): Prisma.PrivateExerciseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailySchedule`: Exposes CRUD operations for the **DailySchedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailySchedules
    * const dailySchedules = await prisma.dailySchedule.findMany()
    * ```
    */
  get dailySchedule(): Prisma.DailyScheduleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.scheduleItem`: Exposes CRUD operations for the **ScheduleItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScheduleItems
    * const scheduleItems = await prisma.scheduleItem.findMany()
    * ```
    */
  get scheduleItem(): Prisma.ScheduleItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.blogPost`: Exposes CRUD operations for the **BlogPost** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlogPosts
    * const blogPosts = await prisma.blogPost.findMany()
    * ```
    */
  get blogPost(): Prisma.BlogPostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.blogCategory`: Exposes CRUD operations for the **BlogCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlogCategories
    * const blogCategories = await prisma.blogCategory.findMany()
    * ```
    */
  get blogCategory(): Prisma.BlogCategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.asset`: Exposes CRUD operations for the **Asset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assets
    * const assets = await prisma.asset.findMany()
    * ```
    */
  get asset(): Prisma.AssetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appConfig`: Exposes CRUD operations for the **AppConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppConfigs
    * const appConfigs = await prisma.appConfig.findMany()
    * ```
    */
  get appConfig(): Prisma.AppConfigDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    GymExerciseMaster: 'GymExerciseMaster',
    RunningExerciseMaster: 'RunningExerciseMaster',
    PrivateExercise: 'PrivateExercise',
    DailySchedule: 'DailySchedule',
    ScheduleItem: 'ScheduleItem',
    BlogPost: 'BlogPost',
    BlogCategory: 'BlogCategory',
    Asset: 'Asset',
    AppConfig: 'AppConfig'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "gymExerciseMaster" | "runningExerciseMaster" | "privateExercise" | "dailySchedule" | "scheduleItem" | "blogPost" | "blogCategory" | "asset" | "appConfig"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      GymExerciseMaster: {
        payload: Prisma.$GymExerciseMasterPayload<ExtArgs>
        fields: Prisma.GymExerciseMasterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GymExerciseMasterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GymExerciseMasterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          findFirst: {
            args: Prisma.GymExerciseMasterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GymExerciseMasterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          findMany: {
            args: Prisma.GymExerciseMasterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>[]
          }
          create: {
            args: Prisma.GymExerciseMasterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          createMany: {
            args: Prisma.GymExerciseMasterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GymExerciseMasterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>[]
          }
          delete: {
            args: Prisma.GymExerciseMasterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          update: {
            args: Prisma.GymExerciseMasterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          deleteMany: {
            args: Prisma.GymExerciseMasterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GymExerciseMasterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GymExerciseMasterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>[]
          }
          upsert: {
            args: Prisma.GymExerciseMasterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GymExerciseMasterPayload>
          }
          aggregate: {
            args: Prisma.GymExerciseMasterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGymExerciseMaster>
          }
          groupBy: {
            args: Prisma.GymExerciseMasterGroupByArgs<ExtArgs>
            result: $Utils.Optional<GymExerciseMasterGroupByOutputType>[]
          }
          count: {
            args: Prisma.GymExerciseMasterCountArgs<ExtArgs>
            result: $Utils.Optional<GymExerciseMasterCountAggregateOutputType> | number
          }
        }
      }
      RunningExerciseMaster: {
        payload: Prisma.$RunningExerciseMasterPayload<ExtArgs>
        fields: Prisma.RunningExerciseMasterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RunningExerciseMasterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RunningExerciseMasterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          findFirst: {
            args: Prisma.RunningExerciseMasterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RunningExerciseMasterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          findMany: {
            args: Prisma.RunningExerciseMasterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>[]
          }
          create: {
            args: Prisma.RunningExerciseMasterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          createMany: {
            args: Prisma.RunningExerciseMasterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RunningExerciseMasterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>[]
          }
          delete: {
            args: Prisma.RunningExerciseMasterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          update: {
            args: Prisma.RunningExerciseMasterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          deleteMany: {
            args: Prisma.RunningExerciseMasterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RunningExerciseMasterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RunningExerciseMasterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>[]
          }
          upsert: {
            args: Prisma.RunningExerciseMasterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RunningExerciseMasterPayload>
          }
          aggregate: {
            args: Prisma.RunningExerciseMasterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRunningExerciseMaster>
          }
          groupBy: {
            args: Prisma.RunningExerciseMasterGroupByArgs<ExtArgs>
            result: $Utils.Optional<RunningExerciseMasterGroupByOutputType>[]
          }
          count: {
            args: Prisma.RunningExerciseMasterCountArgs<ExtArgs>
            result: $Utils.Optional<RunningExerciseMasterCountAggregateOutputType> | number
          }
        }
      }
      PrivateExercise: {
        payload: Prisma.$PrivateExercisePayload<ExtArgs>
        fields: Prisma.PrivateExerciseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PrivateExerciseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PrivateExerciseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          findFirst: {
            args: Prisma.PrivateExerciseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PrivateExerciseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          findMany: {
            args: Prisma.PrivateExerciseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>[]
          }
          create: {
            args: Prisma.PrivateExerciseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          createMany: {
            args: Prisma.PrivateExerciseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PrivateExerciseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>[]
          }
          delete: {
            args: Prisma.PrivateExerciseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          update: {
            args: Prisma.PrivateExerciseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          deleteMany: {
            args: Prisma.PrivateExerciseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PrivateExerciseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PrivateExerciseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>[]
          }
          upsert: {
            args: Prisma.PrivateExerciseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrivateExercisePayload>
          }
          aggregate: {
            args: Prisma.PrivateExerciseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePrivateExercise>
          }
          groupBy: {
            args: Prisma.PrivateExerciseGroupByArgs<ExtArgs>
            result: $Utils.Optional<PrivateExerciseGroupByOutputType>[]
          }
          count: {
            args: Prisma.PrivateExerciseCountArgs<ExtArgs>
            result: $Utils.Optional<PrivateExerciseCountAggregateOutputType> | number
          }
        }
      }
      DailySchedule: {
        payload: Prisma.$DailySchedulePayload<ExtArgs>
        fields: Prisma.DailyScheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyScheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyScheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          findFirst: {
            args: Prisma.DailyScheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyScheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          findMany: {
            args: Prisma.DailyScheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>[]
          }
          create: {
            args: Prisma.DailyScheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          createMany: {
            args: Prisma.DailyScheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailyScheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>[]
          }
          delete: {
            args: Prisma.DailyScheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          update: {
            args: Prisma.DailyScheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          deleteMany: {
            args: Prisma.DailyScheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyScheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DailyScheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>[]
          }
          upsert: {
            args: Prisma.DailyScheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySchedulePayload>
          }
          aggregate: {
            args: Prisma.DailyScheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailySchedule>
          }
          groupBy: {
            args: Prisma.DailyScheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyScheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyScheduleCountArgs<ExtArgs>
            result: $Utils.Optional<DailyScheduleCountAggregateOutputType> | number
          }
        }
      }
      ScheduleItem: {
        payload: Prisma.$ScheduleItemPayload<ExtArgs>
        fields: Prisma.ScheduleItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScheduleItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScheduleItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          findFirst: {
            args: Prisma.ScheduleItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScheduleItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          findMany: {
            args: Prisma.ScheduleItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>[]
          }
          create: {
            args: Prisma.ScheduleItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          createMany: {
            args: Prisma.ScheduleItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScheduleItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>[]
          }
          delete: {
            args: Prisma.ScheduleItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          update: {
            args: Prisma.ScheduleItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          deleteMany: {
            args: Prisma.ScheduleItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScheduleItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScheduleItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>[]
          }
          upsert: {
            args: Prisma.ScheduleItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScheduleItemPayload>
          }
          aggregate: {
            args: Prisma.ScheduleItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScheduleItem>
          }
          groupBy: {
            args: Prisma.ScheduleItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScheduleItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScheduleItemCountArgs<ExtArgs>
            result: $Utils.Optional<ScheduleItemCountAggregateOutputType> | number
          }
        }
      }
      BlogPost: {
        payload: Prisma.$BlogPostPayload<ExtArgs>
        fields: Prisma.BlogPostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlogPostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlogPostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          findFirst: {
            args: Prisma.BlogPostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlogPostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          findMany: {
            args: Prisma.BlogPostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          create: {
            args: Prisma.BlogPostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          createMany: {
            args: Prisma.BlogPostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlogPostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          delete: {
            args: Prisma.BlogPostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          update: {
            args: Prisma.BlogPostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          deleteMany: {
            args: Prisma.BlogPostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlogPostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlogPostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          upsert: {
            args: Prisma.BlogPostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          aggregate: {
            args: Prisma.BlogPostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlogPost>
          }
          groupBy: {
            args: Prisma.BlogPostGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlogPostGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlogPostCountArgs<ExtArgs>
            result: $Utils.Optional<BlogPostCountAggregateOutputType> | number
          }
        }
      }
      BlogCategory: {
        payload: Prisma.$BlogCategoryPayload<ExtArgs>
        fields: Prisma.BlogCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlogCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlogCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          findFirst: {
            args: Prisma.BlogCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlogCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          findMany: {
            args: Prisma.BlogCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>[]
          }
          create: {
            args: Prisma.BlogCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          createMany: {
            args: Prisma.BlogCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlogCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>[]
          }
          delete: {
            args: Prisma.BlogCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          update: {
            args: Prisma.BlogCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          deleteMany: {
            args: Prisma.BlogCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlogCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlogCategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>[]
          }
          upsert: {
            args: Prisma.BlogCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogCategoryPayload>
          }
          aggregate: {
            args: Prisma.BlogCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlogCategory>
          }
          groupBy: {
            args: Prisma.BlogCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlogCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlogCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<BlogCategoryCountAggregateOutputType> | number
          }
        }
      }
      Asset: {
        payload: Prisma.$AssetPayload<ExtArgs>
        fields: Prisma.AssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findFirst: {
            args: Prisma.AssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findMany: {
            args: Prisma.AssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          create: {
            args: Prisma.AssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          createMany: {
            args: Prisma.AssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          delete: {
            args: Prisma.AssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          update: {
            args: Prisma.AssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          deleteMany: {
            args: Prisma.AssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          upsert: {
            args: Prisma.AssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          aggregate: {
            args: Prisma.AssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsset>
          }
          groupBy: {
            args: Prisma.AssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetCountArgs<ExtArgs>
            result: $Utils.Optional<AssetCountAggregateOutputType> | number
          }
        }
      }
      AppConfig: {
        payload: Prisma.$AppConfigPayload<ExtArgs>
        fields: Prisma.AppConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          findFirst: {
            args: Prisma.AppConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          findMany: {
            args: Prisma.AppConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>[]
          }
          create: {
            args: Prisma.AppConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          createMany: {
            args: Prisma.AppConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>[]
          }
          delete: {
            args: Prisma.AppConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          update: {
            args: Prisma.AppConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          deleteMany: {
            args: Prisma.AppConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>[]
          }
          upsert: {
            args: Prisma.AppConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          aggregate: {
            args: Prisma.AppConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppConfig>
          }
          groupBy: {
            args: Prisma.AppConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppConfigCountArgs<ExtArgs>
            result: $Utils.Optional<AppConfigCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    gymExerciseMaster?: GymExerciseMasterOmit
    runningExerciseMaster?: RunningExerciseMasterOmit
    privateExercise?: PrivateExerciseOmit
    dailySchedule?: DailyScheduleOmit
    scheduleItem?: ScheduleItemOmit
    blogPost?: BlogPostOmit
    blogCategory?: BlogCategoryOmit
    asset?: AssetOmit
    appConfig?: AppConfigOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    privateExercises: number
    dailySchedules: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    privateExercises?: boolean | UserCountOutputTypeCountPrivateExercisesArgs
    dailySchedules?: boolean | UserCountOutputTypeCountDailySchedulesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPrivateExercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrivateExerciseWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDailySchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyScheduleWhereInput
  }


  /**
   * Count Type GymExerciseMasterCountOutputType
   */

  export type GymExerciseMasterCountOutputType = {
    scheduleItems: number
  }

  export type GymExerciseMasterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheduleItems?: boolean | GymExerciseMasterCountOutputTypeCountScheduleItemsArgs
  }

  // Custom InputTypes
  /**
   * GymExerciseMasterCountOutputType without action
   */
  export type GymExerciseMasterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMasterCountOutputType
     */
    select?: GymExerciseMasterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GymExerciseMasterCountOutputType without action
   */
  export type GymExerciseMasterCountOutputTypeCountScheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleItemWhereInput
  }


  /**
   * Count Type RunningExerciseMasterCountOutputType
   */

  export type RunningExerciseMasterCountOutputType = {
    scheduleItems: number
  }

  export type RunningExerciseMasterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheduleItems?: boolean | RunningExerciseMasterCountOutputTypeCountScheduleItemsArgs
  }

  // Custom InputTypes
  /**
   * RunningExerciseMasterCountOutputType without action
   */
  export type RunningExerciseMasterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMasterCountOutputType
     */
    select?: RunningExerciseMasterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RunningExerciseMasterCountOutputType without action
   */
  export type RunningExerciseMasterCountOutputTypeCountScheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleItemWhereInput
  }


  /**
   * Count Type PrivateExerciseCountOutputType
   */

  export type PrivateExerciseCountOutputType = {
    scheduleItems: number
  }

  export type PrivateExerciseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheduleItems?: boolean | PrivateExerciseCountOutputTypeCountScheduleItemsArgs
  }

  // Custom InputTypes
  /**
   * PrivateExerciseCountOutputType without action
   */
  export type PrivateExerciseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExerciseCountOutputType
     */
    select?: PrivateExerciseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PrivateExerciseCountOutputType without action
   */
  export type PrivateExerciseCountOutputTypeCountScheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleItemWhereInput
  }


  /**
   * Count Type DailyScheduleCountOutputType
   */

  export type DailyScheduleCountOutputType = {
    items: number
  }

  export type DailyScheduleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | DailyScheduleCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * DailyScheduleCountOutputType without action
   */
  export type DailyScheduleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyScheduleCountOutputType
     */
    select?: DailyScheduleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DailyScheduleCountOutputType without action
   */
  export type DailyScheduleCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleItemWhereInput
  }


  /**
   * Count Type BlogCategoryCountOutputType
   */

  export type BlogCategoryCountOutputType = {
    posts: number
  }

  export type BlogCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | BlogCategoryCountOutputTypeCountPostsArgs
  }

  // Custom InputTypes
  /**
   * BlogCategoryCountOutputType without action
   */
  export type BlogCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategoryCountOutputType
     */
    select?: BlogCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BlogCategoryCountOutputType without action
   */
  export type BlogCategoryCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogPostWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    googleId: string | null
    avatarUrl: string | null
    tier: $Enums.UserTier | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    googleId: string | null
    avatarUrl: string | null
    tier: $Enums.UserTier | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    googleId: number
    avatarUrl: number
    tier: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    googleId?: true
    avatarUrl?: true
    tier?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    googleId?: true
    avatarUrl?: true
    tier?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    googleId?: true
    avatarUrl?: true
    tier?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    googleId: string | null
    avatarUrl: string | null
    tier: $Enums.UserTier
    role: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    googleId?: boolean
    avatarUrl?: boolean
    tier?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    privateExercises?: boolean | User$privateExercisesArgs<ExtArgs>
    dailySchedules?: boolean | User$dailySchedulesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    googleId?: boolean
    avatarUrl?: boolean
    tier?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    googleId?: boolean
    avatarUrl?: boolean
    tier?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    googleId?: boolean
    avatarUrl?: boolean
    tier?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "googleId" | "avatarUrl" | "tier" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    privateExercises?: boolean | User$privateExercisesArgs<ExtArgs>
    dailySchedules?: boolean | User$dailySchedulesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      privateExercises: Prisma.$PrivateExercisePayload<ExtArgs>[]
      dailySchedules: Prisma.$DailySchedulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      googleId: string | null
      avatarUrl: string | null
      tier: $Enums.UserTier
      role: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    privateExercises<T extends User$privateExercisesArgs<ExtArgs> = {}>(args?: Subset<T, User$privateExercisesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dailySchedules<T extends User$dailySchedulesArgs<ExtArgs> = {}>(args?: Subset<T, User$dailySchedulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly googleId: FieldRef<"User", 'String'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly tier: FieldRef<"User", 'UserTier'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.privateExercises
   */
  export type User$privateExercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    where?: PrivateExerciseWhereInput
    orderBy?: PrivateExerciseOrderByWithRelationInput | PrivateExerciseOrderByWithRelationInput[]
    cursor?: PrivateExerciseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PrivateExerciseScalarFieldEnum | PrivateExerciseScalarFieldEnum[]
  }

  /**
   * User.dailySchedules
   */
  export type User$dailySchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    where?: DailyScheduleWhereInput
    orderBy?: DailyScheduleOrderByWithRelationInput | DailyScheduleOrderByWithRelationInput[]
    cursor?: DailyScheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DailyScheduleScalarFieldEnum | DailyScheduleScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model GymExerciseMaster
   */

  export type AggregateGymExerciseMaster = {
    _count: GymExerciseMasterCountAggregateOutputType | null
    _min: GymExerciseMasterMinAggregateOutputType | null
    _max: GymExerciseMasterMaxAggregateOutputType | null
  }

  export type GymExerciseMasterMinAggregateOutputType = {
    id: string | null
    isActive: boolean | null
    name: string | null
    vietnameseName: string | null
    targetMuscleGroup: $Enums.MuscleGroup | null
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    garminExerciseEnum: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GymExerciseMasterMaxAggregateOutputType = {
    id: string | null
    isActive: boolean | null
    name: string | null
    vietnameseName: string | null
    targetMuscleGroup: $Enums.MuscleGroup | null
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    garminExerciseEnum: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GymExerciseMasterCountAggregateOutputType = {
    id: number
    isActive: number
    name: number
    vietnameseName: number
    targetMuscleGroup: number
    secondaryMuscleGroups: number
    youtubeEmbedUrl: number
    gifUrl: number
    garminExerciseEnum: number
    instructions: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GymExerciseMasterMinAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    targetMuscleGroup?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    garminExerciseEnum?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GymExerciseMasterMaxAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    targetMuscleGroup?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    garminExerciseEnum?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GymExerciseMasterCountAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    targetMuscleGroup?: true
    secondaryMuscleGroups?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    garminExerciseEnum?: true
    instructions?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GymExerciseMasterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GymExerciseMaster to aggregate.
     */
    where?: GymExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GymExerciseMasters to fetch.
     */
    orderBy?: GymExerciseMasterOrderByWithRelationInput | GymExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GymExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GymExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GymExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GymExerciseMasters
    **/
    _count?: true | GymExerciseMasterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GymExerciseMasterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GymExerciseMasterMaxAggregateInputType
  }

  export type GetGymExerciseMasterAggregateType<T extends GymExerciseMasterAggregateArgs> = {
        [P in keyof T & keyof AggregateGymExerciseMaster]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGymExerciseMaster[P]>
      : GetScalarType<T[P], AggregateGymExerciseMaster[P]>
  }




  export type GymExerciseMasterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GymExerciseMasterWhereInput
    orderBy?: GymExerciseMasterOrderByWithAggregationInput | GymExerciseMasterOrderByWithAggregationInput[]
    by: GymExerciseMasterScalarFieldEnum[] | GymExerciseMasterScalarFieldEnum
    having?: GymExerciseMasterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GymExerciseMasterCountAggregateInputType | true
    _min?: GymExerciseMasterMinAggregateInputType
    _max?: GymExerciseMasterMaxAggregateInputType
  }

  export type GymExerciseMasterGroupByOutputType = {
    id: string
    isActive: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups: string[]
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    garminExerciseEnum: string | null
    instructions: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: GymExerciseMasterCountAggregateOutputType | null
    _min: GymExerciseMasterMinAggregateOutputType | null
    _max: GymExerciseMasterMaxAggregateOutputType | null
  }

  type GetGymExerciseMasterGroupByPayload<T extends GymExerciseMasterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GymExerciseMasterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GymExerciseMasterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GymExerciseMasterGroupByOutputType[P]>
            : GetScalarType<T[P], GymExerciseMasterGroupByOutputType[P]>
        }
      >
    >


  export type GymExerciseMasterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    targetMuscleGroup?: boolean
    secondaryMuscleGroups?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    garminExerciseEnum?: boolean
    instructions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    scheduleItems?: boolean | GymExerciseMaster$scheduleItemsArgs<ExtArgs>
    _count?: boolean | GymExerciseMasterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gymExerciseMaster"]>

  export type GymExerciseMasterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    targetMuscleGroup?: boolean
    secondaryMuscleGroups?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    garminExerciseEnum?: boolean
    instructions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["gymExerciseMaster"]>

  export type GymExerciseMasterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    targetMuscleGroup?: boolean
    secondaryMuscleGroups?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    garminExerciseEnum?: boolean
    instructions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["gymExerciseMaster"]>

  export type GymExerciseMasterSelectScalar = {
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    targetMuscleGroup?: boolean
    secondaryMuscleGroups?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    garminExerciseEnum?: boolean
    instructions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GymExerciseMasterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "isActive" | "name" | "vietnameseName" | "targetMuscleGroup" | "secondaryMuscleGroups" | "youtubeEmbedUrl" | "gifUrl" | "garminExerciseEnum" | "instructions" | "createdAt" | "updatedAt", ExtArgs["result"]["gymExerciseMaster"]>
  export type GymExerciseMasterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheduleItems?: boolean | GymExerciseMaster$scheduleItemsArgs<ExtArgs>
    _count?: boolean | GymExerciseMasterCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GymExerciseMasterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type GymExerciseMasterIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GymExerciseMasterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GymExerciseMaster"
    objects: {
      scheduleItems: Prisma.$ScheduleItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      isActive: boolean
      name: string
      vietnameseName: string
      targetMuscleGroup: $Enums.MuscleGroup
      secondaryMuscleGroups: string[]
      youtubeEmbedUrl: string | null
      gifUrl: string | null
      garminExerciseEnum: string | null
      instructions: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gymExerciseMaster"]>
    composites: {}
  }

  type GymExerciseMasterGetPayload<S extends boolean | null | undefined | GymExerciseMasterDefaultArgs> = $Result.GetResult<Prisma.$GymExerciseMasterPayload, S>

  type GymExerciseMasterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GymExerciseMasterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GymExerciseMasterCountAggregateInputType | true
    }

  export interface GymExerciseMasterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GymExerciseMaster'], meta: { name: 'GymExerciseMaster' } }
    /**
     * Find zero or one GymExerciseMaster that matches the filter.
     * @param {GymExerciseMasterFindUniqueArgs} args - Arguments to find a GymExerciseMaster
     * @example
     * // Get one GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GymExerciseMasterFindUniqueArgs>(args: SelectSubset<T, GymExerciseMasterFindUniqueArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GymExerciseMaster that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GymExerciseMasterFindUniqueOrThrowArgs} args - Arguments to find a GymExerciseMaster
     * @example
     * // Get one GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GymExerciseMasterFindUniqueOrThrowArgs>(args: SelectSubset<T, GymExerciseMasterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GymExerciseMaster that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterFindFirstArgs} args - Arguments to find a GymExerciseMaster
     * @example
     * // Get one GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GymExerciseMasterFindFirstArgs>(args?: SelectSubset<T, GymExerciseMasterFindFirstArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GymExerciseMaster that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterFindFirstOrThrowArgs} args - Arguments to find a GymExerciseMaster
     * @example
     * // Get one GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GymExerciseMasterFindFirstOrThrowArgs>(args?: SelectSubset<T, GymExerciseMasterFindFirstOrThrowArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GymExerciseMasters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GymExerciseMasters
     * const gymExerciseMasters = await prisma.gymExerciseMaster.findMany()
     * 
     * // Get first 10 GymExerciseMasters
     * const gymExerciseMasters = await prisma.gymExerciseMaster.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gymExerciseMasterWithIdOnly = await prisma.gymExerciseMaster.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GymExerciseMasterFindManyArgs>(args?: SelectSubset<T, GymExerciseMasterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GymExerciseMaster.
     * @param {GymExerciseMasterCreateArgs} args - Arguments to create a GymExerciseMaster.
     * @example
     * // Create one GymExerciseMaster
     * const GymExerciseMaster = await prisma.gymExerciseMaster.create({
     *   data: {
     *     // ... data to create a GymExerciseMaster
     *   }
     * })
     * 
     */
    create<T extends GymExerciseMasterCreateArgs>(args: SelectSubset<T, GymExerciseMasterCreateArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GymExerciseMasters.
     * @param {GymExerciseMasterCreateManyArgs} args - Arguments to create many GymExerciseMasters.
     * @example
     * // Create many GymExerciseMasters
     * const gymExerciseMaster = await prisma.gymExerciseMaster.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GymExerciseMasterCreateManyArgs>(args?: SelectSubset<T, GymExerciseMasterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GymExerciseMasters and returns the data saved in the database.
     * @param {GymExerciseMasterCreateManyAndReturnArgs} args - Arguments to create many GymExerciseMasters.
     * @example
     * // Create many GymExerciseMasters
     * const gymExerciseMaster = await prisma.gymExerciseMaster.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GymExerciseMasters and only return the `id`
     * const gymExerciseMasterWithIdOnly = await prisma.gymExerciseMaster.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GymExerciseMasterCreateManyAndReturnArgs>(args?: SelectSubset<T, GymExerciseMasterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GymExerciseMaster.
     * @param {GymExerciseMasterDeleteArgs} args - Arguments to delete one GymExerciseMaster.
     * @example
     * // Delete one GymExerciseMaster
     * const GymExerciseMaster = await prisma.gymExerciseMaster.delete({
     *   where: {
     *     // ... filter to delete one GymExerciseMaster
     *   }
     * })
     * 
     */
    delete<T extends GymExerciseMasterDeleteArgs>(args: SelectSubset<T, GymExerciseMasterDeleteArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GymExerciseMaster.
     * @param {GymExerciseMasterUpdateArgs} args - Arguments to update one GymExerciseMaster.
     * @example
     * // Update one GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GymExerciseMasterUpdateArgs>(args: SelectSubset<T, GymExerciseMasterUpdateArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GymExerciseMasters.
     * @param {GymExerciseMasterDeleteManyArgs} args - Arguments to filter GymExerciseMasters to delete.
     * @example
     * // Delete a few GymExerciseMasters
     * const { count } = await prisma.gymExerciseMaster.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GymExerciseMasterDeleteManyArgs>(args?: SelectSubset<T, GymExerciseMasterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GymExerciseMasters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GymExerciseMasters
     * const gymExerciseMaster = await prisma.gymExerciseMaster.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GymExerciseMasterUpdateManyArgs>(args: SelectSubset<T, GymExerciseMasterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GymExerciseMasters and returns the data updated in the database.
     * @param {GymExerciseMasterUpdateManyAndReturnArgs} args - Arguments to update many GymExerciseMasters.
     * @example
     * // Update many GymExerciseMasters
     * const gymExerciseMaster = await prisma.gymExerciseMaster.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GymExerciseMasters and only return the `id`
     * const gymExerciseMasterWithIdOnly = await prisma.gymExerciseMaster.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GymExerciseMasterUpdateManyAndReturnArgs>(args: SelectSubset<T, GymExerciseMasterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GymExerciseMaster.
     * @param {GymExerciseMasterUpsertArgs} args - Arguments to update or create a GymExerciseMaster.
     * @example
     * // Update or create a GymExerciseMaster
     * const gymExerciseMaster = await prisma.gymExerciseMaster.upsert({
     *   create: {
     *     // ... data to create a GymExerciseMaster
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GymExerciseMaster we want to update
     *   }
     * })
     */
    upsert<T extends GymExerciseMasterUpsertArgs>(args: SelectSubset<T, GymExerciseMasterUpsertArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GymExerciseMasters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterCountArgs} args - Arguments to filter GymExerciseMasters to count.
     * @example
     * // Count the number of GymExerciseMasters
     * const count = await prisma.gymExerciseMaster.count({
     *   where: {
     *     // ... the filter for the GymExerciseMasters we want to count
     *   }
     * })
    **/
    count<T extends GymExerciseMasterCountArgs>(
      args?: Subset<T, GymExerciseMasterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GymExerciseMasterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GymExerciseMaster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GymExerciseMasterAggregateArgs>(args: Subset<T, GymExerciseMasterAggregateArgs>): Prisma.PrismaPromise<GetGymExerciseMasterAggregateType<T>>

    /**
     * Group by GymExerciseMaster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GymExerciseMasterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GymExerciseMasterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GymExerciseMasterGroupByArgs['orderBy'] }
        : { orderBy?: GymExerciseMasterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GymExerciseMasterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGymExerciseMasterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GymExerciseMaster model
   */
  readonly fields: GymExerciseMasterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GymExerciseMaster.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GymExerciseMasterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    scheduleItems<T extends GymExerciseMaster$scheduleItemsArgs<ExtArgs> = {}>(args?: Subset<T, GymExerciseMaster$scheduleItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GymExerciseMaster model
   */
  interface GymExerciseMasterFieldRefs {
    readonly id: FieldRef<"GymExerciseMaster", 'String'>
    readonly isActive: FieldRef<"GymExerciseMaster", 'Boolean'>
    readonly name: FieldRef<"GymExerciseMaster", 'String'>
    readonly vietnameseName: FieldRef<"GymExerciseMaster", 'String'>
    readonly targetMuscleGroup: FieldRef<"GymExerciseMaster", 'MuscleGroup'>
    readonly secondaryMuscleGroups: FieldRef<"GymExerciseMaster", 'String[]'>
    readonly youtubeEmbedUrl: FieldRef<"GymExerciseMaster", 'String'>
    readonly gifUrl: FieldRef<"GymExerciseMaster", 'String'>
    readonly garminExerciseEnum: FieldRef<"GymExerciseMaster", 'String'>
    readonly instructions: FieldRef<"GymExerciseMaster", 'Json'>
    readonly createdAt: FieldRef<"GymExerciseMaster", 'DateTime'>
    readonly updatedAt: FieldRef<"GymExerciseMaster", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GymExerciseMaster findUnique
   */
  export type GymExerciseMasterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which GymExerciseMaster to fetch.
     */
    where: GymExerciseMasterWhereUniqueInput
  }

  /**
   * GymExerciseMaster findUniqueOrThrow
   */
  export type GymExerciseMasterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which GymExerciseMaster to fetch.
     */
    where: GymExerciseMasterWhereUniqueInput
  }

  /**
   * GymExerciseMaster findFirst
   */
  export type GymExerciseMasterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which GymExerciseMaster to fetch.
     */
    where?: GymExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GymExerciseMasters to fetch.
     */
    orderBy?: GymExerciseMasterOrderByWithRelationInput | GymExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GymExerciseMasters.
     */
    cursor?: GymExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GymExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GymExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GymExerciseMasters.
     */
    distinct?: GymExerciseMasterScalarFieldEnum | GymExerciseMasterScalarFieldEnum[]
  }

  /**
   * GymExerciseMaster findFirstOrThrow
   */
  export type GymExerciseMasterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which GymExerciseMaster to fetch.
     */
    where?: GymExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GymExerciseMasters to fetch.
     */
    orderBy?: GymExerciseMasterOrderByWithRelationInput | GymExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GymExerciseMasters.
     */
    cursor?: GymExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GymExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GymExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GymExerciseMasters.
     */
    distinct?: GymExerciseMasterScalarFieldEnum | GymExerciseMasterScalarFieldEnum[]
  }

  /**
   * GymExerciseMaster findMany
   */
  export type GymExerciseMasterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which GymExerciseMasters to fetch.
     */
    where?: GymExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GymExerciseMasters to fetch.
     */
    orderBy?: GymExerciseMasterOrderByWithRelationInput | GymExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GymExerciseMasters.
     */
    cursor?: GymExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GymExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GymExerciseMasters.
     */
    skip?: number
    distinct?: GymExerciseMasterScalarFieldEnum | GymExerciseMasterScalarFieldEnum[]
  }

  /**
   * GymExerciseMaster create
   */
  export type GymExerciseMasterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * The data needed to create a GymExerciseMaster.
     */
    data: XOR<GymExerciseMasterCreateInput, GymExerciseMasterUncheckedCreateInput>
  }

  /**
   * GymExerciseMaster createMany
   */
  export type GymExerciseMasterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GymExerciseMasters.
     */
    data: GymExerciseMasterCreateManyInput | GymExerciseMasterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GymExerciseMaster createManyAndReturn
   */
  export type GymExerciseMasterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * The data used to create many GymExerciseMasters.
     */
    data: GymExerciseMasterCreateManyInput | GymExerciseMasterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GymExerciseMaster update
   */
  export type GymExerciseMasterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * The data needed to update a GymExerciseMaster.
     */
    data: XOR<GymExerciseMasterUpdateInput, GymExerciseMasterUncheckedUpdateInput>
    /**
     * Choose, which GymExerciseMaster to update.
     */
    where: GymExerciseMasterWhereUniqueInput
  }

  /**
   * GymExerciseMaster updateMany
   */
  export type GymExerciseMasterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GymExerciseMasters.
     */
    data: XOR<GymExerciseMasterUpdateManyMutationInput, GymExerciseMasterUncheckedUpdateManyInput>
    /**
     * Filter which GymExerciseMasters to update
     */
    where?: GymExerciseMasterWhereInput
    /**
     * Limit how many GymExerciseMasters to update.
     */
    limit?: number
  }

  /**
   * GymExerciseMaster updateManyAndReturn
   */
  export type GymExerciseMasterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * The data used to update GymExerciseMasters.
     */
    data: XOR<GymExerciseMasterUpdateManyMutationInput, GymExerciseMasterUncheckedUpdateManyInput>
    /**
     * Filter which GymExerciseMasters to update
     */
    where?: GymExerciseMasterWhereInput
    /**
     * Limit how many GymExerciseMasters to update.
     */
    limit?: number
  }

  /**
   * GymExerciseMaster upsert
   */
  export type GymExerciseMasterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * The filter to search for the GymExerciseMaster to update in case it exists.
     */
    where: GymExerciseMasterWhereUniqueInput
    /**
     * In case the GymExerciseMaster found by the `where` argument doesn't exist, create a new GymExerciseMaster with this data.
     */
    create: XOR<GymExerciseMasterCreateInput, GymExerciseMasterUncheckedCreateInput>
    /**
     * In case the GymExerciseMaster was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GymExerciseMasterUpdateInput, GymExerciseMasterUncheckedUpdateInput>
  }

  /**
   * GymExerciseMaster delete
   */
  export type GymExerciseMasterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter which GymExerciseMaster to delete.
     */
    where: GymExerciseMasterWhereUniqueInput
  }

  /**
   * GymExerciseMaster deleteMany
   */
  export type GymExerciseMasterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GymExerciseMasters to delete
     */
    where?: GymExerciseMasterWhereInput
    /**
     * Limit how many GymExerciseMasters to delete.
     */
    limit?: number
  }

  /**
   * GymExerciseMaster.scheduleItems
   */
  export type GymExerciseMaster$scheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    where?: ScheduleItemWhereInput
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    cursor?: ScheduleItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * GymExerciseMaster without action
   */
  export type GymExerciseMasterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
  }


  /**
   * Model RunningExerciseMaster
   */

  export type AggregateRunningExerciseMaster = {
    _count: RunningExerciseMasterCountAggregateOutputType | null
    _min: RunningExerciseMasterMinAggregateOutputType | null
    _max: RunningExerciseMasterMaxAggregateOutputType | null
  }

  export type RunningExerciseMasterMinAggregateOutputType = {
    id: string | null
    isActive: boolean | null
    name: string | null
    vietnameseName: string | null
    runningType: $Enums.RunningType | null
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RunningExerciseMasterMaxAggregateOutputType = {
    id: string | null
    isActive: boolean | null
    name: string | null
    vietnameseName: string | null
    runningType: $Enums.RunningType | null
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RunningExerciseMasterCountAggregateOutputType = {
    id: number
    isActive: number
    name: number
    vietnameseName: number
    runningType: number
    youtubeEmbedUrl: number
    gifUrl: number
    instructions: number
    workoutStructure: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RunningExerciseMasterMinAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    runningType?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RunningExerciseMasterMaxAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    runningType?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RunningExerciseMasterCountAggregateInputType = {
    id?: true
    isActive?: true
    name?: true
    vietnameseName?: true
    runningType?: true
    youtubeEmbedUrl?: true
    gifUrl?: true
    instructions?: true
    workoutStructure?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RunningExerciseMasterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RunningExerciseMaster to aggregate.
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RunningExerciseMasters to fetch.
     */
    orderBy?: RunningExerciseMasterOrderByWithRelationInput | RunningExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RunningExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RunningExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RunningExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RunningExerciseMasters
    **/
    _count?: true | RunningExerciseMasterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RunningExerciseMasterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RunningExerciseMasterMaxAggregateInputType
  }

  export type GetRunningExerciseMasterAggregateType<T extends RunningExerciseMasterAggregateArgs> = {
        [P in keyof T & keyof AggregateRunningExerciseMaster]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRunningExerciseMaster[P]>
      : GetScalarType<T[P], AggregateRunningExerciseMaster[P]>
  }




  export type RunningExerciseMasterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RunningExerciseMasterWhereInput
    orderBy?: RunningExerciseMasterOrderByWithAggregationInput | RunningExerciseMasterOrderByWithAggregationInput[]
    by: RunningExerciseMasterScalarFieldEnum[] | RunningExerciseMasterScalarFieldEnum
    having?: RunningExerciseMasterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RunningExerciseMasterCountAggregateInputType | true
    _min?: RunningExerciseMasterMinAggregateInputType
    _max?: RunningExerciseMasterMaxAggregateInputType
  }

  export type RunningExerciseMasterGroupByOutputType = {
    id: string
    isActive: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl: string | null
    gifUrl: string | null
    instructions: JsonValue
    workoutStructure: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: RunningExerciseMasterCountAggregateOutputType | null
    _min: RunningExerciseMasterMinAggregateOutputType | null
    _max: RunningExerciseMasterMaxAggregateOutputType | null
  }

  type GetRunningExerciseMasterGroupByPayload<T extends RunningExerciseMasterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RunningExerciseMasterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RunningExerciseMasterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RunningExerciseMasterGroupByOutputType[P]>
            : GetScalarType<T[P], RunningExerciseMasterGroupByOutputType[P]>
        }
      >
    >


  export type RunningExerciseMasterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    runningType?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    instructions?: boolean
    workoutStructure?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    scheduleItems?: boolean | RunningExerciseMaster$scheduleItemsArgs<ExtArgs>
    _count?: boolean | RunningExerciseMasterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["runningExerciseMaster"]>

  export type RunningExerciseMasterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    runningType?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    instructions?: boolean
    workoutStructure?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["runningExerciseMaster"]>

  export type RunningExerciseMasterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    runningType?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    instructions?: boolean
    workoutStructure?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["runningExerciseMaster"]>

  export type RunningExerciseMasterSelectScalar = {
    id?: boolean
    isActive?: boolean
    name?: boolean
    vietnameseName?: boolean
    runningType?: boolean
    youtubeEmbedUrl?: boolean
    gifUrl?: boolean
    instructions?: boolean
    workoutStructure?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RunningExerciseMasterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "isActive" | "name" | "vietnameseName" | "runningType" | "youtubeEmbedUrl" | "gifUrl" | "instructions" | "workoutStructure" | "createdAt" | "updatedAt", ExtArgs["result"]["runningExerciseMaster"]>
  export type RunningExerciseMasterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scheduleItems?: boolean | RunningExerciseMaster$scheduleItemsArgs<ExtArgs>
    _count?: boolean | RunningExerciseMasterCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RunningExerciseMasterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RunningExerciseMasterIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RunningExerciseMasterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RunningExerciseMaster"
    objects: {
      scheduleItems: Prisma.$ScheduleItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      isActive: boolean
      name: string
      vietnameseName: string
      runningType: $Enums.RunningType
      youtubeEmbedUrl: string | null
      gifUrl: string | null
      instructions: Prisma.JsonValue
      workoutStructure: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["runningExerciseMaster"]>
    composites: {}
  }

  type RunningExerciseMasterGetPayload<S extends boolean | null | undefined | RunningExerciseMasterDefaultArgs> = $Result.GetResult<Prisma.$RunningExerciseMasterPayload, S>

  type RunningExerciseMasterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RunningExerciseMasterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RunningExerciseMasterCountAggregateInputType | true
    }

  export interface RunningExerciseMasterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RunningExerciseMaster'], meta: { name: 'RunningExerciseMaster' } }
    /**
     * Find zero or one RunningExerciseMaster that matches the filter.
     * @param {RunningExerciseMasterFindUniqueArgs} args - Arguments to find a RunningExerciseMaster
     * @example
     * // Get one RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RunningExerciseMasterFindUniqueArgs>(args: SelectSubset<T, RunningExerciseMasterFindUniqueArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RunningExerciseMaster that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RunningExerciseMasterFindUniqueOrThrowArgs} args - Arguments to find a RunningExerciseMaster
     * @example
     * // Get one RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RunningExerciseMasterFindUniqueOrThrowArgs>(args: SelectSubset<T, RunningExerciseMasterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RunningExerciseMaster that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterFindFirstArgs} args - Arguments to find a RunningExerciseMaster
     * @example
     * // Get one RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RunningExerciseMasterFindFirstArgs>(args?: SelectSubset<T, RunningExerciseMasterFindFirstArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RunningExerciseMaster that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterFindFirstOrThrowArgs} args - Arguments to find a RunningExerciseMaster
     * @example
     * // Get one RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RunningExerciseMasterFindFirstOrThrowArgs>(args?: SelectSubset<T, RunningExerciseMasterFindFirstOrThrowArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RunningExerciseMasters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RunningExerciseMasters
     * const runningExerciseMasters = await prisma.runningExerciseMaster.findMany()
     * 
     * // Get first 10 RunningExerciseMasters
     * const runningExerciseMasters = await prisma.runningExerciseMaster.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const runningExerciseMasterWithIdOnly = await prisma.runningExerciseMaster.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RunningExerciseMasterFindManyArgs>(args?: SelectSubset<T, RunningExerciseMasterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RunningExerciseMaster.
     * @param {RunningExerciseMasterCreateArgs} args - Arguments to create a RunningExerciseMaster.
     * @example
     * // Create one RunningExerciseMaster
     * const RunningExerciseMaster = await prisma.runningExerciseMaster.create({
     *   data: {
     *     // ... data to create a RunningExerciseMaster
     *   }
     * })
     * 
     */
    create<T extends RunningExerciseMasterCreateArgs>(args: SelectSubset<T, RunningExerciseMasterCreateArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RunningExerciseMasters.
     * @param {RunningExerciseMasterCreateManyArgs} args - Arguments to create many RunningExerciseMasters.
     * @example
     * // Create many RunningExerciseMasters
     * const runningExerciseMaster = await prisma.runningExerciseMaster.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RunningExerciseMasterCreateManyArgs>(args?: SelectSubset<T, RunningExerciseMasterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RunningExerciseMasters and returns the data saved in the database.
     * @param {RunningExerciseMasterCreateManyAndReturnArgs} args - Arguments to create many RunningExerciseMasters.
     * @example
     * // Create many RunningExerciseMasters
     * const runningExerciseMaster = await prisma.runningExerciseMaster.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RunningExerciseMasters and only return the `id`
     * const runningExerciseMasterWithIdOnly = await prisma.runningExerciseMaster.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RunningExerciseMasterCreateManyAndReturnArgs>(args?: SelectSubset<T, RunningExerciseMasterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RunningExerciseMaster.
     * @param {RunningExerciseMasterDeleteArgs} args - Arguments to delete one RunningExerciseMaster.
     * @example
     * // Delete one RunningExerciseMaster
     * const RunningExerciseMaster = await prisma.runningExerciseMaster.delete({
     *   where: {
     *     // ... filter to delete one RunningExerciseMaster
     *   }
     * })
     * 
     */
    delete<T extends RunningExerciseMasterDeleteArgs>(args: SelectSubset<T, RunningExerciseMasterDeleteArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RunningExerciseMaster.
     * @param {RunningExerciseMasterUpdateArgs} args - Arguments to update one RunningExerciseMaster.
     * @example
     * // Update one RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RunningExerciseMasterUpdateArgs>(args: SelectSubset<T, RunningExerciseMasterUpdateArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RunningExerciseMasters.
     * @param {RunningExerciseMasterDeleteManyArgs} args - Arguments to filter RunningExerciseMasters to delete.
     * @example
     * // Delete a few RunningExerciseMasters
     * const { count } = await prisma.runningExerciseMaster.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RunningExerciseMasterDeleteManyArgs>(args?: SelectSubset<T, RunningExerciseMasterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RunningExerciseMasters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RunningExerciseMasters
     * const runningExerciseMaster = await prisma.runningExerciseMaster.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RunningExerciseMasterUpdateManyArgs>(args: SelectSubset<T, RunningExerciseMasterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RunningExerciseMasters and returns the data updated in the database.
     * @param {RunningExerciseMasterUpdateManyAndReturnArgs} args - Arguments to update many RunningExerciseMasters.
     * @example
     * // Update many RunningExerciseMasters
     * const runningExerciseMaster = await prisma.runningExerciseMaster.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RunningExerciseMasters and only return the `id`
     * const runningExerciseMasterWithIdOnly = await prisma.runningExerciseMaster.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RunningExerciseMasterUpdateManyAndReturnArgs>(args: SelectSubset<T, RunningExerciseMasterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RunningExerciseMaster.
     * @param {RunningExerciseMasterUpsertArgs} args - Arguments to update or create a RunningExerciseMaster.
     * @example
     * // Update or create a RunningExerciseMaster
     * const runningExerciseMaster = await prisma.runningExerciseMaster.upsert({
     *   create: {
     *     // ... data to create a RunningExerciseMaster
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RunningExerciseMaster we want to update
     *   }
     * })
     */
    upsert<T extends RunningExerciseMasterUpsertArgs>(args: SelectSubset<T, RunningExerciseMasterUpsertArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RunningExerciseMasters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterCountArgs} args - Arguments to filter RunningExerciseMasters to count.
     * @example
     * // Count the number of RunningExerciseMasters
     * const count = await prisma.runningExerciseMaster.count({
     *   where: {
     *     // ... the filter for the RunningExerciseMasters we want to count
     *   }
     * })
    **/
    count<T extends RunningExerciseMasterCountArgs>(
      args?: Subset<T, RunningExerciseMasterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RunningExerciseMasterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RunningExerciseMaster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RunningExerciseMasterAggregateArgs>(args: Subset<T, RunningExerciseMasterAggregateArgs>): Prisma.PrismaPromise<GetRunningExerciseMasterAggregateType<T>>

    /**
     * Group by RunningExerciseMaster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RunningExerciseMasterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RunningExerciseMasterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RunningExerciseMasterGroupByArgs['orderBy'] }
        : { orderBy?: RunningExerciseMasterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RunningExerciseMasterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRunningExerciseMasterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RunningExerciseMaster model
   */
  readonly fields: RunningExerciseMasterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RunningExerciseMaster.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RunningExerciseMasterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    scheduleItems<T extends RunningExerciseMaster$scheduleItemsArgs<ExtArgs> = {}>(args?: Subset<T, RunningExerciseMaster$scheduleItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RunningExerciseMaster model
   */
  interface RunningExerciseMasterFieldRefs {
    readonly id: FieldRef<"RunningExerciseMaster", 'String'>
    readonly isActive: FieldRef<"RunningExerciseMaster", 'Boolean'>
    readonly name: FieldRef<"RunningExerciseMaster", 'String'>
    readonly vietnameseName: FieldRef<"RunningExerciseMaster", 'String'>
    readonly runningType: FieldRef<"RunningExerciseMaster", 'RunningType'>
    readonly youtubeEmbedUrl: FieldRef<"RunningExerciseMaster", 'String'>
    readonly gifUrl: FieldRef<"RunningExerciseMaster", 'String'>
    readonly instructions: FieldRef<"RunningExerciseMaster", 'Json'>
    readonly workoutStructure: FieldRef<"RunningExerciseMaster", 'Json'>
    readonly createdAt: FieldRef<"RunningExerciseMaster", 'DateTime'>
    readonly updatedAt: FieldRef<"RunningExerciseMaster", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RunningExerciseMaster findUnique
   */
  export type RunningExerciseMasterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which RunningExerciseMaster to fetch.
     */
    where: RunningExerciseMasterWhereUniqueInput
  }

  /**
   * RunningExerciseMaster findUniqueOrThrow
   */
  export type RunningExerciseMasterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which RunningExerciseMaster to fetch.
     */
    where: RunningExerciseMasterWhereUniqueInput
  }

  /**
   * RunningExerciseMaster findFirst
   */
  export type RunningExerciseMasterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which RunningExerciseMaster to fetch.
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RunningExerciseMasters to fetch.
     */
    orderBy?: RunningExerciseMasterOrderByWithRelationInput | RunningExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RunningExerciseMasters.
     */
    cursor?: RunningExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RunningExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RunningExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RunningExerciseMasters.
     */
    distinct?: RunningExerciseMasterScalarFieldEnum | RunningExerciseMasterScalarFieldEnum[]
  }

  /**
   * RunningExerciseMaster findFirstOrThrow
   */
  export type RunningExerciseMasterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which RunningExerciseMaster to fetch.
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RunningExerciseMasters to fetch.
     */
    orderBy?: RunningExerciseMasterOrderByWithRelationInput | RunningExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RunningExerciseMasters.
     */
    cursor?: RunningExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RunningExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RunningExerciseMasters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RunningExerciseMasters.
     */
    distinct?: RunningExerciseMasterScalarFieldEnum | RunningExerciseMasterScalarFieldEnum[]
  }

  /**
   * RunningExerciseMaster findMany
   */
  export type RunningExerciseMasterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter, which RunningExerciseMasters to fetch.
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RunningExerciseMasters to fetch.
     */
    orderBy?: RunningExerciseMasterOrderByWithRelationInput | RunningExerciseMasterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RunningExerciseMasters.
     */
    cursor?: RunningExerciseMasterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RunningExerciseMasters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RunningExerciseMasters.
     */
    skip?: number
    distinct?: RunningExerciseMasterScalarFieldEnum | RunningExerciseMasterScalarFieldEnum[]
  }

  /**
   * RunningExerciseMaster create
   */
  export type RunningExerciseMasterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * The data needed to create a RunningExerciseMaster.
     */
    data: XOR<RunningExerciseMasterCreateInput, RunningExerciseMasterUncheckedCreateInput>
  }

  /**
   * RunningExerciseMaster createMany
   */
  export type RunningExerciseMasterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RunningExerciseMasters.
     */
    data: RunningExerciseMasterCreateManyInput | RunningExerciseMasterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RunningExerciseMaster createManyAndReturn
   */
  export type RunningExerciseMasterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * The data used to create many RunningExerciseMasters.
     */
    data: RunningExerciseMasterCreateManyInput | RunningExerciseMasterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RunningExerciseMaster update
   */
  export type RunningExerciseMasterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * The data needed to update a RunningExerciseMaster.
     */
    data: XOR<RunningExerciseMasterUpdateInput, RunningExerciseMasterUncheckedUpdateInput>
    /**
     * Choose, which RunningExerciseMaster to update.
     */
    where: RunningExerciseMasterWhereUniqueInput
  }

  /**
   * RunningExerciseMaster updateMany
   */
  export type RunningExerciseMasterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RunningExerciseMasters.
     */
    data: XOR<RunningExerciseMasterUpdateManyMutationInput, RunningExerciseMasterUncheckedUpdateManyInput>
    /**
     * Filter which RunningExerciseMasters to update
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * Limit how many RunningExerciseMasters to update.
     */
    limit?: number
  }

  /**
   * RunningExerciseMaster updateManyAndReturn
   */
  export type RunningExerciseMasterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * The data used to update RunningExerciseMasters.
     */
    data: XOR<RunningExerciseMasterUpdateManyMutationInput, RunningExerciseMasterUncheckedUpdateManyInput>
    /**
     * Filter which RunningExerciseMasters to update
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * Limit how many RunningExerciseMasters to update.
     */
    limit?: number
  }

  /**
   * RunningExerciseMaster upsert
   */
  export type RunningExerciseMasterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * The filter to search for the RunningExerciseMaster to update in case it exists.
     */
    where: RunningExerciseMasterWhereUniqueInput
    /**
     * In case the RunningExerciseMaster found by the `where` argument doesn't exist, create a new RunningExerciseMaster with this data.
     */
    create: XOR<RunningExerciseMasterCreateInput, RunningExerciseMasterUncheckedCreateInput>
    /**
     * In case the RunningExerciseMaster was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RunningExerciseMasterUpdateInput, RunningExerciseMasterUncheckedUpdateInput>
  }

  /**
   * RunningExerciseMaster delete
   */
  export type RunningExerciseMasterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    /**
     * Filter which RunningExerciseMaster to delete.
     */
    where: RunningExerciseMasterWhereUniqueInput
  }

  /**
   * RunningExerciseMaster deleteMany
   */
  export type RunningExerciseMasterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RunningExerciseMasters to delete
     */
    where?: RunningExerciseMasterWhereInput
    /**
     * Limit how many RunningExerciseMasters to delete.
     */
    limit?: number
  }

  /**
   * RunningExerciseMaster.scheduleItems
   */
  export type RunningExerciseMaster$scheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    where?: ScheduleItemWhereInput
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    cursor?: ScheduleItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * RunningExerciseMaster without action
   */
  export type RunningExerciseMasterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
  }


  /**
   * Model PrivateExercise
   */

  export type AggregatePrivateExercise = {
    _count: PrivateExerciseCountAggregateOutputType | null
    _min: PrivateExerciseMinAggregateOutputType | null
    _max: PrivateExerciseMaxAggregateOutputType | null
  }

  export type PrivateExerciseMinAggregateOutputType = {
    id: string | null
    userId: string | null
    isActive: boolean | null
    sportType: string | null
    name: string | null
    targetMuscleGroup: $Enums.MuscleGroup | null
    runningType: $Enums.RunningType | null
    customNotes: string | null
    gifUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PrivateExerciseMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    isActive: boolean | null
    sportType: string | null
    name: string | null
    targetMuscleGroup: $Enums.MuscleGroup | null
    runningType: $Enums.RunningType | null
    customNotes: string | null
    gifUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PrivateExerciseCountAggregateOutputType = {
    id: number
    userId: number
    isActive: number
    sportType: number
    name: number
    targetMuscleGroup: number
    runningType: number
    customNotes: number
    gifUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PrivateExerciseMinAggregateInputType = {
    id?: true
    userId?: true
    isActive?: true
    sportType?: true
    name?: true
    targetMuscleGroup?: true
    runningType?: true
    customNotes?: true
    gifUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PrivateExerciseMaxAggregateInputType = {
    id?: true
    userId?: true
    isActive?: true
    sportType?: true
    name?: true
    targetMuscleGroup?: true
    runningType?: true
    customNotes?: true
    gifUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PrivateExerciseCountAggregateInputType = {
    id?: true
    userId?: true
    isActive?: true
    sportType?: true
    name?: true
    targetMuscleGroup?: true
    runningType?: true
    customNotes?: true
    gifUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PrivateExerciseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PrivateExercise to aggregate.
     */
    where?: PrivateExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrivateExercises to fetch.
     */
    orderBy?: PrivateExerciseOrderByWithRelationInput | PrivateExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PrivateExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrivateExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrivateExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PrivateExercises
    **/
    _count?: true | PrivateExerciseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PrivateExerciseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PrivateExerciseMaxAggregateInputType
  }

  export type GetPrivateExerciseAggregateType<T extends PrivateExerciseAggregateArgs> = {
        [P in keyof T & keyof AggregatePrivateExercise]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePrivateExercise[P]>
      : GetScalarType<T[P], AggregatePrivateExercise[P]>
  }




  export type PrivateExerciseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrivateExerciseWhereInput
    orderBy?: PrivateExerciseOrderByWithAggregationInput | PrivateExerciseOrderByWithAggregationInput[]
    by: PrivateExerciseScalarFieldEnum[] | PrivateExerciseScalarFieldEnum
    having?: PrivateExerciseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PrivateExerciseCountAggregateInputType | true
    _min?: PrivateExerciseMinAggregateInputType
    _max?: PrivateExerciseMaxAggregateInputType
  }

  export type PrivateExerciseGroupByOutputType = {
    id: string
    userId: string
    isActive: boolean
    sportType: string
    name: string
    targetMuscleGroup: $Enums.MuscleGroup | null
    runningType: $Enums.RunningType | null
    customNotes: string | null
    gifUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: PrivateExerciseCountAggregateOutputType | null
    _min: PrivateExerciseMinAggregateOutputType | null
    _max: PrivateExerciseMaxAggregateOutputType | null
  }

  type GetPrivateExerciseGroupByPayload<T extends PrivateExerciseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PrivateExerciseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PrivateExerciseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PrivateExerciseGroupByOutputType[P]>
            : GetScalarType<T[P], PrivateExerciseGroupByOutputType[P]>
        }
      >
    >


  export type PrivateExerciseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    isActive?: boolean
    sportType?: boolean
    name?: boolean
    targetMuscleGroup?: boolean
    runningType?: boolean
    customNotes?: boolean
    gifUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    scheduleItems?: boolean | PrivateExercise$scheduleItemsArgs<ExtArgs>
    _count?: boolean | PrivateExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["privateExercise"]>

  export type PrivateExerciseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    isActive?: boolean
    sportType?: boolean
    name?: boolean
    targetMuscleGroup?: boolean
    runningType?: boolean
    customNotes?: boolean
    gifUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["privateExercise"]>

  export type PrivateExerciseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    isActive?: boolean
    sportType?: boolean
    name?: boolean
    targetMuscleGroup?: boolean
    runningType?: boolean
    customNotes?: boolean
    gifUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["privateExercise"]>

  export type PrivateExerciseSelectScalar = {
    id?: boolean
    userId?: boolean
    isActive?: boolean
    sportType?: boolean
    name?: boolean
    targetMuscleGroup?: boolean
    runningType?: boolean
    customNotes?: boolean
    gifUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PrivateExerciseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "isActive" | "sportType" | "name" | "targetMuscleGroup" | "runningType" | "customNotes" | "gifUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["privateExercise"]>
  export type PrivateExerciseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    scheduleItems?: boolean | PrivateExercise$scheduleItemsArgs<ExtArgs>
    _count?: boolean | PrivateExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PrivateExerciseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PrivateExerciseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PrivateExercisePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PrivateExercise"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      scheduleItems: Prisma.$ScheduleItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      isActive: boolean
      sportType: string
      name: string
      targetMuscleGroup: $Enums.MuscleGroup | null
      runningType: $Enums.RunningType | null
      customNotes: string | null
      gifUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["privateExercise"]>
    composites: {}
  }

  type PrivateExerciseGetPayload<S extends boolean | null | undefined | PrivateExerciseDefaultArgs> = $Result.GetResult<Prisma.$PrivateExercisePayload, S>

  type PrivateExerciseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PrivateExerciseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PrivateExerciseCountAggregateInputType | true
    }

  export interface PrivateExerciseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PrivateExercise'], meta: { name: 'PrivateExercise' } }
    /**
     * Find zero or one PrivateExercise that matches the filter.
     * @param {PrivateExerciseFindUniqueArgs} args - Arguments to find a PrivateExercise
     * @example
     * // Get one PrivateExercise
     * const privateExercise = await prisma.privateExercise.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PrivateExerciseFindUniqueArgs>(args: SelectSubset<T, PrivateExerciseFindUniqueArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PrivateExercise that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PrivateExerciseFindUniqueOrThrowArgs} args - Arguments to find a PrivateExercise
     * @example
     * // Get one PrivateExercise
     * const privateExercise = await prisma.privateExercise.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PrivateExerciseFindUniqueOrThrowArgs>(args: SelectSubset<T, PrivateExerciseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PrivateExercise that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseFindFirstArgs} args - Arguments to find a PrivateExercise
     * @example
     * // Get one PrivateExercise
     * const privateExercise = await prisma.privateExercise.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PrivateExerciseFindFirstArgs>(args?: SelectSubset<T, PrivateExerciseFindFirstArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PrivateExercise that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseFindFirstOrThrowArgs} args - Arguments to find a PrivateExercise
     * @example
     * // Get one PrivateExercise
     * const privateExercise = await prisma.privateExercise.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PrivateExerciseFindFirstOrThrowArgs>(args?: SelectSubset<T, PrivateExerciseFindFirstOrThrowArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PrivateExercises that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PrivateExercises
     * const privateExercises = await prisma.privateExercise.findMany()
     * 
     * // Get first 10 PrivateExercises
     * const privateExercises = await prisma.privateExercise.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const privateExerciseWithIdOnly = await prisma.privateExercise.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PrivateExerciseFindManyArgs>(args?: SelectSubset<T, PrivateExerciseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PrivateExercise.
     * @param {PrivateExerciseCreateArgs} args - Arguments to create a PrivateExercise.
     * @example
     * // Create one PrivateExercise
     * const PrivateExercise = await prisma.privateExercise.create({
     *   data: {
     *     // ... data to create a PrivateExercise
     *   }
     * })
     * 
     */
    create<T extends PrivateExerciseCreateArgs>(args: SelectSubset<T, PrivateExerciseCreateArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PrivateExercises.
     * @param {PrivateExerciseCreateManyArgs} args - Arguments to create many PrivateExercises.
     * @example
     * // Create many PrivateExercises
     * const privateExercise = await prisma.privateExercise.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PrivateExerciseCreateManyArgs>(args?: SelectSubset<T, PrivateExerciseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PrivateExercises and returns the data saved in the database.
     * @param {PrivateExerciseCreateManyAndReturnArgs} args - Arguments to create many PrivateExercises.
     * @example
     * // Create many PrivateExercises
     * const privateExercise = await prisma.privateExercise.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PrivateExercises and only return the `id`
     * const privateExerciseWithIdOnly = await prisma.privateExercise.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PrivateExerciseCreateManyAndReturnArgs>(args?: SelectSubset<T, PrivateExerciseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PrivateExercise.
     * @param {PrivateExerciseDeleteArgs} args - Arguments to delete one PrivateExercise.
     * @example
     * // Delete one PrivateExercise
     * const PrivateExercise = await prisma.privateExercise.delete({
     *   where: {
     *     // ... filter to delete one PrivateExercise
     *   }
     * })
     * 
     */
    delete<T extends PrivateExerciseDeleteArgs>(args: SelectSubset<T, PrivateExerciseDeleteArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PrivateExercise.
     * @param {PrivateExerciseUpdateArgs} args - Arguments to update one PrivateExercise.
     * @example
     * // Update one PrivateExercise
     * const privateExercise = await prisma.privateExercise.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PrivateExerciseUpdateArgs>(args: SelectSubset<T, PrivateExerciseUpdateArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PrivateExercises.
     * @param {PrivateExerciseDeleteManyArgs} args - Arguments to filter PrivateExercises to delete.
     * @example
     * // Delete a few PrivateExercises
     * const { count } = await prisma.privateExercise.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PrivateExerciseDeleteManyArgs>(args?: SelectSubset<T, PrivateExerciseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PrivateExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PrivateExercises
     * const privateExercise = await prisma.privateExercise.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PrivateExerciseUpdateManyArgs>(args: SelectSubset<T, PrivateExerciseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PrivateExercises and returns the data updated in the database.
     * @param {PrivateExerciseUpdateManyAndReturnArgs} args - Arguments to update many PrivateExercises.
     * @example
     * // Update many PrivateExercises
     * const privateExercise = await prisma.privateExercise.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PrivateExercises and only return the `id`
     * const privateExerciseWithIdOnly = await prisma.privateExercise.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PrivateExerciseUpdateManyAndReturnArgs>(args: SelectSubset<T, PrivateExerciseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PrivateExercise.
     * @param {PrivateExerciseUpsertArgs} args - Arguments to update or create a PrivateExercise.
     * @example
     * // Update or create a PrivateExercise
     * const privateExercise = await prisma.privateExercise.upsert({
     *   create: {
     *     // ... data to create a PrivateExercise
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PrivateExercise we want to update
     *   }
     * })
     */
    upsert<T extends PrivateExerciseUpsertArgs>(args: SelectSubset<T, PrivateExerciseUpsertArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PrivateExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseCountArgs} args - Arguments to filter PrivateExercises to count.
     * @example
     * // Count the number of PrivateExercises
     * const count = await prisma.privateExercise.count({
     *   where: {
     *     // ... the filter for the PrivateExercises we want to count
     *   }
     * })
    **/
    count<T extends PrivateExerciseCountArgs>(
      args?: Subset<T, PrivateExerciseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PrivateExerciseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PrivateExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PrivateExerciseAggregateArgs>(args: Subset<T, PrivateExerciseAggregateArgs>): Prisma.PrismaPromise<GetPrivateExerciseAggregateType<T>>

    /**
     * Group by PrivateExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrivateExerciseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PrivateExerciseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PrivateExerciseGroupByArgs['orderBy'] }
        : { orderBy?: PrivateExerciseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PrivateExerciseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPrivateExerciseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PrivateExercise model
   */
  readonly fields: PrivateExerciseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PrivateExercise.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PrivateExerciseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scheduleItems<T extends PrivateExercise$scheduleItemsArgs<ExtArgs> = {}>(args?: Subset<T, PrivateExercise$scheduleItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PrivateExercise model
   */
  interface PrivateExerciseFieldRefs {
    readonly id: FieldRef<"PrivateExercise", 'String'>
    readonly userId: FieldRef<"PrivateExercise", 'String'>
    readonly isActive: FieldRef<"PrivateExercise", 'Boolean'>
    readonly sportType: FieldRef<"PrivateExercise", 'String'>
    readonly name: FieldRef<"PrivateExercise", 'String'>
    readonly targetMuscleGroup: FieldRef<"PrivateExercise", 'MuscleGroup'>
    readonly runningType: FieldRef<"PrivateExercise", 'RunningType'>
    readonly customNotes: FieldRef<"PrivateExercise", 'String'>
    readonly gifUrl: FieldRef<"PrivateExercise", 'String'>
    readonly createdAt: FieldRef<"PrivateExercise", 'DateTime'>
    readonly updatedAt: FieldRef<"PrivateExercise", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PrivateExercise findUnique
   */
  export type PrivateExerciseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter, which PrivateExercise to fetch.
     */
    where: PrivateExerciseWhereUniqueInput
  }

  /**
   * PrivateExercise findUniqueOrThrow
   */
  export type PrivateExerciseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter, which PrivateExercise to fetch.
     */
    where: PrivateExerciseWhereUniqueInput
  }

  /**
   * PrivateExercise findFirst
   */
  export type PrivateExerciseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter, which PrivateExercise to fetch.
     */
    where?: PrivateExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrivateExercises to fetch.
     */
    orderBy?: PrivateExerciseOrderByWithRelationInput | PrivateExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PrivateExercises.
     */
    cursor?: PrivateExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrivateExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrivateExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PrivateExercises.
     */
    distinct?: PrivateExerciseScalarFieldEnum | PrivateExerciseScalarFieldEnum[]
  }

  /**
   * PrivateExercise findFirstOrThrow
   */
  export type PrivateExerciseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter, which PrivateExercise to fetch.
     */
    where?: PrivateExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrivateExercises to fetch.
     */
    orderBy?: PrivateExerciseOrderByWithRelationInput | PrivateExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PrivateExercises.
     */
    cursor?: PrivateExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrivateExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrivateExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PrivateExercises.
     */
    distinct?: PrivateExerciseScalarFieldEnum | PrivateExerciseScalarFieldEnum[]
  }

  /**
   * PrivateExercise findMany
   */
  export type PrivateExerciseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter, which PrivateExercises to fetch.
     */
    where?: PrivateExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrivateExercises to fetch.
     */
    orderBy?: PrivateExerciseOrderByWithRelationInput | PrivateExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PrivateExercises.
     */
    cursor?: PrivateExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrivateExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrivateExercises.
     */
    skip?: number
    distinct?: PrivateExerciseScalarFieldEnum | PrivateExerciseScalarFieldEnum[]
  }

  /**
   * PrivateExercise create
   */
  export type PrivateExerciseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * The data needed to create a PrivateExercise.
     */
    data: XOR<PrivateExerciseCreateInput, PrivateExerciseUncheckedCreateInput>
  }

  /**
   * PrivateExercise createMany
   */
  export type PrivateExerciseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PrivateExercises.
     */
    data: PrivateExerciseCreateManyInput | PrivateExerciseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PrivateExercise createManyAndReturn
   */
  export type PrivateExerciseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * The data used to create many PrivateExercises.
     */
    data: PrivateExerciseCreateManyInput | PrivateExerciseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PrivateExercise update
   */
  export type PrivateExerciseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * The data needed to update a PrivateExercise.
     */
    data: XOR<PrivateExerciseUpdateInput, PrivateExerciseUncheckedUpdateInput>
    /**
     * Choose, which PrivateExercise to update.
     */
    where: PrivateExerciseWhereUniqueInput
  }

  /**
   * PrivateExercise updateMany
   */
  export type PrivateExerciseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PrivateExercises.
     */
    data: XOR<PrivateExerciseUpdateManyMutationInput, PrivateExerciseUncheckedUpdateManyInput>
    /**
     * Filter which PrivateExercises to update
     */
    where?: PrivateExerciseWhereInput
    /**
     * Limit how many PrivateExercises to update.
     */
    limit?: number
  }

  /**
   * PrivateExercise updateManyAndReturn
   */
  export type PrivateExerciseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * The data used to update PrivateExercises.
     */
    data: XOR<PrivateExerciseUpdateManyMutationInput, PrivateExerciseUncheckedUpdateManyInput>
    /**
     * Filter which PrivateExercises to update
     */
    where?: PrivateExerciseWhereInput
    /**
     * Limit how many PrivateExercises to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PrivateExercise upsert
   */
  export type PrivateExerciseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * The filter to search for the PrivateExercise to update in case it exists.
     */
    where: PrivateExerciseWhereUniqueInput
    /**
     * In case the PrivateExercise found by the `where` argument doesn't exist, create a new PrivateExercise with this data.
     */
    create: XOR<PrivateExerciseCreateInput, PrivateExerciseUncheckedCreateInput>
    /**
     * In case the PrivateExercise was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PrivateExerciseUpdateInput, PrivateExerciseUncheckedUpdateInput>
  }

  /**
   * PrivateExercise delete
   */
  export type PrivateExerciseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    /**
     * Filter which PrivateExercise to delete.
     */
    where: PrivateExerciseWhereUniqueInput
  }

  /**
   * PrivateExercise deleteMany
   */
  export type PrivateExerciseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PrivateExercises to delete
     */
    where?: PrivateExerciseWhereInput
    /**
     * Limit how many PrivateExercises to delete.
     */
    limit?: number
  }

  /**
   * PrivateExercise.scheduleItems
   */
  export type PrivateExercise$scheduleItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    where?: ScheduleItemWhereInput
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    cursor?: ScheduleItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * PrivateExercise without action
   */
  export type PrivateExerciseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
  }


  /**
   * Model DailySchedule
   */

  export type AggregateDailySchedule = {
    _count: DailyScheduleCountAggregateOutputType | null
    _avg: DailyScheduleAvgAggregateOutputType | null
    _sum: DailyScheduleSumAggregateOutputType | null
    _min: DailyScheduleMinAggregateOutputType | null
    _max: DailyScheduleMaxAggregateOutputType | null
  }

  export type DailyScheduleAvgAggregateOutputType = {
    weekNumber: number | null
    year: number | null
  }

  export type DailyScheduleSumAggregateOutputType = {
    weekNumber: number | null
    year: number | null
  }

  export type DailyScheduleMinAggregateOutputType = {
    id: string | null
    userId: string | null
    dateString: string | null
    weekNumber: number | null
    year: number | null
    dayStatus: $Enums.DayStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailyScheduleMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    dateString: string | null
    weekNumber: number | null
    year: number | null
    dayStatus: $Enums.DayStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailyScheduleCountAggregateOutputType = {
    id: number
    userId: number
    dateString: number
    weekNumber: number
    year: number
    dayStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DailyScheduleAvgAggregateInputType = {
    weekNumber?: true
    year?: true
  }

  export type DailyScheduleSumAggregateInputType = {
    weekNumber?: true
    year?: true
  }

  export type DailyScheduleMinAggregateInputType = {
    id?: true
    userId?: true
    dateString?: true
    weekNumber?: true
    year?: true
    dayStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailyScheduleMaxAggregateInputType = {
    id?: true
    userId?: true
    dateString?: true
    weekNumber?: true
    year?: true
    dayStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailyScheduleCountAggregateInputType = {
    id?: true
    userId?: true
    dateString?: true
    weekNumber?: true
    year?: true
    dayStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DailyScheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySchedule to aggregate.
     */
    where?: DailyScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySchedules to fetch.
     */
    orderBy?: DailyScheduleOrderByWithRelationInput | DailyScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailySchedules
    **/
    _count?: true | DailyScheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailyScheduleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailyScheduleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyScheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyScheduleMaxAggregateInputType
  }

  export type GetDailyScheduleAggregateType<T extends DailyScheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateDailySchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailySchedule[P]>
      : GetScalarType<T[P], AggregateDailySchedule[P]>
  }




  export type DailyScheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyScheduleWhereInput
    orderBy?: DailyScheduleOrderByWithAggregationInput | DailyScheduleOrderByWithAggregationInput[]
    by: DailyScheduleScalarFieldEnum[] | DailyScheduleScalarFieldEnum
    having?: DailyScheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyScheduleCountAggregateInputType | true
    _avg?: DailyScheduleAvgAggregateInputType
    _sum?: DailyScheduleSumAggregateInputType
    _min?: DailyScheduleMinAggregateInputType
    _max?: DailyScheduleMaxAggregateInputType
  }

  export type DailyScheduleGroupByOutputType = {
    id: string
    userId: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus: $Enums.DayStatus
    createdAt: Date
    updatedAt: Date
    _count: DailyScheduleCountAggregateOutputType | null
    _avg: DailyScheduleAvgAggregateOutputType | null
    _sum: DailyScheduleSumAggregateOutputType | null
    _min: DailyScheduleMinAggregateOutputType | null
    _max: DailyScheduleMaxAggregateOutputType | null
  }

  type GetDailyScheduleGroupByPayload<T extends DailyScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyScheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyScheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyScheduleGroupByOutputType[P]>
            : GetScalarType<T[P], DailyScheduleGroupByOutputType[P]>
        }
      >
    >


  export type DailyScheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    dateString?: boolean
    weekNumber?: boolean
    year?: boolean
    dayStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | DailySchedule$itemsArgs<ExtArgs>
    _count?: boolean | DailyScheduleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailySchedule"]>

  export type DailyScheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    dateString?: boolean
    weekNumber?: boolean
    year?: boolean
    dayStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailySchedule"]>

  export type DailyScheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    dateString?: boolean
    weekNumber?: boolean
    year?: boolean
    dayStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailySchedule"]>

  export type DailyScheduleSelectScalar = {
    id?: boolean
    userId?: boolean
    dateString?: boolean
    weekNumber?: boolean
    year?: boolean
    dayStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DailyScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "dateString" | "weekNumber" | "year" | "dayStatus" | "createdAt" | "updatedAt", ExtArgs["result"]["dailySchedule"]>
  export type DailyScheduleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | DailySchedule$itemsArgs<ExtArgs>
    _count?: boolean | DailyScheduleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DailyScheduleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DailyScheduleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DailySchedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailySchedule"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      items: Prisma.$ScheduleItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      dateString: string
      weekNumber: number
      year: number
      dayStatus: $Enums.DayStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dailySchedule"]>
    composites: {}
  }

  type DailyScheduleGetPayload<S extends boolean | null | undefined | DailyScheduleDefaultArgs> = $Result.GetResult<Prisma.$DailySchedulePayload, S>

  type DailyScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyScheduleCountAggregateInputType | true
    }

  export interface DailyScheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailySchedule'], meta: { name: 'DailySchedule' } }
    /**
     * Find zero or one DailySchedule that matches the filter.
     * @param {DailyScheduleFindUniqueArgs} args - Arguments to find a DailySchedule
     * @example
     * // Get one DailySchedule
     * const dailySchedule = await prisma.dailySchedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyScheduleFindUniqueArgs>(args: SelectSubset<T, DailyScheduleFindUniqueArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailySchedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyScheduleFindUniqueOrThrowArgs} args - Arguments to find a DailySchedule
     * @example
     * // Get one DailySchedule
     * const dailySchedule = await prisma.dailySchedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyScheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyScheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailySchedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleFindFirstArgs} args - Arguments to find a DailySchedule
     * @example
     * // Get one DailySchedule
     * const dailySchedule = await prisma.dailySchedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyScheduleFindFirstArgs>(args?: SelectSubset<T, DailyScheduleFindFirstArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailySchedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleFindFirstOrThrowArgs} args - Arguments to find a DailySchedule
     * @example
     * // Get one DailySchedule
     * const dailySchedule = await prisma.dailySchedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyScheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyScheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailySchedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailySchedules
     * const dailySchedules = await prisma.dailySchedule.findMany()
     * 
     * // Get first 10 DailySchedules
     * const dailySchedules = await prisma.dailySchedule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyScheduleWithIdOnly = await prisma.dailySchedule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyScheduleFindManyArgs>(args?: SelectSubset<T, DailyScheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailySchedule.
     * @param {DailyScheduleCreateArgs} args - Arguments to create a DailySchedule.
     * @example
     * // Create one DailySchedule
     * const DailySchedule = await prisma.dailySchedule.create({
     *   data: {
     *     // ... data to create a DailySchedule
     *   }
     * })
     * 
     */
    create<T extends DailyScheduleCreateArgs>(args: SelectSubset<T, DailyScheduleCreateArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailySchedules.
     * @param {DailyScheduleCreateManyArgs} args - Arguments to create many DailySchedules.
     * @example
     * // Create many DailySchedules
     * const dailySchedule = await prisma.dailySchedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyScheduleCreateManyArgs>(args?: SelectSubset<T, DailyScheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailySchedules and returns the data saved in the database.
     * @param {DailyScheduleCreateManyAndReturnArgs} args - Arguments to create many DailySchedules.
     * @example
     * // Create many DailySchedules
     * const dailySchedule = await prisma.dailySchedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailySchedules and only return the `id`
     * const dailyScheduleWithIdOnly = await prisma.dailySchedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailyScheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, DailyScheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DailySchedule.
     * @param {DailyScheduleDeleteArgs} args - Arguments to delete one DailySchedule.
     * @example
     * // Delete one DailySchedule
     * const DailySchedule = await prisma.dailySchedule.delete({
     *   where: {
     *     // ... filter to delete one DailySchedule
     *   }
     * })
     * 
     */
    delete<T extends DailyScheduleDeleteArgs>(args: SelectSubset<T, DailyScheduleDeleteArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailySchedule.
     * @param {DailyScheduleUpdateArgs} args - Arguments to update one DailySchedule.
     * @example
     * // Update one DailySchedule
     * const dailySchedule = await prisma.dailySchedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyScheduleUpdateArgs>(args: SelectSubset<T, DailyScheduleUpdateArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailySchedules.
     * @param {DailyScheduleDeleteManyArgs} args - Arguments to filter DailySchedules to delete.
     * @example
     * // Delete a few DailySchedules
     * const { count } = await prisma.dailySchedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyScheduleDeleteManyArgs>(args?: SelectSubset<T, DailyScheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailySchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailySchedules
     * const dailySchedule = await prisma.dailySchedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyScheduleUpdateManyArgs>(args: SelectSubset<T, DailyScheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailySchedules and returns the data updated in the database.
     * @param {DailyScheduleUpdateManyAndReturnArgs} args - Arguments to update many DailySchedules.
     * @example
     * // Update many DailySchedules
     * const dailySchedule = await prisma.dailySchedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DailySchedules and only return the `id`
     * const dailyScheduleWithIdOnly = await prisma.dailySchedule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DailyScheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, DailyScheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DailySchedule.
     * @param {DailyScheduleUpsertArgs} args - Arguments to update or create a DailySchedule.
     * @example
     * // Update or create a DailySchedule
     * const dailySchedule = await prisma.dailySchedule.upsert({
     *   create: {
     *     // ... data to create a DailySchedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailySchedule we want to update
     *   }
     * })
     */
    upsert<T extends DailyScheduleUpsertArgs>(args: SelectSubset<T, DailyScheduleUpsertArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailySchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleCountArgs} args - Arguments to filter DailySchedules to count.
     * @example
     * // Count the number of DailySchedules
     * const count = await prisma.dailySchedule.count({
     *   where: {
     *     // ... the filter for the DailySchedules we want to count
     *   }
     * })
    **/
    count<T extends DailyScheduleCountArgs>(
      args?: Subset<T, DailyScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyScheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailySchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyScheduleAggregateArgs>(args: Subset<T, DailyScheduleAggregateArgs>): Prisma.PrismaPromise<GetDailyScheduleAggregateType<T>>

    /**
     * Group by DailySchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyScheduleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyScheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyScheduleGroupByArgs['orderBy'] }
        : { orderBy?: DailyScheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyScheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyScheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailySchedule model
   */
  readonly fields: DailyScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailySchedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyScheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    items<T extends DailySchedule$itemsArgs<ExtArgs> = {}>(args?: Subset<T, DailySchedule$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailySchedule model
   */
  interface DailyScheduleFieldRefs {
    readonly id: FieldRef<"DailySchedule", 'String'>
    readonly userId: FieldRef<"DailySchedule", 'String'>
    readonly dateString: FieldRef<"DailySchedule", 'String'>
    readonly weekNumber: FieldRef<"DailySchedule", 'Int'>
    readonly year: FieldRef<"DailySchedule", 'Int'>
    readonly dayStatus: FieldRef<"DailySchedule", 'DayStatus'>
    readonly createdAt: FieldRef<"DailySchedule", 'DateTime'>
    readonly updatedAt: FieldRef<"DailySchedule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailySchedule findUnique
   */
  export type DailyScheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter, which DailySchedule to fetch.
     */
    where: DailyScheduleWhereUniqueInput
  }

  /**
   * DailySchedule findUniqueOrThrow
   */
  export type DailyScheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter, which DailySchedule to fetch.
     */
    where: DailyScheduleWhereUniqueInput
  }

  /**
   * DailySchedule findFirst
   */
  export type DailyScheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter, which DailySchedule to fetch.
     */
    where?: DailyScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySchedules to fetch.
     */
    orderBy?: DailyScheduleOrderByWithRelationInput | DailyScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySchedules.
     */
    cursor?: DailyScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySchedules.
     */
    distinct?: DailyScheduleScalarFieldEnum | DailyScheduleScalarFieldEnum[]
  }

  /**
   * DailySchedule findFirstOrThrow
   */
  export type DailyScheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter, which DailySchedule to fetch.
     */
    where?: DailyScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySchedules to fetch.
     */
    orderBy?: DailyScheduleOrderByWithRelationInput | DailyScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySchedules.
     */
    cursor?: DailyScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySchedules.
     */
    distinct?: DailyScheduleScalarFieldEnum | DailyScheduleScalarFieldEnum[]
  }

  /**
   * DailySchedule findMany
   */
  export type DailyScheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter, which DailySchedules to fetch.
     */
    where?: DailyScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySchedules to fetch.
     */
    orderBy?: DailyScheduleOrderByWithRelationInput | DailyScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailySchedules.
     */
    cursor?: DailyScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySchedules.
     */
    skip?: number
    distinct?: DailyScheduleScalarFieldEnum | DailyScheduleScalarFieldEnum[]
  }

  /**
   * DailySchedule create
   */
  export type DailyScheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * The data needed to create a DailySchedule.
     */
    data: XOR<DailyScheduleCreateInput, DailyScheduleUncheckedCreateInput>
  }

  /**
   * DailySchedule createMany
   */
  export type DailyScheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailySchedules.
     */
    data: DailyScheduleCreateManyInput | DailyScheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailySchedule createManyAndReturn
   */
  export type DailyScheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * The data used to create many DailySchedules.
     */
    data: DailyScheduleCreateManyInput | DailyScheduleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DailySchedule update
   */
  export type DailyScheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * The data needed to update a DailySchedule.
     */
    data: XOR<DailyScheduleUpdateInput, DailyScheduleUncheckedUpdateInput>
    /**
     * Choose, which DailySchedule to update.
     */
    where: DailyScheduleWhereUniqueInput
  }

  /**
   * DailySchedule updateMany
   */
  export type DailyScheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailySchedules.
     */
    data: XOR<DailyScheduleUpdateManyMutationInput, DailyScheduleUncheckedUpdateManyInput>
    /**
     * Filter which DailySchedules to update
     */
    where?: DailyScheduleWhereInput
    /**
     * Limit how many DailySchedules to update.
     */
    limit?: number
  }

  /**
   * DailySchedule updateManyAndReturn
   */
  export type DailyScheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * The data used to update DailySchedules.
     */
    data: XOR<DailyScheduleUpdateManyMutationInput, DailyScheduleUncheckedUpdateManyInput>
    /**
     * Filter which DailySchedules to update
     */
    where?: DailyScheduleWhereInput
    /**
     * Limit how many DailySchedules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DailySchedule upsert
   */
  export type DailyScheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * The filter to search for the DailySchedule to update in case it exists.
     */
    where: DailyScheduleWhereUniqueInput
    /**
     * In case the DailySchedule found by the `where` argument doesn't exist, create a new DailySchedule with this data.
     */
    create: XOR<DailyScheduleCreateInput, DailyScheduleUncheckedCreateInput>
    /**
     * In case the DailySchedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyScheduleUpdateInput, DailyScheduleUncheckedUpdateInput>
  }

  /**
   * DailySchedule delete
   */
  export type DailyScheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
    /**
     * Filter which DailySchedule to delete.
     */
    where: DailyScheduleWhereUniqueInput
  }

  /**
   * DailySchedule deleteMany
   */
  export type DailyScheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySchedules to delete
     */
    where?: DailyScheduleWhereInput
    /**
     * Limit how many DailySchedules to delete.
     */
    limit?: number
  }

  /**
   * DailySchedule.items
   */
  export type DailySchedule$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    where?: ScheduleItemWhereInput
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    cursor?: ScheduleItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * DailySchedule without action
   */
  export type DailyScheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySchedule
     */
    select?: DailyScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailySchedule
     */
    omit?: DailyScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyScheduleInclude<ExtArgs> | null
  }


  /**
   * Model ScheduleItem
   */

  export type AggregateScheduleItem = {
    _count: ScheduleItemCountAggregateOutputType | null
    _avg: ScheduleItemAvgAggregateOutputType | null
    _sum: ScheduleItemSumAggregateOutputType | null
    _min: ScheduleItemMinAggregateOutputType | null
    _max: ScheduleItemMaxAggregateOutputType | null
  }

  export type ScheduleItemAvgAggregateOutputType = {
    sequenceOrder: number | null
  }

  export type ScheduleItemSumAggregateOutputType = {
    sequenceOrder: number | null
  }

  export type ScheduleItemMinAggregateOutputType = {
    id: string | null
    scheduleId: string | null
    sequenceOrder: number | null
    sportType: string | null
    isPrivateExercise: boolean | null
    gymMasterId: string | null
    runningMasterId: string | null
    privateExerciseId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ScheduleItemMaxAggregateOutputType = {
    id: string | null
    scheduleId: string | null
    sequenceOrder: number | null
    sportType: string | null
    isPrivateExercise: boolean | null
    gymMasterId: string | null
    runningMasterId: string | null
    privateExerciseId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ScheduleItemCountAggregateOutputType = {
    id: number
    scheduleId: number
    sequenceOrder: number
    sportType: number
    isPrivateExercise: number
    gymMasterId: number
    runningMasterId: number
    privateExerciseId: number
    gymPayload: number
    runningPayload: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ScheduleItemAvgAggregateInputType = {
    sequenceOrder?: true
  }

  export type ScheduleItemSumAggregateInputType = {
    sequenceOrder?: true
  }

  export type ScheduleItemMinAggregateInputType = {
    id?: true
    scheduleId?: true
    sequenceOrder?: true
    sportType?: true
    isPrivateExercise?: true
    gymMasterId?: true
    runningMasterId?: true
    privateExerciseId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ScheduleItemMaxAggregateInputType = {
    id?: true
    scheduleId?: true
    sequenceOrder?: true
    sportType?: true
    isPrivateExercise?: true
    gymMasterId?: true
    runningMasterId?: true
    privateExerciseId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ScheduleItemCountAggregateInputType = {
    id?: true
    scheduleId?: true
    sequenceOrder?: true
    sportType?: true
    isPrivateExercise?: true
    gymMasterId?: true
    runningMasterId?: true
    privateExerciseId?: true
    gymPayload?: true
    runningPayload?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ScheduleItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduleItem to aggregate.
     */
    where?: ScheduleItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScheduleItems to fetch.
     */
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScheduleItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScheduleItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScheduleItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScheduleItems
    **/
    _count?: true | ScheduleItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScheduleItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScheduleItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScheduleItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScheduleItemMaxAggregateInputType
  }

  export type GetScheduleItemAggregateType<T extends ScheduleItemAggregateArgs> = {
        [P in keyof T & keyof AggregateScheduleItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScheduleItem[P]>
      : GetScalarType<T[P], AggregateScheduleItem[P]>
  }




  export type ScheduleItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleItemWhereInput
    orderBy?: ScheduleItemOrderByWithAggregationInput | ScheduleItemOrderByWithAggregationInput[]
    by: ScheduleItemScalarFieldEnum[] | ScheduleItemScalarFieldEnum
    having?: ScheduleItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScheduleItemCountAggregateInputType | true
    _avg?: ScheduleItemAvgAggregateInputType
    _sum?: ScheduleItemSumAggregateInputType
    _min?: ScheduleItemMinAggregateInputType
    _max?: ScheduleItemMaxAggregateInputType
  }

  export type ScheduleItemGroupByOutputType = {
    id: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise: boolean
    gymMasterId: string | null
    runningMasterId: string | null
    privateExerciseId: string | null
    gymPayload: JsonValue | null
    runningPayload: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: ScheduleItemCountAggregateOutputType | null
    _avg: ScheduleItemAvgAggregateOutputType | null
    _sum: ScheduleItemSumAggregateOutputType | null
    _min: ScheduleItemMinAggregateOutputType | null
    _max: ScheduleItemMaxAggregateOutputType | null
  }

  type GetScheduleItemGroupByPayload<T extends ScheduleItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScheduleItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScheduleItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScheduleItemGroupByOutputType[P]>
            : GetScalarType<T[P], ScheduleItemGroupByOutputType[P]>
        }
      >
    >


  export type ScheduleItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scheduleId?: boolean
    sequenceOrder?: boolean
    sportType?: boolean
    isPrivateExercise?: boolean
    gymMasterId?: boolean
    runningMasterId?: boolean
    privateExerciseId?: boolean
    gymPayload?: boolean
    runningPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }, ExtArgs["result"]["scheduleItem"]>

  export type ScheduleItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scheduleId?: boolean
    sequenceOrder?: boolean
    sportType?: boolean
    isPrivateExercise?: boolean
    gymMasterId?: boolean
    runningMasterId?: boolean
    privateExerciseId?: boolean
    gymPayload?: boolean
    runningPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }, ExtArgs["result"]["scheduleItem"]>

  export type ScheduleItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scheduleId?: boolean
    sequenceOrder?: boolean
    sportType?: boolean
    isPrivateExercise?: boolean
    gymMasterId?: boolean
    runningMasterId?: boolean
    privateExerciseId?: boolean
    gymPayload?: boolean
    runningPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }, ExtArgs["result"]["scheduleItem"]>

  export type ScheduleItemSelectScalar = {
    id?: boolean
    scheduleId?: boolean
    sequenceOrder?: boolean
    sportType?: boolean
    isPrivateExercise?: boolean
    gymMasterId?: boolean
    runningMasterId?: boolean
    privateExerciseId?: boolean
    gymPayload?: boolean
    runningPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ScheduleItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "scheduleId" | "sequenceOrder" | "sportType" | "isPrivateExercise" | "gymMasterId" | "runningMasterId" | "privateExerciseId" | "gymPayload" | "runningPayload" | "createdAt" | "updatedAt", ExtArgs["result"]["scheduleItem"]>
  export type ScheduleItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }
  export type ScheduleItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }
  export type ScheduleItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | DailyScheduleDefaultArgs<ExtArgs>
    gymMaster?: boolean | ScheduleItem$gymMasterArgs<ExtArgs>
    runningMaster?: boolean | ScheduleItem$runningMasterArgs<ExtArgs>
    privateExercise?: boolean | ScheduleItem$privateExerciseArgs<ExtArgs>
  }

  export type $ScheduleItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScheduleItem"
    objects: {
      schedule: Prisma.$DailySchedulePayload<ExtArgs>
      gymMaster: Prisma.$GymExerciseMasterPayload<ExtArgs> | null
      runningMaster: Prisma.$RunningExerciseMasterPayload<ExtArgs> | null
      privateExercise: Prisma.$PrivateExercisePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      scheduleId: string
      sequenceOrder: number
      sportType: string
      isPrivateExercise: boolean
      gymMasterId: string | null
      runningMasterId: string | null
      privateExerciseId: string | null
      gymPayload: Prisma.JsonValue | null
      runningPayload: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["scheduleItem"]>
    composites: {}
  }

  type ScheduleItemGetPayload<S extends boolean | null | undefined | ScheduleItemDefaultArgs> = $Result.GetResult<Prisma.$ScheduleItemPayload, S>

  type ScheduleItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScheduleItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScheduleItemCountAggregateInputType | true
    }

  export interface ScheduleItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScheduleItem'], meta: { name: 'ScheduleItem' } }
    /**
     * Find zero or one ScheduleItem that matches the filter.
     * @param {ScheduleItemFindUniqueArgs} args - Arguments to find a ScheduleItem
     * @example
     * // Get one ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScheduleItemFindUniqueArgs>(args: SelectSubset<T, ScheduleItemFindUniqueArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ScheduleItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScheduleItemFindUniqueOrThrowArgs} args - Arguments to find a ScheduleItem
     * @example
     * // Get one ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScheduleItemFindUniqueOrThrowArgs>(args: SelectSubset<T, ScheduleItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScheduleItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemFindFirstArgs} args - Arguments to find a ScheduleItem
     * @example
     * // Get one ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScheduleItemFindFirstArgs>(args?: SelectSubset<T, ScheduleItemFindFirstArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScheduleItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemFindFirstOrThrowArgs} args - Arguments to find a ScheduleItem
     * @example
     * // Get one ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScheduleItemFindFirstOrThrowArgs>(args?: SelectSubset<T, ScheduleItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ScheduleItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScheduleItems
     * const scheduleItems = await prisma.scheduleItem.findMany()
     * 
     * // Get first 10 ScheduleItems
     * const scheduleItems = await prisma.scheduleItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scheduleItemWithIdOnly = await prisma.scheduleItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScheduleItemFindManyArgs>(args?: SelectSubset<T, ScheduleItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ScheduleItem.
     * @param {ScheduleItemCreateArgs} args - Arguments to create a ScheduleItem.
     * @example
     * // Create one ScheduleItem
     * const ScheduleItem = await prisma.scheduleItem.create({
     *   data: {
     *     // ... data to create a ScheduleItem
     *   }
     * })
     * 
     */
    create<T extends ScheduleItemCreateArgs>(args: SelectSubset<T, ScheduleItemCreateArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ScheduleItems.
     * @param {ScheduleItemCreateManyArgs} args - Arguments to create many ScheduleItems.
     * @example
     * // Create many ScheduleItems
     * const scheduleItem = await prisma.scheduleItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScheduleItemCreateManyArgs>(args?: SelectSubset<T, ScheduleItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScheduleItems and returns the data saved in the database.
     * @param {ScheduleItemCreateManyAndReturnArgs} args - Arguments to create many ScheduleItems.
     * @example
     * // Create many ScheduleItems
     * const scheduleItem = await prisma.scheduleItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScheduleItems and only return the `id`
     * const scheduleItemWithIdOnly = await prisma.scheduleItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScheduleItemCreateManyAndReturnArgs>(args?: SelectSubset<T, ScheduleItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ScheduleItem.
     * @param {ScheduleItemDeleteArgs} args - Arguments to delete one ScheduleItem.
     * @example
     * // Delete one ScheduleItem
     * const ScheduleItem = await prisma.scheduleItem.delete({
     *   where: {
     *     // ... filter to delete one ScheduleItem
     *   }
     * })
     * 
     */
    delete<T extends ScheduleItemDeleteArgs>(args: SelectSubset<T, ScheduleItemDeleteArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ScheduleItem.
     * @param {ScheduleItemUpdateArgs} args - Arguments to update one ScheduleItem.
     * @example
     * // Update one ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScheduleItemUpdateArgs>(args: SelectSubset<T, ScheduleItemUpdateArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ScheduleItems.
     * @param {ScheduleItemDeleteManyArgs} args - Arguments to filter ScheduleItems to delete.
     * @example
     * // Delete a few ScheduleItems
     * const { count } = await prisma.scheduleItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScheduleItemDeleteManyArgs>(args?: SelectSubset<T, ScheduleItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScheduleItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScheduleItems
     * const scheduleItem = await prisma.scheduleItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScheduleItemUpdateManyArgs>(args: SelectSubset<T, ScheduleItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScheduleItems and returns the data updated in the database.
     * @param {ScheduleItemUpdateManyAndReturnArgs} args - Arguments to update many ScheduleItems.
     * @example
     * // Update many ScheduleItems
     * const scheduleItem = await prisma.scheduleItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ScheduleItems and only return the `id`
     * const scheduleItemWithIdOnly = await prisma.scheduleItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScheduleItemUpdateManyAndReturnArgs>(args: SelectSubset<T, ScheduleItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ScheduleItem.
     * @param {ScheduleItemUpsertArgs} args - Arguments to update or create a ScheduleItem.
     * @example
     * // Update or create a ScheduleItem
     * const scheduleItem = await prisma.scheduleItem.upsert({
     *   create: {
     *     // ... data to create a ScheduleItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScheduleItem we want to update
     *   }
     * })
     */
    upsert<T extends ScheduleItemUpsertArgs>(args: SelectSubset<T, ScheduleItemUpsertArgs<ExtArgs>>): Prisma__ScheduleItemClient<$Result.GetResult<Prisma.$ScheduleItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ScheduleItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemCountArgs} args - Arguments to filter ScheduleItems to count.
     * @example
     * // Count the number of ScheduleItems
     * const count = await prisma.scheduleItem.count({
     *   where: {
     *     // ... the filter for the ScheduleItems we want to count
     *   }
     * })
    **/
    count<T extends ScheduleItemCountArgs>(
      args?: Subset<T, ScheduleItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScheduleItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScheduleItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScheduleItemAggregateArgs>(args: Subset<T, ScheduleItemAggregateArgs>): Prisma.PrismaPromise<GetScheduleItemAggregateType<T>>

    /**
     * Group by ScheduleItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScheduleItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScheduleItemGroupByArgs['orderBy'] }
        : { orderBy?: ScheduleItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScheduleItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScheduleItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScheduleItem model
   */
  readonly fields: ScheduleItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScheduleItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScheduleItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    schedule<T extends DailyScheduleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DailyScheduleDefaultArgs<ExtArgs>>): Prisma__DailyScheduleClient<$Result.GetResult<Prisma.$DailySchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    gymMaster<T extends ScheduleItem$gymMasterArgs<ExtArgs> = {}>(args?: Subset<T, ScheduleItem$gymMasterArgs<ExtArgs>>): Prisma__GymExerciseMasterClient<$Result.GetResult<Prisma.$GymExerciseMasterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    runningMaster<T extends ScheduleItem$runningMasterArgs<ExtArgs> = {}>(args?: Subset<T, ScheduleItem$runningMasterArgs<ExtArgs>>): Prisma__RunningExerciseMasterClient<$Result.GetResult<Prisma.$RunningExerciseMasterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    privateExercise<T extends ScheduleItem$privateExerciseArgs<ExtArgs> = {}>(args?: Subset<T, ScheduleItem$privateExerciseArgs<ExtArgs>>): Prisma__PrivateExerciseClient<$Result.GetResult<Prisma.$PrivateExercisePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ScheduleItem model
   */
  interface ScheduleItemFieldRefs {
    readonly id: FieldRef<"ScheduleItem", 'String'>
    readonly scheduleId: FieldRef<"ScheduleItem", 'String'>
    readonly sequenceOrder: FieldRef<"ScheduleItem", 'Int'>
    readonly sportType: FieldRef<"ScheduleItem", 'String'>
    readonly isPrivateExercise: FieldRef<"ScheduleItem", 'Boolean'>
    readonly gymMasterId: FieldRef<"ScheduleItem", 'String'>
    readonly runningMasterId: FieldRef<"ScheduleItem", 'String'>
    readonly privateExerciseId: FieldRef<"ScheduleItem", 'String'>
    readonly gymPayload: FieldRef<"ScheduleItem", 'Json'>
    readonly runningPayload: FieldRef<"ScheduleItem", 'Json'>
    readonly createdAt: FieldRef<"ScheduleItem", 'DateTime'>
    readonly updatedAt: FieldRef<"ScheduleItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ScheduleItem findUnique
   */
  export type ScheduleItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter, which ScheduleItem to fetch.
     */
    where: ScheduleItemWhereUniqueInput
  }

  /**
   * ScheduleItem findUniqueOrThrow
   */
  export type ScheduleItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter, which ScheduleItem to fetch.
     */
    where: ScheduleItemWhereUniqueInput
  }

  /**
   * ScheduleItem findFirst
   */
  export type ScheduleItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter, which ScheduleItem to fetch.
     */
    where?: ScheduleItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScheduleItems to fetch.
     */
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScheduleItems.
     */
    cursor?: ScheduleItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScheduleItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScheduleItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScheduleItems.
     */
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * ScheduleItem findFirstOrThrow
   */
  export type ScheduleItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter, which ScheduleItem to fetch.
     */
    where?: ScheduleItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScheduleItems to fetch.
     */
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScheduleItems.
     */
    cursor?: ScheduleItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScheduleItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScheduleItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScheduleItems.
     */
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * ScheduleItem findMany
   */
  export type ScheduleItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter, which ScheduleItems to fetch.
     */
    where?: ScheduleItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScheduleItems to fetch.
     */
    orderBy?: ScheduleItemOrderByWithRelationInput | ScheduleItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScheduleItems.
     */
    cursor?: ScheduleItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScheduleItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScheduleItems.
     */
    skip?: number
    distinct?: ScheduleItemScalarFieldEnum | ScheduleItemScalarFieldEnum[]
  }

  /**
   * ScheduleItem create
   */
  export type ScheduleItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * The data needed to create a ScheduleItem.
     */
    data: XOR<ScheduleItemCreateInput, ScheduleItemUncheckedCreateInput>
  }

  /**
   * ScheduleItem createMany
   */
  export type ScheduleItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScheduleItems.
     */
    data: ScheduleItemCreateManyInput | ScheduleItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ScheduleItem createManyAndReturn
   */
  export type ScheduleItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * The data used to create many ScheduleItems.
     */
    data: ScheduleItemCreateManyInput | ScheduleItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ScheduleItem update
   */
  export type ScheduleItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * The data needed to update a ScheduleItem.
     */
    data: XOR<ScheduleItemUpdateInput, ScheduleItemUncheckedUpdateInput>
    /**
     * Choose, which ScheduleItem to update.
     */
    where: ScheduleItemWhereUniqueInput
  }

  /**
   * ScheduleItem updateMany
   */
  export type ScheduleItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScheduleItems.
     */
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyInput>
    /**
     * Filter which ScheduleItems to update
     */
    where?: ScheduleItemWhereInput
    /**
     * Limit how many ScheduleItems to update.
     */
    limit?: number
  }

  /**
   * ScheduleItem updateManyAndReturn
   */
  export type ScheduleItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * The data used to update ScheduleItems.
     */
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyInput>
    /**
     * Filter which ScheduleItems to update
     */
    where?: ScheduleItemWhereInput
    /**
     * Limit how many ScheduleItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ScheduleItem upsert
   */
  export type ScheduleItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * The filter to search for the ScheduleItem to update in case it exists.
     */
    where: ScheduleItemWhereUniqueInput
    /**
     * In case the ScheduleItem found by the `where` argument doesn't exist, create a new ScheduleItem with this data.
     */
    create: XOR<ScheduleItemCreateInput, ScheduleItemUncheckedCreateInput>
    /**
     * In case the ScheduleItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScheduleItemUpdateInput, ScheduleItemUncheckedUpdateInput>
  }

  /**
   * ScheduleItem delete
   */
  export type ScheduleItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
    /**
     * Filter which ScheduleItem to delete.
     */
    where: ScheduleItemWhereUniqueInput
  }

  /**
   * ScheduleItem deleteMany
   */
  export type ScheduleItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduleItems to delete
     */
    where?: ScheduleItemWhereInput
    /**
     * Limit how many ScheduleItems to delete.
     */
    limit?: number
  }

  /**
   * ScheduleItem.gymMaster
   */
  export type ScheduleItem$gymMasterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GymExerciseMaster
     */
    select?: GymExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GymExerciseMaster
     */
    omit?: GymExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GymExerciseMasterInclude<ExtArgs> | null
    where?: GymExerciseMasterWhereInput
  }

  /**
   * ScheduleItem.runningMaster
   */
  export type ScheduleItem$runningMasterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RunningExerciseMaster
     */
    select?: RunningExerciseMasterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RunningExerciseMaster
     */
    omit?: RunningExerciseMasterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RunningExerciseMasterInclude<ExtArgs> | null
    where?: RunningExerciseMasterWhereInput
  }

  /**
   * ScheduleItem.privateExercise
   */
  export type ScheduleItem$privateExerciseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrivateExercise
     */
    select?: PrivateExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrivateExercise
     */
    omit?: PrivateExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrivateExerciseInclude<ExtArgs> | null
    where?: PrivateExerciseWhereInput
  }

  /**
   * ScheduleItem without action
   */
  export type ScheduleItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleItem
     */
    select?: ScheduleItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScheduleItem
     */
    omit?: ScheduleItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleItemInclude<ExtArgs> | null
  }


  /**
   * Model BlogPost
   */

  export type AggregateBlogPost = {
    _count: BlogPostCountAggregateOutputType | null
    _avg: BlogPostAvgAggregateOutputType | null
    _sum: BlogPostSumAggregateOutputType | null
    _min: BlogPostMinAggregateOutputType | null
    _max: BlogPostMaxAggregateOutputType | null
  }

  export type BlogPostAvgAggregateOutputType = {
    readingTime: number | null
  }

  export type BlogPostSumAggregateOutputType = {
    readingTime: number | null
  }

  export type BlogPostMinAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    excerpt: string | null
    content: string | null
    coverImage: string | null
    categoryKey: string | null
    status: string | null
    readingTime: number | null
    publishedAt: Date | null
    authorId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogPostMaxAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    excerpt: string | null
    content: string | null
    coverImage: string | null
    categoryKey: string | null
    status: string | null
    readingTime: number | null
    publishedAt: Date | null
    authorId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogPostCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    excerpt: number
    content: number
    coverImage: number
    tags: number
    categoryKey: number
    status: number
    readingTime: number
    publishedAt: number
    authorId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BlogPostAvgAggregateInputType = {
    readingTime?: true
  }

  export type BlogPostSumAggregateInputType = {
    readingTime?: true
  }

  export type BlogPostMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    excerpt?: true
    content?: true
    coverImage?: true
    categoryKey?: true
    status?: true
    readingTime?: true
    publishedAt?: true
    authorId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogPostMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    excerpt?: true
    content?: true
    coverImage?: true
    categoryKey?: true
    status?: true
    readingTime?: true
    publishedAt?: true
    authorId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogPostCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    excerpt?: true
    content?: true
    coverImage?: true
    tags?: true
    categoryKey?: true
    status?: true
    readingTime?: true
    publishedAt?: true
    authorId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BlogPostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogPost to aggregate.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlogPosts
    **/
    _count?: true | BlogPostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BlogPostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BlogPostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlogPostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlogPostMaxAggregateInputType
  }

  export type GetBlogPostAggregateType<T extends BlogPostAggregateArgs> = {
        [P in keyof T & keyof AggregateBlogPost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlogPost[P]>
      : GetScalarType<T[P], AggregateBlogPost[P]>
  }




  export type BlogPostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogPostWhereInput
    orderBy?: BlogPostOrderByWithAggregationInput | BlogPostOrderByWithAggregationInput[]
    by: BlogPostScalarFieldEnum[] | BlogPostScalarFieldEnum
    having?: BlogPostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlogPostCountAggregateInputType | true
    _avg?: BlogPostAvgAggregateInputType
    _sum?: BlogPostSumAggregateInputType
    _min?: BlogPostMinAggregateInputType
    _max?: BlogPostMaxAggregateInputType
  }

  export type BlogPostGroupByOutputType = {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    coverImage: string | null
    tags: string[]
    categoryKey: string | null
    status: string
    readingTime: number
    publishedAt: Date | null
    authorId: string | null
    createdAt: Date
    updatedAt: Date
    _count: BlogPostCountAggregateOutputType | null
    _avg: BlogPostAvgAggregateOutputType | null
    _sum: BlogPostSumAggregateOutputType | null
    _min: BlogPostMinAggregateOutputType | null
    _max: BlogPostMaxAggregateOutputType | null
  }

  type GetBlogPostGroupByPayload<T extends BlogPostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlogPostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlogPostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlogPostGroupByOutputType[P]>
            : GetScalarType<T[P], BlogPostGroupByOutputType[P]>
        }
      >
    >


  export type BlogPostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    content?: boolean
    coverImage?: boolean
    tags?: boolean
    categoryKey?: boolean
    status?: boolean
    readingTime?: boolean
    publishedAt?: boolean
    authorId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    content?: boolean
    coverImage?: boolean
    tags?: boolean
    categoryKey?: boolean
    status?: boolean
    readingTime?: boolean
    publishedAt?: boolean
    authorId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    content?: boolean
    coverImage?: boolean
    tags?: boolean
    categoryKey?: boolean
    status?: boolean
    readingTime?: boolean
    publishedAt?: boolean
    authorId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    content?: boolean
    coverImage?: boolean
    tags?: boolean
    categoryKey?: boolean
    status?: boolean
    readingTime?: boolean
    publishedAt?: boolean
    authorId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BlogPostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "slug" | "excerpt" | "content" | "coverImage" | "tags" | "categoryKey" | "status" | "readingTime" | "publishedAt" | "authorId" | "createdAt" | "updatedAt", ExtArgs["result"]["blogPost"]>
  export type BlogPostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }
  export type BlogPostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }
  export type BlogPostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | BlogPost$categoryArgs<ExtArgs>
  }

  export type $BlogPostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlogPost"
    objects: {
      category: Prisma.$BlogCategoryPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      slug: string
      excerpt: string
      content: string
      coverImage: string | null
      tags: string[]
      categoryKey: string | null
      status: string
      readingTime: number
      publishedAt: Date | null
      authorId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["blogPost"]>
    composites: {}
  }

  type BlogPostGetPayload<S extends boolean | null | undefined | BlogPostDefaultArgs> = $Result.GetResult<Prisma.$BlogPostPayload, S>

  type BlogPostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlogPostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlogPostCountAggregateInputType | true
    }

  export interface BlogPostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlogPost'], meta: { name: 'BlogPost' } }
    /**
     * Find zero or one BlogPost that matches the filter.
     * @param {BlogPostFindUniqueArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlogPostFindUniqueArgs>(args: SelectSubset<T, BlogPostFindUniqueArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BlogPost that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlogPostFindUniqueOrThrowArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlogPostFindUniqueOrThrowArgs>(args: SelectSubset<T, BlogPostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogPost that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindFirstArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlogPostFindFirstArgs>(args?: SelectSubset<T, BlogPostFindFirstArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogPost that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindFirstOrThrowArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlogPostFindFirstOrThrowArgs>(args?: SelectSubset<T, BlogPostFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BlogPosts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlogPosts
     * const blogPosts = await prisma.blogPost.findMany()
     * 
     * // Get first 10 BlogPosts
     * const blogPosts = await prisma.blogPost.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlogPostFindManyArgs>(args?: SelectSubset<T, BlogPostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BlogPost.
     * @param {BlogPostCreateArgs} args - Arguments to create a BlogPost.
     * @example
     * // Create one BlogPost
     * const BlogPost = await prisma.blogPost.create({
     *   data: {
     *     // ... data to create a BlogPost
     *   }
     * })
     * 
     */
    create<T extends BlogPostCreateArgs>(args: SelectSubset<T, BlogPostCreateArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BlogPosts.
     * @param {BlogPostCreateManyArgs} args - Arguments to create many BlogPosts.
     * @example
     * // Create many BlogPosts
     * const blogPost = await prisma.blogPost.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlogPostCreateManyArgs>(args?: SelectSubset<T, BlogPostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlogPosts and returns the data saved in the database.
     * @param {BlogPostCreateManyAndReturnArgs} args - Arguments to create many BlogPosts.
     * @example
     * // Create many BlogPosts
     * const blogPost = await prisma.blogPost.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlogPosts and only return the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlogPostCreateManyAndReturnArgs>(args?: SelectSubset<T, BlogPostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BlogPost.
     * @param {BlogPostDeleteArgs} args - Arguments to delete one BlogPost.
     * @example
     * // Delete one BlogPost
     * const BlogPost = await prisma.blogPost.delete({
     *   where: {
     *     // ... filter to delete one BlogPost
     *   }
     * })
     * 
     */
    delete<T extends BlogPostDeleteArgs>(args: SelectSubset<T, BlogPostDeleteArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BlogPost.
     * @param {BlogPostUpdateArgs} args - Arguments to update one BlogPost.
     * @example
     * // Update one BlogPost
     * const blogPost = await prisma.blogPost.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlogPostUpdateArgs>(args: SelectSubset<T, BlogPostUpdateArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BlogPosts.
     * @param {BlogPostDeleteManyArgs} args - Arguments to filter BlogPosts to delete.
     * @example
     * // Delete a few BlogPosts
     * const { count } = await prisma.blogPost.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlogPostDeleteManyArgs>(args?: SelectSubset<T, BlogPostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogPosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlogPosts
     * const blogPost = await prisma.blogPost.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlogPostUpdateManyArgs>(args: SelectSubset<T, BlogPostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogPosts and returns the data updated in the database.
     * @param {BlogPostUpdateManyAndReturnArgs} args - Arguments to update many BlogPosts.
     * @example
     * // Update many BlogPosts
     * const blogPost = await prisma.blogPost.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BlogPosts and only return the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlogPostUpdateManyAndReturnArgs>(args: SelectSubset<T, BlogPostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BlogPost.
     * @param {BlogPostUpsertArgs} args - Arguments to update or create a BlogPost.
     * @example
     * // Update or create a BlogPost
     * const blogPost = await prisma.blogPost.upsert({
     *   create: {
     *     // ... data to create a BlogPost
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlogPost we want to update
     *   }
     * })
     */
    upsert<T extends BlogPostUpsertArgs>(args: SelectSubset<T, BlogPostUpsertArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BlogPosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostCountArgs} args - Arguments to filter BlogPosts to count.
     * @example
     * // Count the number of BlogPosts
     * const count = await prisma.blogPost.count({
     *   where: {
     *     // ... the filter for the BlogPosts we want to count
     *   }
     * })
    **/
    count<T extends BlogPostCountArgs>(
      args?: Subset<T, BlogPostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlogPostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlogPost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlogPostAggregateArgs>(args: Subset<T, BlogPostAggregateArgs>): Prisma.PrismaPromise<GetBlogPostAggregateType<T>>

    /**
     * Group by BlogPost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlogPostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlogPostGroupByArgs['orderBy'] }
        : { orderBy?: BlogPostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlogPostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlogPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlogPost model
   */
  readonly fields: BlogPostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlogPost.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlogPostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends BlogPost$categoryArgs<ExtArgs> = {}>(args?: Subset<T, BlogPost$categoryArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlogPost model
   */
  interface BlogPostFieldRefs {
    readonly id: FieldRef<"BlogPost", 'String'>
    readonly title: FieldRef<"BlogPost", 'String'>
    readonly slug: FieldRef<"BlogPost", 'String'>
    readonly excerpt: FieldRef<"BlogPost", 'String'>
    readonly content: FieldRef<"BlogPost", 'String'>
    readonly coverImage: FieldRef<"BlogPost", 'String'>
    readonly tags: FieldRef<"BlogPost", 'String[]'>
    readonly categoryKey: FieldRef<"BlogPost", 'String'>
    readonly status: FieldRef<"BlogPost", 'String'>
    readonly readingTime: FieldRef<"BlogPost", 'Int'>
    readonly publishedAt: FieldRef<"BlogPost", 'DateTime'>
    readonly authorId: FieldRef<"BlogPost", 'String'>
    readonly createdAt: FieldRef<"BlogPost", 'DateTime'>
    readonly updatedAt: FieldRef<"BlogPost", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlogPost findUnique
   */
  export type BlogPostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost findUniqueOrThrow
   */
  export type BlogPostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost findFirst
   */
  export type BlogPostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogPosts.
     */
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost findFirstOrThrow
   */
  export type BlogPostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogPosts.
     */
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost findMany
   */
  export type BlogPostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPosts to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost create
   */
  export type BlogPostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The data needed to create a BlogPost.
     */
    data: XOR<BlogPostCreateInput, BlogPostUncheckedCreateInput>
  }

  /**
   * BlogPost createMany
   */
  export type BlogPostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlogPosts.
     */
    data: BlogPostCreateManyInput | BlogPostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogPost createManyAndReturn
   */
  export type BlogPostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * The data used to create many BlogPosts.
     */
    data: BlogPostCreateManyInput | BlogPostCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogPost update
   */
  export type BlogPostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The data needed to update a BlogPost.
     */
    data: XOR<BlogPostUpdateInput, BlogPostUncheckedUpdateInput>
    /**
     * Choose, which BlogPost to update.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost updateMany
   */
  export type BlogPostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlogPosts.
     */
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyInput>
    /**
     * Filter which BlogPosts to update
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to update.
     */
    limit?: number
  }

  /**
   * BlogPost updateManyAndReturn
   */
  export type BlogPostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * The data used to update BlogPosts.
     */
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyInput>
    /**
     * Filter which BlogPosts to update
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogPost upsert
   */
  export type BlogPostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The filter to search for the BlogPost to update in case it exists.
     */
    where: BlogPostWhereUniqueInput
    /**
     * In case the BlogPost found by the `where` argument doesn't exist, create a new BlogPost with this data.
     */
    create: XOR<BlogPostCreateInput, BlogPostUncheckedCreateInput>
    /**
     * In case the BlogPost was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlogPostUpdateInput, BlogPostUncheckedUpdateInput>
  }

  /**
   * BlogPost delete
   */
  export type BlogPostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter which BlogPost to delete.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost deleteMany
   */
  export type BlogPostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogPosts to delete
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to delete.
     */
    limit?: number
  }

  /**
   * BlogPost.category
   */
  export type BlogPost$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    where?: BlogCategoryWhereInput
  }

  /**
   * BlogPost without action
   */
  export type BlogPostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
  }


  /**
   * Model BlogCategory
   */

  export type AggregateBlogCategory = {
    _count: BlogCategoryCountAggregateOutputType | null
    _avg: BlogCategoryAvgAggregateOutputType | null
    _sum: BlogCategorySumAggregateOutputType | null
    _min: BlogCategoryMinAggregateOutputType | null
    _max: BlogCategoryMaxAggregateOutputType | null
  }

  export type BlogCategoryAvgAggregateOutputType = {
    order: number | null
  }

  export type BlogCategorySumAggregateOutputType = {
    order: number | null
  }

  export type BlogCategoryMinAggregateOutputType = {
    id: string | null
    key: string | null
    label: string | null
    description: string | null
    imageUrl: string | null
    isActive: boolean | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogCategoryMaxAggregateOutputType = {
    id: string | null
    key: string | null
    label: string | null
    description: string | null
    imageUrl: string | null
    isActive: boolean | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogCategoryCountAggregateOutputType = {
    id: number
    key: number
    label: number
    description: number
    imageUrl: number
    isActive: number
    order: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BlogCategoryAvgAggregateInputType = {
    order?: true
  }

  export type BlogCategorySumAggregateInputType = {
    order?: true
  }

  export type BlogCategoryMinAggregateInputType = {
    id?: true
    key?: true
    label?: true
    description?: true
    imageUrl?: true
    isActive?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogCategoryMaxAggregateInputType = {
    id?: true
    key?: true
    label?: true
    description?: true
    imageUrl?: true
    isActive?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogCategoryCountAggregateInputType = {
    id?: true
    key?: true
    label?: true
    description?: true
    imageUrl?: true
    isActive?: true
    order?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BlogCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogCategory to aggregate.
     */
    where?: BlogCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogCategories to fetch.
     */
    orderBy?: BlogCategoryOrderByWithRelationInput | BlogCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlogCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlogCategories
    **/
    _count?: true | BlogCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BlogCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BlogCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlogCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlogCategoryMaxAggregateInputType
  }

  export type GetBlogCategoryAggregateType<T extends BlogCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateBlogCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlogCategory[P]>
      : GetScalarType<T[P], AggregateBlogCategory[P]>
  }




  export type BlogCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogCategoryWhereInput
    orderBy?: BlogCategoryOrderByWithAggregationInput | BlogCategoryOrderByWithAggregationInput[]
    by: BlogCategoryScalarFieldEnum[] | BlogCategoryScalarFieldEnum
    having?: BlogCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlogCategoryCountAggregateInputType | true
    _avg?: BlogCategoryAvgAggregateInputType
    _sum?: BlogCategorySumAggregateInputType
    _min?: BlogCategoryMinAggregateInputType
    _max?: BlogCategoryMaxAggregateInputType
  }

  export type BlogCategoryGroupByOutputType = {
    id: string
    key: string
    label: string
    description: string | null
    imageUrl: string | null
    isActive: boolean
    order: number
    createdAt: Date
    updatedAt: Date
    _count: BlogCategoryCountAggregateOutputType | null
    _avg: BlogCategoryAvgAggregateOutputType | null
    _sum: BlogCategorySumAggregateOutputType | null
    _min: BlogCategoryMinAggregateOutputType | null
    _max: BlogCategoryMaxAggregateOutputType | null
  }

  type GetBlogCategoryGroupByPayload<T extends BlogCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlogCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlogCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlogCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], BlogCategoryGroupByOutputType[P]>
        }
      >
    >


  export type BlogCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    label?: boolean
    description?: boolean
    imageUrl?: boolean
    isActive?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    posts?: boolean | BlogCategory$postsArgs<ExtArgs>
    _count?: boolean | BlogCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogCategory"]>

  export type BlogCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    label?: boolean
    description?: boolean
    imageUrl?: boolean
    isActive?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["blogCategory"]>

  export type BlogCategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    label?: boolean
    description?: boolean
    imageUrl?: boolean
    isActive?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["blogCategory"]>

  export type BlogCategorySelectScalar = {
    id?: boolean
    key?: boolean
    label?: boolean
    description?: boolean
    imageUrl?: boolean
    isActive?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BlogCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "label" | "description" | "imageUrl" | "isActive" | "order" | "createdAt" | "updatedAt", ExtArgs["result"]["blogCategory"]>
  export type BlogCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | BlogCategory$postsArgs<ExtArgs>
    _count?: boolean | BlogCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BlogCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BlogCategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BlogCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlogCategory"
    objects: {
      posts: Prisma.$BlogPostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      label: string
      description: string | null
      imageUrl: string | null
      isActive: boolean
      order: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["blogCategory"]>
    composites: {}
  }

  type BlogCategoryGetPayload<S extends boolean | null | undefined | BlogCategoryDefaultArgs> = $Result.GetResult<Prisma.$BlogCategoryPayload, S>

  type BlogCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlogCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlogCategoryCountAggregateInputType | true
    }

  export interface BlogCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlogCategory'], meta: { name: 'BlogCategory' } }
    /**
     * Find zero or one BlogCategory that matches the filter.
     * @param {BlogCategoryFindUniqueArgs} args - Arguments to find a BlogCategory
     * @example
     * // Get one BlogCategory
     * const blogCategory = await prisma.blogCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlogCategoryFindUniqueArgs>(args: SelectSubset<T, BlogCategoryFindUniqueArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BlogCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlogCategoryFindUniqueOrThrowArgs} args - Arguments to find a BlogCategory
     * @example
     * // Get one BlogCategory
     * const blogCategory = await prisma.blogCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlogCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, BlogCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryFindFirstArgs} args - Arguments to find a BlogCategory
     * @example
     * // Get one BlogCategory
     * const blogCategory = await prisma.blogCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlogCategoryFindFirstArgs>(args?: SelectSubset<T, BlogCategoryFindFirstArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryFindFirstOrThrowArgs} args - Arguments to find a BlogCategory
     * @example
     * // Get one BlogCategory
     * const blogCategory = await prisma.blogCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlogCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, BlogCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BlogCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlogCategories
     * const blogCategories = await prisma.blogCategory.findMany()
     * 
     * // Get first 10 BlogCategories
     * const blogCategories = await prisma.blogCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blogCategoryWithIdOnly = await prisma.blogCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlogCategoryFindManyArgs>(args?: SelectSubset<T, BlogCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BlogCategory.
     * @param {BlogCategoryCreateArgs} args - Arguments to create a BlogCategory.
     * @example
     * // Create one BlogCategory
     * const BlogCategory = await prisma.blogCategory.create({
     *   data: {
     *     // ... data to create a BlogCategory
     *   }
     * })
     * 
     */
    create<T extends BlogCategoryCreateArgs>(args: SelectSubset<T, BlogCategoryCreateArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BlogCategories.
     * @param {BlogCategoryCreateManyArgs} args - Arguments to create many BlogCategories.
     * @example
     * // Create many BlogCategories
     * const blogCategory = await prisma.blogCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlogCategoryCreateManyArgs>(args?: SelectSubset<T, BlogCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlogCategories and returns the data saved in the database.
     * @param {BlogCategoryCreateManyAndReturnArgs} args - Arguments to create many BlogCategories.
     * @example
     * // Create many BlogCategories
     * const blogCategory = await prisma.blogCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlogCategories and only return the `id`
     * const blogCategoryWithIdOnly = await prisma.blogCategory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlogCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, BlogCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BlogCategory.
     * @param {BlogCategoryDeleteArgs} args - Arguments to delete one BlogCategory.
     * @example
     * // Delete one BlogCategory
     * const BlogCategory = await prisma.blogCategory.delete({
     *   where: {
     *     // ... filter to delete one BlogCategory
     *   }
     * })
     * 
     */
    delete<T extends BlogCategoryDeleteArgs>(args: SelectSubset<T, BlogCategoryDeleteArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BlogCategory.
     * @param {BlogCategoryUpdateArgs} args - Arguments to update one BlogCategory.
     * @example
     * // Update one BlogCategory
     * const blogCategory = await prisma.blogCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlogCategoryUpdateArgs>(args: SelectSubset<T, BlogCategoryUpdateArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BlogCategories.
     * @param {BlogCategoryDeleteManyArgs} args - Arguments to filter BlogCategories to delete.
     * @example
     * // Delete a few BlogCategories
     * const { count } = await prisma.blogCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlogCategoryDeleteManyArgs>(args?: SelectSubset<T, BlogCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlogCategories
     * const blogCategory = await prisma.blogCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlogCategoryUpdateManyArgs>(args: SelectSubset<T, BlogCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogCategories and returns the data updated in the database.
     * @param {BlogCategoryUpdateManyAndReturnArgs} args - Arguments to update many BlogCategories.
     * @example
     * // Update many BlogCategories
     * const blogCategory = await prisma.blogCategory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BlogCategories and only return the `id`
     * const blogCategoryWithIdOnly = await prisma.blogCategory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlogCategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, BlogCategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BlogCategory.
     * @param {BlogCategoryUpsertArgs} args - Arguments to update or create a BlogCategory.
     * @example
     * // Update or create a BlogCategory
     * const blogCategory = await prisma.blogCategory.upsert({
     *   create: {
     *     // ... data to create a BlogCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlogCategory we want to update
     *   }
     * })
     */
    upsert<T extends BlogCategoryUpsertArgs>(args: SelectSubset<T, BlogCategoryUpsertArgs<ExtArgs>>): Prisma__BlogCategoryClient<$Result.GetResult<Prisma.$BlogCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BlogCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryCountArgs} args - Arguments to filter BlogCategories to count.
     * @example
     * // Count the number of BlogCategories
     * const count = await prisma.blogCategory.count({
     *   where: {
     *     // ... the filter for the BlogCategories we want to count
     *   }
     * })
    **/
    count<T extends BlogCategoryCountArgs>(
      args?: Subset<T, BlogCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlogCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlogCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlogCategoryAggregateArgs>(args: Subset<T, BlogCategoryAggregateArgs>): Prisma.PrismaPromise<GetBlogCategoryAggregateType<T>>

    /**
     * Group by BlogCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlogCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlogCategoryGroupByArgs['orderBy'] }
        : { orderBy?: BlogCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlogCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlogCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlogCategory model
   */
  readonly fields: BlogCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlogCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlogCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    posts<T extends BlogCategory$postsArgs<ExtArgs> = {}>(args?: Subset<T, BlogCategory$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlogCategory model
   */
  interface BlogCategoryFieldRefs {
    readonly id: FieldRef<"BlogCategory", 'String'>
    readonly key: FieldRef<"BlogCategory", 'String'>
    readonly label: FieldRef<"BlogCategory", 'String'>
    readonly description: FieldRef<"BlogCategory", 'String'>
    readonly imageUrl: FieldRef<"BlogCategory", 'String'>
    readonly isActive: FieldRef<"BlogCategory", 'Boolean'>
    readonly order: FieldRef<"BlogCategory", 'Int'>
    readonly createdAt: FieldRef<"BlogCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"BlogCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlogCategory findUnique
   */
  export type BlogCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter, which BlogCategory to fetch.
     */
    where: BlogCategoryWhereUniqueInput
  }

  /**
   * BlogCategory findUniqueOrThrow
   */
  export type BlogCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter, which BlogCategory to fetch.
     */
    where: BlogCategoryWhereUniqueInput
  }

  /**
   * BlogCategory findFirst
   */
  export type BlogCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter, which BlogCategory to fetch.
     */
    where?: BlogCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogCategories to fetch.
     */
    orderBy?: BlogCategoryOrderByWithRelationInput | BlogCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogCategories.
     */
    cursor?: BlogCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogCategories.
     */
    distinct?: BlogCategoryScalarFieldEnum | BlogCategoryScalarFieldEnum[]
  }

  /**
   * BlogCategory findFirstOrThrow
   */
  export type BlogCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter, which BlogCategory to fetch.
     */
    where?: BlogCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogCategories to fetch.
     */
    orderBy?: BlogCategoryOrderByWithRelationInput | BlogCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogCategories.
     */
    cursor?: BlogCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogCategories.
     */
    distinct?: BlogCategoryScalarFieldEnum | BlogCategoryScalarFieldEnum[]
  }

  /**
   * BlogCategory findMany
   */
  export type BlogCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter, which BlogCategories to fetch.
     */
    where?: BlogCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogCategories to fetch.
     */
    orderBy?: BlogCategoryOrderByWithRelationInput | BlogCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlogCategories.
     */
    cursor?: BlogCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogCategories.
     */
    skip?: number
    distinct?: BlogCategoryScalarFieldEnum | BlogCategoryScalarFieldEnum[]
  }

  /**
   * BlogCategory create
   */
  export type BlogCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a BlogCategory.
     */
    data: XOR<BlogCategoryCreateInput, BlogCategoryUncheckedCreateInput>
  }

  /**
   * BlogCategory createMany
   */
  export type BlogCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlogCategories.
     */
    data: BlogCategoryCreateManyInput | BlogCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogCategory createManyAndReturn
   */
  export type BlogCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * The data used to create many BlogCategories.
     */
    data: BlogCategoryCreateManyInput | BlogCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogCategory update
   */
  export type BlogCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a BlogCategory.
     */
    data: XOR<BlogCategoryUpdateInput, BlogCategoryUncheckedUpdateInput>
    /**
     * Choose, which BlogCategory to update.
     */
    where: BlogCategoryWhereUniqueInput
  }

  /**
   * BlogCategory updateMany
   */
  export type BlogCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlogCategories.
     */
    data: XOR<BlogCategoryUpdateManyMutationInput, BlogCategoryUncheckedUpdateManyInput>
    /**
     * Filter which BlogCategories to update
     */
    where?: BlogCategoryWhereInput
    /**
     * Limit how many BlogCategories to update.
     */
    limit?: number
  }

  /**
   * BlogCategory updateManyAndReturn
   */
  export type BlogCategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * The data used to update BlogCategories.
     */
    data: XOR<BlogCategoryUpdateManyMutationInput, BlogCategoryUncheckedUpdateManyInput>
    /**
     * Filter which BlogCategories to update
     */
    where?: BlogCategoryWhereInput
    /**
     * Limit how many BlogCategories to update.
     */
    limit?: number
  }

  /**
   * BlogCategory upsert
   */
  export type BlogCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the BlogCategory to update in case it exists.
     */
    where: BlogCategoryWhereUniqueInput
    /**
     * In case the BlogCategory found by the `where` argument doesn't exist, create a new BlogCategory with this data.
     */
    create: XOR<BlogCategoryCreateInput, BlogCategoryUncheckedCreateInput>
    /**
     * In case the BlogCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlogCategoryUpdateInput, BlogCategoryUncheckedUpdateInput>
  }

  /**
   * BlogCategory delete
   */
  export type BlogCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
    /**
     * Filter which BlogCategory to delete.
     */
    where: BlogCategoryWhereUniqueInput
  }

  /**
   * BlogCategory deleteMany
   */
  export type BlogCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogCategories to delete
     */
    where?: BlogCategoryWhereInput
    /**
     * Limit how many BlogCategories to delete.
     */
    limit?: number
  }

  /**
   * BlogCategory.posts
   */
  export type BlogCategory$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    where?: BlogPostWhereInput
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    cursor?: BlogPostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogCategory without action
   */
  export type BlogCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogCategory
     */
    select?: BlogCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogCategory
     */
    omit?: BlogCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogCategoryInclude<ExtArgs> | null
  }


  /**
   * Model Asset
   */

  export type AggregateAsset = {
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  export type AssetAvgAggregateOutputType = {
    size: number | null
  }

  export type AssetSumAggregateOutputType = {
    size: number | null
  }

  export type AssetMinAggregateOutputType = {
    id: string | null
    fileName: string | null
    url: string | null
    key: string | null
    storageProvider: string | null
    mimeType: string | null
    size: number | null
    category: string | null
    uploadedBy: string | null
    createdAt: Date | null
  }

  export type AssetMaxAggregateOutputType = {
    id: string | null
    fileName: string | null
    url: string | null
    key: string | null
    storageProvider: string | null
    mimeType: string | null
    size: number | null
    category: string | null
    uploadedBy: string | null
    createdAt: Date | null
  }

  export type AssetCountAggregateOutputType = {
    id: number
    fileName: number
    url: number
    key: number
    storageProvider: number
    mimeType: number
    size: number
    category: number
    uploadedBy: number
    createdAt: number
    _all: number
  }


  export type AssetAvgAggregateInputType = {
    size?: true
  }

  export type AssetSumAggregateInputType = {
    size?: true
  }

  export type AssetMinAggregateInputType = {
    id?: true
    fileName?: true
    url?: true
    key?: true
    storageProvider?: true
    mimeType?: true
    size?: true
    category?: true
    uploadedBy?: true
    createdAt?: true
  }

  export type AssetMaxAggregateInputType = {
    id?: true
    fileName?: true
    url?: true
    key?: true
    storageProvider?: true
    mimeType?: true
    size?: true
    category?: true
    uploadedBy?: true
    createdAt?: true
  }

  export type AssetCountAggregateInputType = {
    id?: true
    fileName?: true
    url?: true
    key?: true
    storageProvider?: true
    mimeType?: true
    size?: true
    category?: true
    uploadedBy?: true
    createdAt?: true
    _all?: true
  }

  export type AssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Asset to aggregate.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assets
    **/
    _count?: true | AssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetMaxAggregateInputType
  }

  export type GetAssetAggregateType<T extends AssetAggregateArgs> = {
        [P in keyof T & keyof AggregateAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsset[P]>
      : GetScalarType<T[P], AggregateAsset[P]>
  }




  export type AssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithAggregationInput | AssetOrderByWithAggregationInput[]
    by: AssetScalarFieldEnum[] | AssetScalarFieldEnum
    having?: AssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetCountAggregateInputType | true
    _avg?: AssetAvgAggregateInputType
    _sum?: AssetSumAggregateInputType
    _min?: AssetMinAggregateInputType
    _max?: AssetMaxAggregateInputType
  }

  export type AssetGroupByOutputType = {
    id: string
    fileName: string
    url: string
    key: string | null
    storageProvider: string
    mimeType: string | null
    size: number | null
    category: string | null
    uploadedBy: string | null
    createdAt: Date
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  type GetAssetGroupByPayload<T extends AssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetGroupByOutputType[P]>
            : GetScalarType<T[P], AssetGroupByOutputType[P]>
        }
      >
    >


  export type AssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    url?: boolean
    key?: boolean
    storageProvider?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    uploadedBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    url?: boolean
    key?: boolean
    storageProvider?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    uploadedBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    url?: boolean
    key?: boolean
    storageProvider?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    uploadedBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectScalar = {
    id?: boolean
    fileName?: boolean
    url?: boolean
    key?: boolean
    storageProvider?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    uploadedBy?: boolean
    createdAt?: boolean
  }

  export type AssetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fileName" | "url" | "key" | "storageProvider" | "mimeType" | "size" | "category" | "uploadedBy" | "createdAt", ExtArgs["result"]["asset"]>

  export type $AssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Asset"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fileName: string
      url: string
      key: string | null
      storageProvider: string
      mimeType: string | null
      size: number | null
      category: string | null
      uploadedBy: string | null
      createdAt: Date
    }, ExtArgs["result"]["asset"]>
    composites: {}
  }

  type AssetGetPayload<S extends boolean | null | undefined | AssetDefaultArgs> = $Result.GetResult<Prisma.$AssetPayload, S>

  type AssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssetCountAggregateInputType | true
    }

  export interface AssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Asset'], meta: { name: 'Asset' } }
    /**
     * Find zero or one Asset that matches the filter.
     * @param {AssetFindUniqueArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetFindUniqueArgs>(args: SelectSubset<T, AssetFindUniqueArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Asset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetFindUniqueOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetFindFirstArgs>(args?: SelectSubset<T, AssetFindFirstArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Assets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assets
     * const assets = await prisma.asset.findMany()
     * 
     * // Get first 10 Assets
     * const assets = await prisma.asset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetWithIdOnly = await prisma.asset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetFindManyArgs>(args?: SelectSubset<T, AssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Asset.
     * @param {AssetCreateArgs} args - Arguments to create a Asset.
     * @example
     * // Create one Asset
     * const Asset = await prisma.asset.create({
     *   data: {
     *     // ... data to create a Asset
     *   }
     * })
     * 
     */
    create<T extends AssetCreateArgs>(args: SelectSubset<T, AssetCreateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Assets.
     * @param {AssetCreateManyArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetCreateManyArgs>(args?: SelectSubset<T, AssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assets and returns the data saved in the database.
     * @param {AssetCreateManyAndReturnArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Asset.
     * @param {AssetDeleteArgs} args - Arguments to delete one Asset.
     * @example
     * // Delete one Asset
     * const Asset = await prisma.asset.delete({
     *   where: {
     *     // ... filter to delete one Asset
     *   }
     * })
     * 
     */
    delete<T extends AssetDeleteArgs>(args: SelectSubset<T, AssetDeleteArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Asset.
     * @param {AssetUpdateArgs} args - Arguments to update one Asset.
     * @example
     * // Update one Asset
     * const asset = await prisma.asset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetUpdateArgs>(args: SelectSubset<T, AssetUpdateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Assets.
     * @param {AssetDeleteManyArgs} args - Arguments to filter Assets to delete.
     * @example
     * // Delete a few Assets
     * const { count } = await prisma.asset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetDeleteManyArgs>(args?: SelectSubset<T, AssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetUpdateManyArgs>(args: SelectSubset<T, AssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets and returns the data updated in the database.
     * @param {AssetUpdateManyAndReturnArgs} args - Arguments to update many Assets.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AssetUpdateManyAndReturnArgs>(args: SelectSubset<T, AssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Asset.
     * @param {AssetUpsertArgs} args - Arguments to update or create a Asset.
     * @example
     * // Update or create a Asset
     * const asset = await prisma.asset.upsert({
     *   create: {
     *     // ... data to create a Asset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Asset we want to update
     *   }
     * })
     */
    upsert<T extends AssetUpsertArgs>(args: SelectSubset<T, AssetUpsertArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCountArgs} args - Arguments to filter Assets to count.
     * @example
     * // Count the number of Assets
     * const count = await prisma.asset.count({
     *   where: {
     *     // ... the filter for the Assets we want to count
     *   }
     * })
    **/
    count<T extends AssetCountArgs>(
      args?: Subset<T, AssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAggregateArgs>(args: Subset<T, AssetAggregateArgs>): Prisma.PrismaPromise<GetAssetAggregateType<T>>

    /**
     * Group by Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetGroupByArgs['orderBy'] }
        : { orderBy?: AssetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Asset model
   */
  readonly fields: AssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Asset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Asset model
   */
  interface AssetFieldRefs {
    readonly id: FieldRef<"Asset", 'String'>
    readonly fileName: FieldRef<"Asset", 'String'>
    readonly url: FieldRef<"Asset", 'String'>
    readonly key: FieldRef<"Asset", 'String'>
    readonly storageProvider: FieldRef<"Asset", 'String'>
    readonly mimeType: FieldRef<"Asset", 'String'>
    readonly size: FieldRef<"Asset", 'Int'>
    readonly category: FieldRef<"Asset", 'String'>
    readonly uploadedBy: FieldRef<"Asset", 'String'>
    readonly createdAt: FieldRef<"Asset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Asset findUnique
   */
  export type AssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findUniqueOrThrow
   */
  export type AssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findFirst
   */
  export type AssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findFirstOrThrow
   */
  export type AssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findMany
   */
  export type AssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter, which Assets to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset create
   */
  export type AssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data needed to create a Asset.
     */
    data: XOR<AssetCreateInput, AssetUncheckedCreateInput>
  }

  /**
   * Asset createMany
   */
  export type AssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset createManyAndReturn
   */
  export type AssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset update
   */
  export type AssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data needed to update a Asset.
     */
    data: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
    /**
     * Choose, which Asset to update.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset updateMany
   */
  export type AssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
  }

  /**
   * Asset updateManyAndReturn
   */
  export type AssetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
  }

  /**
   * Asset upsert
   */
  export type AssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The filter to search for the Asset to update in case it exists.
     */
    where: AssetWhereUniqueInput
    /**
     * In case the Asset found by the `where` argument doesn't exist, create a new Asset with this data.
     */
    create: XOR<AssetCreateInput, AssetUncheckedCreateInput>
    /**
     * In case the Asset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
  }

  /**
   * Asset delete
   */
  export type AssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Filter which Asset to delete.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset deleteMany
   */
  export type AssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assets to delete
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to delete.
     */
    limit?: number
  }

  /**
   * Asset without action
   */
  export type AssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
  }


  /**
   * Model AppConfig
   */

  export type AggregateAppConfig = {
    _count: AppConfigCountAggregateOutputType | null
    _avg: AppConfigAvgAggregateOutputType | null
    _sum: AppConfigSumAggregateOutputType | null
    _min: AppConfigMinAggregateOutputType | null
    _max: AppConfigMaxAggregateOutputType | null
  }

  export type AppConfigAvgAggregateOutputType = {
    id: number | null
  }

  export type AppConfigSumAggregateOutputType = {
    id: number | null
  }

  export type AppConfigMinAggregateOutputType = {
    id: number | null
    key: string | null
    label: string | null
    updatedAt: Date | null
  }

  export type AppConfigMaxAggregateOutputType = {
    id: number | null
    key: string | null
    label: string | null
    updatedAt: Date | null
  }

  export type AppConfigCountAggregateOutputType = {
    id: number
    key: number
    value: number
    label: number
    updatedAt: number
    _all: number
  }


  export type AppConfigAvgAggregateInputType = {
    id?: true
  }

  export type AppConfigSumAggregateInputType = {
    id?: true
  }

  export type AppConfigMinAggregateInputType = {
    id?: true
    key?: true
    label?: true
    updatedAt?: true
  }

  export type AppConfigMaxAggregateInputType = {
    id?: true
    key?: true
    label?: true
    updatedAt?: true
  }

  export type AppConfigCountAggregateInputType = {
    id?: true
    key?: true
    value?: true
    label?: true
    updatedAt?: true
    _all?: true
  }

  export type AppConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppConfig to aggregate.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppConfigs
    **/
    _count?: true | AppConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppConfigMaxAggregateInputType
  }

  export type GetAppConfigAggregateType<T extends AppConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateAppConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppConfig[P]>
      : GetScalarType<T[P], AggregateAppConfig[P]>
  }




  export type AppConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppConfigWhereInput
    orderBy?: AppConfigOrderByWithAggregationInput | AppConfigOrderByWithAggregationInput[]
    by: AppConfigScalarFieldEnum[] | AppConfigScalarFieldEnum
    having?: AppConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppConfigCountAggregateInputType | true
    _avg?: AppConfigAvgAggregateInputType
    _sum?: AppConfigSumAggregateInputType
    _min?: AppConfigMinAggregateInputType
    _max?: AppConfigMaxAggregateInputType
  }

  export type AppConfigGroupByOutputType = {
    id: number
    key: string
    value: JsonValue
    label: string | null
    updatedAt: Date
    _count: AppConfigCountAggregateOutputType | null
    _avg: AppConfigAvgAggregateOutputType | null
    _sum: AppConfigSumAggregateOutputType | null
    _min: AppConfigMinAggregateOutputType | null
    _max: AppConfigMaxAggregateOutputType | null
  }

  type GetAppConfigGroupByPayload<T extends AppConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppConfigGroupByOutputType[P]>
            : GetScalarType<T[P], AppConfigGroupByOutputType[P]>
        }
      >
    >


  export type AppConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    label?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appConfig"]>

  export type AppConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    label?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appConfig"]>

  export type AppConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    label?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appConfig"]>

  export type AppConfigSelectScalar = {
    id?: boolean
    key?: boolean
    value?: boolean
    label?: boolean
    updatedAt?: boolean
  }

  export type AppConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "value" | "label" | "updatedAt", ExtArgs["result"]["appConfig"]>

  export type $AppConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      key: string
      value: Prisma.JsonValue
      label: string | null
      updatedAt: Date
    }, ExtArgs["result"]["appConfig"]>
    composites: {}
  }

  type AppConfigGetPayload<S extends boolean | null | undefined | AppConfigDefaultArgs> = $Result.GetResult<Prisma.$AppConfigPayload, S>

  type AppConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppConfigCountAggregateInputType | true
    }

  export interface AppConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppConfig'], meta: { name: 'AppConfig' } }
    /**
     * Find zero or one AppConfig that matches the filter.
     * @param {AppConfigFindUniqueArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppConfigFindUniqueArgs>(args: SelectSubset<T, AppConfigFindUniqueArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AppConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppConfigFindUniqueOrThrowArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, AppConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindFirstArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppConfigFindFirstArgs>(args?: SelectSubset<T, AppConfigFindFirstArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindFirstOrThrowArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, AppConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AppConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppConfigs
     * const appConfigs = await prisma.appConfig.findMany()
     * 
     * // Get first 10 AppConfigs
     * const appConfigs = await prisma.appConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appConfigWithIdOnly = await prisma.appConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppConfigFindManyArgs>(args?: SelectSubset<T, AppConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AppConfig.
     * @param {AppConfigCreateArgs} args - Arguments to create a AppConfig.
     * @example
     * // Create one AppConfig
     * const AppConfig = await prisma.appConfig.create({
     *   data: {
     *     // ... data to create a AppConfig
     *   }
     * })
     * 
     */
    create<T extends AppConfigCreateArgs>(args: SelectSubset<T, AppConfigCreateArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AppConfigs.
     * @param {AppConfigCreateManyArgs} args - Arguments to create many AppConfigs.
     * @example
     * // Create many AppConfigs
     * const appConfig = await prisma.appConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppConfigCreateManyArgs>(args?: SelectSubset<T, AppConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppConfigs and returns the data saved in the database.
     * @param {AppConfigCreateManyAndReturnArgs} args - Arguments to create many AppConfigs.
     * @example
     * // Create many AppConfigs
     * const appConfig = await prisma.appConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppConfigs and only return the `id`
     * const appConfigWithIdOnly = await prisma.appConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, AppConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AppConfig.
     * @param {AppConfigDeleteArgs} args - Arguments to delete one AppConfig.
     * @example
     * // Delete one AppConfig
     * const AppConfig = await prisma.appConfig.delete({
     *   where: {
     *     // ... filter to delete one AppConfig
     *   }
     * })
     * 
     */
    delete<T extends AppConfigDeleteArgs>(args: SelectSubset<T, AppConfigDeleteArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AppConfig.
     * @param {AppConfigUpdateArgs} args - Arguments to update one AppConfig.
     * @example
     * // Update one AppConfig
     * const appConfig = await prisma.appConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppConfigUpdateArgs>(args: SelectSubset<T, AppConfigUpdateArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AppConfigs.
     * @param {AppConfigDeleteManyArgs} args - Arguments to filter AppConfigs to delete.
     * @example
     * // Delete a few AppConfigs
     * const { count } = await prisma.appConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppConfigDeleteManyArgs>(args?: SelectSubset<T, AppConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppConfigs
     * const appConfig = await prisma.appConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppConfigUpdateManyArgs>(args: SelectSubset<T, AppConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppConfigs and returns the data updated in the database.
     * @param {AppConfigUpdateManyAndReturnArgs} args - Arguments to update many AppConfigs.
     * @example
     * // Update many AppConfigs
     * const appConfig = await prisma.appConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AppConfigs and only return the `id`
     * const appConfigWithIdOnly = await prisma.appConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, AppConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AppConfig.
     * @param {AppConfigUpsertArgs} args - Arguments to update or create a AppConfig.
     * @example
     * // Update or create a AppConfig
     * const appConfig = await prisma.appConfig.upsert({
     *   create: {
     *     // ... data to create a AppConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppConfig we want to update
     *   }
     * })
     */
    upsert<T extends AppConfigUpsertArgs>(args: SelectSubset<T, AppConfigUpsertArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigCountArgs} args - Arguments to filter AppConfigs to count.
     * @example
     * // Count the number of AppConfigs
     * const count = await prisma.appConfig.count({
     *   where: {
     *     // ... the filter for the AppConfigs we want to count
     *   }
     * })
    **/
    count<T extends AppConfigCountArgs>(
      args?: Subset<T, AppConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppConfigAggregateArgs>(args: Subset<T, AppConfigAggregateArgs>): Prisma.PrismaPromise<GetAppConfigAggregateType<T>>

    /**
     * Group by AppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppConfigGroupByArgs['orderBy'] }
        : { orderBy?: AppConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppConfig model
   */
  readonly fields: AppConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppConfig model
   */
  interface AppConfigFieldRefs {
    readonly id: FieldRef<"AppConfig", 'Int'>
    readonly key: FieldRef<"AppConfig", 'String'>
    readonly value: FieldRef<"AppConfig", 'Json'>
    readonly label: FieldRef<"AppConfig", 'String'>
    readonly updatedAt: FieldRef<"AppConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppConfig findUnique
   */
  export type AppConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig findUniqueOrThrow
   */
  export type AppConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig findFirst
   */
  export type AppConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppConfigs.
     */
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig findFirstOrThrow
   */
  export type AppConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppConfigs.
     */
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig findMany
   */
  export type AppConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter, which AppConfigs to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig create
   */
  export type AppConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a AppConfig.
     */
    data: XOR<AppConfigCreateInput, AppConfigUncheckedCreateInput>
  }

  /**
   * AppConfig createMany
   */
  export type AppConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppConfigs.
     */
    data: AppConfigCreateManyInput | AppConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppConfig createManyAndReturn
   */
  export type AppConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * The data used to create many AppConfigs.
     */
    data: AppConfigCreateManyInput | AppConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppConfig update
   */
  export type AppConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a AppConfig.
     */
    data: XOR<AppConfigUpdateInput, AppConfigUncheckedUpdateInput>
    /**
     * Choose, which AppConfig to update.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig updateMany
   */
  export type AppConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppConfigs.
     */
    data: XOR<AppConfigUpdateManyMutationInput, AppConfigUncheckedUpdateManyInput>
    /**
     * Filter which AppConfigs to update
     */
    where?: AppConfigWhereInput
    /**
     * Limit how many AppConfigs to update.
     */
    limit?: number
  }

  /**
   * AppConfig updateManyAndReturn
   */
  export type AppConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * The data used to update AppConfigs.
     */
    data: XOR<AppConfigUpdateManyMutationInput, AppConfigUncheckedUpdateManyInput>
    /**
     * Filter which AppConfigs to update
     */
    where?: AppConfigWhereInput
    /**
     * Limit how many AppConfigs to update.
     */
    limit?: number
  }

  /**
   * AppConfig upsert
   */
  export type AppConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the AppConfig to update in case it exists.
     */
    where: AppConfigWhereUniqueInput
    /**
     * In case the AppConfig found by the `where` argument doesn't exist, create a new AppConfig with this data.
     */
    create: XOR<AppConfigCreateInput, AppConfigUncheckedCreateInput>
    /**
     * In case the AppConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppConfigUpdateInput, AppConfigUncheckedUpdateInput>
  }

  /**
   * AppConfig delete
   */
  export type AppConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
    /**
     * Filter which AppConfig to delete.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig deleteMany
   */
  export type AppConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppConfigs to delete
     */
    where?: AppConfigWhereInput
    /**
     * Limit how many AppConfigs to delete.
     */
    limit?: number
  }

  /**
   * AppConfig without action
   */
  export type AppConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppConfig
     */
    omit?: AppConfigOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    googleId: 'googleId',
    avatarUrl: 'avatarUrl',
    tier: 'tier',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const GymExerciseMasterScalarFieldEnum: {
    id: 'id',
    isActive: 'isActive',
    name: 'name',
    vietnameseName: 'vietnameseName',
    targetMuscleGroup: 'targetMuscleGroup',
    secondaryMuscleGroups: 'secondaryMuscleGroups',
    youtubeEmbedUrl: 'youtubeEmbedUrl',
    gifUrl: 'gifUrl',
    garminExerciseEnum: 'garminExerciseEnum',
    instructions: 'instructions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GymExerciseMasterScalarFieldEnum = (typeof GymExerciseMasterScalarFieldEnum)[keyof typeof GymExerciseMasterScalarFieldEnum]


  export const RunningExerciseMasterScalarFieldEnum: {
    id: 'id',
    isActive: 'isActive',
    name: 'name',
    vietnameseName: 'vietnameseName',
    runningType: 'runningType',
    youtubeEmbedUrl: 'youtubeEmbedUrl',
    gifUrl: 'gifUrl',
    instructions: 'instructions',
    workoutStructure: 'workoutStructure',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RunningExerciseMasterScalarFieldEnum = (typeof RunningExerciseMasterScalarFieldEnum)[keyof typeof RunningExerciseMasterScalarFieldEnum]


  export const PrivateExerciseScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    isActive: 'isActive',
    sportType: 'sportType',
    name: 'name',
    targetMuscleGroup: 'targetMuscleGroup',
    runningType: 'runningType',
    customNotes: 'customNotes',
    gifUrl: 'gifUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PrivateExerciseScalarFieldEnum = (typeof PrivateExerciseScalarFieldEnum)[keyof typeof PrivateExerciseScalarFieldEnum]


  export const DailyScheduleScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    dateString: 'dateString',
    weekNumber: 'weekNumber',
    year: 'year',
    dayStatus: 'dayStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DailyScheduleScalarFieldEnum = (typeof DailyScheduleScalarFieldEnum)[keyof typeof DailyScheduleScalarFieldEnum]


  export const ScheduleItemScalarFieldEnum: {
    id: 'id',
    scheduleId: 'scheduleId',
    sequenceOrder: 'sequenceOrder',
    sportType: 'sportType',
    isPrivateExercise: 'isPrivateExercise',
    gymMasterId: 'gymMasterId',
    runningMasterId: 'runningMasterId',
    privateExerciseId: 'privateExerciseId',
    gymPayload: 'gymPayload',
    runningPayload: 'runningPayload',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ScheduleItemScalarFieldEnum = (typeof ScheduleItemScalarFieldEnum)[keyof typeof ScheduleItemScalarFieldEnum]


  export const BlogPostScalarFieldEnum: {
    id: 'id',
    title: 'title',
    slug: 'slug',
    excerpt: 'excerpt',
    content: 'content',
    coverImage: 'coverImage',
    tags: 'tags',
    categoryKey: 'categoryKey',
    status: 'status',
    readingTime: 'readingTime',
    publishedAt: 'publishedAt',
    authorId: 'authorId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BlogPostScalarFieldEnum = (typeof BlogPostScalarFieldEnum)[keyof typeof BlogPostScalarFieldEnum]


  export const BlogCategoryScalarFieldEnum: {
    id: 'id',
    key: 'key',
    label: 'label',
    description: 'description',
    imageUrl: 'imageUrl',
    isActive: 'isActive',
    order: 'order',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BlogCategoryScalarFieldEnum = (typeof BlogCategoryScalarFieldEnum)[keyof typeof BlogCategoryScalarFieldEnum]


  export const AssetScalarFieldEnum: {
    id: 'id',
    fileName: 'fileName',
    url: 'url',
    key: 'key',
    storageProvider: 'storageProvider',
    mimeType: 'mimeType',
    size: 'size',
    category: 'category',
    uploadedBy: 'uploadedBy',
    createdAt: 'createdAt'
  };

  export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum]


  export const AppConfigScalarFieldEnum: {
    id: 'id',
    key: 'key',
    value: 'value',
    label: 'label',
    updatedAt: 'updatedAt'
  };

  export type AppConfigScalarFieldEnum = (typeof AppConfigScalarFieldEnum)[keyof typeof AppConfigScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserTier'
   */
  export type EnumUserTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserTier'>
    


  /**
   * Reference to a field of type 'UserTier[]'
   */
  export type ListEnumUserTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserTier[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'MuscleGroup'
   */
  export type EnumMuscleGroupFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MuscleGroup'>
    


  /**
   * Reference to a field of type 'MuscleGroup[]'
   */
  export type ListEnumMuscleGroupFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MuscleGroup[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'RunningType'
   */
  export type EnumRunningTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RunningType'>
    


  /**
   * Reference to a field of type 'RunningType[]'
   */
  export type ListEnumRunningTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RunningType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DayStatus'
   */
  export type EnumDayStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DayStatus'>
    


  /**
   * Reference to a field of type 'DayStatus[]'
   */
  export type ListEnumDayStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DayStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    googleId?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    tier?: EnumUserTierFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    privateExercises?: PrivateExerciseListRelationFilter
    dailySchedules?: DailyScheduleListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    googleId?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    tier?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    privateExercises?: PrivateExerciseOrderByRelationAggregateInput
    dailySchedules?: DailyScheduleOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    googleId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    tier?: EnumUserTierFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    privateExercises?: PrivateExerciseListRelationFilter
    dailySchedules?: DailyScheduleListRelationFilter
  }, "id" | "email" | "googleId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    googleId?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    tier?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    googleId?: StringNullableWithAggregatesFilter<"User"> | string | null
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    tier?: EnumUserTierWithAggregatesFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type GymExerciseMasterWhereInput = {
    AND?: GymExerciseMasterWhereInput | GymExerciseMasterWhereInput[]
    OR?: GymExerciseMasterWhereInput[]
    NOT?: GymExerciseMasterWhereInput | GymExerciseMasterWhereInput[]
    id?: StringFilter<"GymExerciseMaster"> | string
    isActive?: BoolFilter<"GymExerciseMaster"> | boolean
    name?: StringFilter<"GymExerciseMaster"> | string
    vietnameseName?: StringFilter<"GymExerciseMaster"> | string
    targetMuscleGroup?: EnumMuscleGroupFilter<"GymExerciseMaster"> | $Enums.MuscleGroup
    secondaryMuscleGroups?: StringNullableListFilter<"GymExerciseMaster">
    youtubeEmbedUrl?: StringNullableFilter<"GymExerciseMaster"> | string | null
    gifUrl?: StringNullableFilter<"GymExerciseMaster"> | string | null
    garminExerciseEnum?: StringNullableFilter<"GymExerciseMaster"> | string | null
    instructions?: JsonFilter<"GymExerciseMaster">
    createdAt?: DateTimeFilter<"GymExerciseMaster"> | Date | string
    updatedAt?: DateTimeFilter<"GymExerciseMaster"> | Date | string
    scheduleItems?: ScheduleItemListRelationFilter
  }

  export type GymExerciseMasterOrderByWithRelationInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    targetMuscleGroup?: SortOrder
    secondaryMuscleGroups?: SortOrder
    youtubeEmbedUrl?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    garminExerciseEnum?: SortOrderInput | SortOrder
    instructions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    scheduleItems?: ScheduleItemOrderByRelationAggregateInput
  }

  export type GymExerciseMasterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GymExerciseMasterWhereInput | GymExerciseMasterWhereInput[]
    OR?: GymExerciseMasterWhereInput[]
    NOT?: GymExerciseMasterWhereInput | GymExerciseMasterWhereInput[]
    isActive?: BoolFilter<"GymExerciseMaster"> | boolean
    name?: StringFilter<"GymExerciseMaster"> | string
    vietnameseName?: StringFilter<"GymExerciseMaster"> | string
    targetMuscleGroup?: EnumMuscleGroupFilter<"GymExerciseMaster"> | $Enums.MuscleGroup
    secondaryMuscleGroups?: StringNullableListFilter<"GymExerciseMaster">
    youtubeEmbedUrl?: StringNullableFilter<"GymExerciseMaster"> | string | null
    gifUrl?: StringNullableFilter<"GymExerciseMaster"> | string | null
    garminExerciseEnum?: StringNullableFilter<"GymExerciseMaster"> | string | null
    instructions?: JsonFilter<"GymExerciseMaster">
    createdAt?: DateTimeFilter<"GymExerciseMaster"> | Date | string
    updatedAt?: DateTimeFilter<"GymExerciseMaster"> | Date | string
    scheduleItems?: ScheduleItemListRelationFilter
  }, "id">

  export type GymExerciseMasterOrderByWithAggregationInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    targetMuscleGroup?: SortOrder
    secondaryMuscleGroups?: SortOrder
    youtubeEmbedUrl?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    garminExerciseEnum?: SortOrderInput | SortOrder
    instructions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GymExerciseMasterCountOrderByAggregateInput
    _max?: GymExerciseMasterMaxOrderByAggregateInput
    _min?: GymExerciseMasterMinOrderByAggregateInput
  }

  export type GymExerciseMasterScalarWhereWithAggregatesInput = {
    AND?: GymExerciseMasterScalarWhereWithAggregatesInput | GymExerciseMasterScalarWhereWithAggregatesInput[]
    OR?: GymExerciseMasterScalarWhereWithAggregatesInput[]
    NOT?: GymExerciseMasterScalarWhereWithAggregatesInput | GymExerciseMasterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GymExerciseMaster"> | string
    isActive?: BoolWithAggregatesFilter<"GymExerciseMaster"> | boolean
    name?: StringWithAggregatesFilter<"GymExerciseMaster"> | string
    vietnameseName?: StringWithAggregatesFilter<"GymExerciseMaster"> | string
    targetMuscleGroup?: EnumMuscleGroupWithAggregatesFilter<"GymExerciseMaster"> | $Enums.MuscleGroup
    secondaryMuscleGroups?: StringNullableListFilter<"GymExerciseMaster">
    youtubeEmbedUrl?: StringNullableWithAggregatesFilter<"GymExerciseMaster"> | string | null
    gifUrl?: StringNullableWithAggregatesFilter<"GymExerciseMaster"> | string | null
    garminExerciseEnum?: StringNullableWithAggregatesFilter<"GymExerciseMaster"> | string | null
    instructions?: JsonWithAggregatesFilter<"GymExerciseMaster">
    createdAt?: DateTimeWithAggregatesFilter<"GymExerciseMaster"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GymExerciseMaster"> | Date | string
  }

  export type RunningExerciseMasterWhereInput = {
    AND?: RunningExerciseMasterWhereInput | RunningExerciseMasterWhereInput[]
    OR?: RunningExerciseMasterWhereInput[]
    NOT?: RunningExerciseMasterWhereInput | RunningExerciseMasterWhereInput[]
    id?: StringFilter<"RunningExerciseMaster"> | string
    isActive?: BoolFilter<"RunningExerciseMaster"> | boolean
    name?: StringFilter<"RunningExerciseMaster"> | string
    vietnameseName?: StringFilter<"RunningExerciseMaster"> | string
    runningType?: EnumRunningTypeFilter<"RunningExerciseMaster"> | $Enums.RunningType
    youtubeEmbedUrl?: StringNullableFilter<"RunningExerciseMaster"> | string | null
    gifUrl?: StringNullableFilter<"RunningExerciseMaster"> | string | null
    instructions?: JsonFilter<"RunningExerciseMaster">
    workoutStructure?: JsonFilter<"RunningExerciseMaster">
    createdAt?: DateTimeFilter<"RunningExerciseMaster"> | Date | string
    updatedAt?: DateTimeFilter<"RunningExerciseMaster"> | Date | string
    scheduleItems?: ScheduleItemListRelationFilter
  }

  export type RunningExerciseMasterOrderByWithRelationInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    runningType?: SortOrder
    youtubeEmbedUrl?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    instructions?: SortOrder
    workoutStructure?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    scheduleItems?: ScheduleItemOrderByRelationAggregateInput
  }

  export type RunningExerciseMasterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RunningExerciseMasterWhereInput | RunningExerciseMasterWhereInput[]
    OR?: RunningExerciseMasterWhereInput[]
    NOT?: RunningExerciseMasterWhereInput | RunningExerciseMasterWhereInput[]
    isActive?: BoolFilter<"RunningExerciseMaster"> | boolean
    name?: StringFilter<"RunningExerciseMaster"> | string
    vietnameseName?: StringFilter<"RunningExerciseMaster"> | string
    runningType?: EnumRunningTypeFilter<"RunningExerciseMaster"> | $Enums.RunningType
    youtubeEmbedUrl?: StringNullableFilter<"RunningExerciseMaster"> | string | null
    gifUrl?: StringNullableFilter<"RunningExerciseMaster"> | string | null
    instructions?: JsonFilter<"RunningExerciseMaster">
    workoutStructure?: JsonFilter<"RunningExerciseMaster">
    createdAt?: DateTimeFilter<"RunningExerciseMaster"> | Date | string
    updatedAt?: DateTimeFilter<"RunningExerciseMaster"> | Date | string
    scheduleItems?: ScheduleItemListRelationFilter
  }, "id">

  export type RunningExerciseMasterOrderByWithAggregationInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    runningType?: SortOrder
    youtubeEmbedUrl?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    instructions?: SortOrder
    workoutStructure?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RunningExerciseMasterCountOrderByAggregateInput
    _max?: RunningExerciseMasterMaxOrderByAggregateInput
    _min?: RunningExerciseMasterMinOrderByAggregateInput
  }

  export type RunningExerciseMasterScalarWhereWithAggregatesInput = {
    AND?: RunningExerciseMasterScalarWhereWithAggregatesInput | RunningExerciseMasterScalarWhereWithAggregatesInput[]
    OR?: RunningExerciseMasterScalarWhereWithAggregatesInput[]
    NOT?: RunningExerciseMasterScalarWhereWithAggregatesInput | RunningExerciseMasterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RunningExerciseMaster"> | string
    isActive?: BoolWithAggregatesFilter<"RunningExerciseMaster"> | boolean
    name?: StringWithAggregatesFilter<"RunningExerciseMaster"> | string
    vietnameseName?: StringWithAggregatesFilter<"RunningExerciseMaster"> | string
    runningType?: EnumRunningTypeWithAggregatesFilter<"RunningExerciseMaster"> | $Enums.RunningType
    youtubeEmbedUrl?: StringNullableWithAggregatesFilter<"RunningExerciseMaster"> | string | null
    gifUrl?: StringNullableWithAggregatesFilter<"RunningExerciseMaster"> | string | null
    instructions?: JsonWithAggregatesFilter<"RunningExerciseMaster">
    workoutStructure?: JsonWithAggregatesFilter<"RunningExerciseMaster">
    createdAt?: DateTimeWithAggregatesFilter<"RunningExerciseMaster"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RunningExerciseMaster"> | Date | string
  }

  export type PrivateExerciseWhereInput = {
    AND?: PrivateExerciseWhereInput | PrivateExerciseWhereInput[]
    OR?: PrivateExerciseWhereInput[]
    NOT?: PrivateExerciseWhereInput | PrivateExerciseWhereInput[]
    id?: StringFilter<"PrivateExercise"> | string
    userId?: StringFilter<"PrivateExercise"> | string
    isActive?: BoolFilter<"PrivateExercise"> | boolean
    sportType?: StringFilter<"PrivateExercise"> | string
    name?: StringFilter<"PrivateExercise"> | string
    targetMuscleGroup?: EnumMuscleGroupNullableFilter<"PrivateExercise"> | $Enums.MuscleGroup | null
    runningType?: EnumRunningTypeNullableFilter<"PrivateExercise"> | $Enums.RunningType | null
    customNotes?: StringNullableFilter<"PrivateExercise"> | string | null
    gifUrl?: StringNullableFilter<"PrivateExercise"> | string | null
    createdAt?: DateTimeFilter<"PrivateExercise"> | Date | string
    updatedAt?: DateTimeFilter<"PrivateExercise"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    scheduleItems?: ScheduleItemListRelationFilter
  }

  export type PrivateExerciseOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    isActive?: SortOrder
    sportType?: SortOrder
    name?: SortOrder
    targetMuscleGroup?: SortOrderInput | SortOrder
    runningType?: SortOrderInput | SortOrder
    customNotes?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    scheduleItems?: ScheduleItemOrderByRelationAggregateInput
  }

  export type PrivateExerciseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PrivateExerciseWhereInput | PrivateExerciseWhereInput[]
    OR?: PrivateExerciseWhereInput[]
    NOT?: PrivateExerciseWhereInput | PrivateExerciseWhereInput[]
    userId?: StringFilter<"PrivateExercise"> | string
    isActive?: BoolFilter<"PrivateExercise"> | boolean
    sportType?: StringFilter<"PrivateExercise"> | string
    name?: StringFilter<"PrivateExercise"> | string
    targetMuscleGroup?: EnumMuscleGroupNullableFilter<"PrivateExercise"> | $Enums.MuscleGroup | null
    runningType?: EnumRunningTypeNullableFilter<"PrivateExercise"> | $Enums.RunningType | null
    customNotes?: StringNullableFilter<"PrivateExercise"> | string | null
    gifUrl?: StringNullableFilter<"PrivateExercise"> | string | null
    createdAt?: DateTimeFilter<"PrivateExercise"> | Date | string
    updatedAt?: DateTimeFilter<"PrivateExercise"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    scheduleItems?: ScheduleItemListRelationFilter
  }, "id">

  export type PrivateExerciseOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    isActive?: SortOrder
    sportType?: SortOrder
    name?: SortOrder
    targetMuscleGroup?: SortOrderInput | SortOrder
    runningType?: SortOrderInput | SortOrder
    customNotes?: SortOrderInput | SortOrder
    gifUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PrivateExerciseCountOrderByAggregateInput
    _max?: PrivateExerciseMaxOrderByAggregateInput
    _min?: PrivateExerciseMinOrderByAggregateInput
  }

  export type PrivateExerciseScalarWhereWithAggregatesInput = {
    AND?: PrivateExerciseScalarWhereWithAggregatesInput | PrivateExerciseScalarWhereWithAggregatesInput[]
    OR?: PrivateExerciseScalarWhereWithAggregatesInput[]
    NOT?: PrivateExerciseScalarWhereWithAggregatesInput | PrivateExerciseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PrivateExercise"> | string
    userId?: StringWithAggregatesFilter<"PrivateExercise"> | string
    isActive?: BoolWithAggregatesFilter<"PrivateExercise"> | boolean
    sportType?: StringWithAggregatesFilter<"PrivateExercise"> | string
    name?: StringWithAggregatesFilter<"PrivateExercise"> | string
    targetMuscleGroup?: EnumMuscleGroupNullableWithAggregatesFilter<"PrivateExercise"> | $Enums.MuscleGroup | null
    runningType?: EnumRunningTypeNullableWithAggregatesFilter<"PrivateExercise"> | $Enums.RunningType | null
    customNotes?: StringNullableWithAggregatesFilter<"PrivateExercise"> | string | null
    gifUrl?: StringNullableWithAggregatesFilter<"PrivateExercise"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PrivateExercise"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PrivateExercise"> | Date | string
  }

  export type DailyScheduleWhereInput = {
    AND?: DailyScheduleWhereInput | DailyScheduleWhereInput[]
    OR?: DailyScheduleWhereInput[]
    NOT?: DailyScheduleWhereInput | DailyScheduleWhereInput[]
    id?: StringFilter<"DailySchedule"> | string
    userId?: StringFilter<"DailySchedule"> | string
    dateString?: StringFilter<"DailySchedule"> | string
    weekNumber?: IntFilter<"DailySchedule"> | number
    year?: IntFilter<"DailySchedule"> | number
    dayStatus?: EnumDayStatusFilter<"DailySchedule"> | $Enums.DayStatus
    createdAt?: DateTimeFilter<"DailySchedule"> | Date | string
    updatedAt?: DateTimeFilter<"DailySchedule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: ScheduleItemListRelationFilter
  }

  export type DailyScheduleOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    dateString?: SortOrder
    weekNumber?: SortOrder
    year?: SortOrder
    dayStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    items?: ScheduleItemOrderByRelationAggregateInput
  }

  export type DailyScheduleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_dateString?: DailyScheduleUserIdDateStringCompoundUniqueInput
    AND?: DailyScheduleWhereInput | DailyScheduleWhereInput[]
    OR?: DailyScheduleWhereInput[]
    NOT?: DailyScheduleWhereInput | DailyScheduleWhereInput[]
    userId?: StringFilter<"DailySchedule"> | string
    dateString?: StringFilter<"DailySchedule"> | string
    weekNumber?: IntFilter<"DailySchedule"> | number
    year?: IntFilter<"DailySchedule"> | number
    dayStatus?: EnumDayStatusFilter<"DailySchedule"> | $Enums.DayStatus
    createdAt?: DateTimeFilter<"DailySchedule"> | Date | string
    updatedAt?: DateTimeFilter<"DailySchedule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: ScheduleItemListRelationFilter
  }, "id" | "userId_dateString">

  export type DailyScheduleOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    dateString?: SortOrder
    weekNumber?: SortOrder
    year?: SortOrder
    dayStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DailyScheduleCountOrderByAggregateInput
    _avg?: DailyScheduleAvgOrderByAggregateInput
    _max?: DailyScheduleMaxOrderByAggregateInput
    _min?: DailyScheduleMinOrderByAggregateInput
    _sum?: DailyScheduleSumOrderByAggregateInput
  }

  export type DailyScheduleScalarWhereWithAggregatesInput = {
    AND?: DailyScheduleScalarWhereWithAggregatesInput | DailyScheduleScalarWhereWithAggregatesInput[]
    OR?: DailyScheduleScalarWhereWithAggregatesInput[]
    NOT?: DailyScheduleScalarWhereWithAggregatesInput | DailyScheduleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailySchedule"> | string
    userId?: StringWithAggregatesFilter<"DailySchedule"> | string
    dateString?: StringWithAggregatesFilter<"DailySchedule"> | string
    weekNumber?: IntWithAggregatesFilter<"DailySchedule"> | number
    year?: IntWithAggregatesFilter<"DailySchedule"> | number
    dayStatus?: EnumDayStatusWithAggregatesFilter<"DailySchedule"> | $Enums.DayStatus
    createdAt?: DateTimeWithAggregatesFilter<"DailySchedule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DailySchedule"> | Date | string
  }

  export type ScheduleItemWhereInput = {
    AND?: ScheduleItemWhereInput | ScheduleItemWhereInput[]
    OR?: ScheduleItemWhereInput[]
    NOT?: ScheduleItemWhereInput | ScheduleItemWhereInput[]
    id?: StringFilter<"ScheduleItem"> | string
    scheduleId?: StringFilter<"ScheduleItem"> | string
    sequenceOrder?: IntFilter<"ScheduleItem"> | number
    sportType?: StringFilter<"ScheduleItem"> | string
    isPrivateExercise?: BoolFilter<"ScheduleItem"> | boolean
    gymMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    runningMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    privateExerciseId?: StringNullableFilter<"ScheduleItem"> | string | null
    gymPayload?: JsonNullableFilter<"ScheduleItem">
    runningPayload?: JsonNullableFilter<"ScheduleItem">
    createdAt?: DateTimeFilter<"ScheduleItem"> | Date | string
    updatedAt?: DateTimeFilter<"ScheduleItem"> | Date | string
    schedule?: XOR<DailyScheduleScalarRelationFilter, DailyScheduleWhereInput>
    gymMaster?: XOR<GymExerciseMasterNullableScalarRelationFilter, GymExerciseMasterWhereInput> | null
    runningMaster?: XOR<RunningExerciseMasterNullableScalarRelationFilter, RunningExerciseMasterWhereInput> | null
    privateExercise?: XOR<PrivateExerciseNullableScalarRelationFilter, PrivateExerciseWhereInput> | null
  }

  export type ScheduleItemOrderByWithRelationInput = {
    id?: SortOrder
    scheduleId?: SortOrder
    sequenceOrder?: SortOrder
    sportType?: SortOrder
    isPrivateExercise?: SortOrder
    gymMasterId?: SortOrderInput | SortOrder
    runningMasterId?: SortOrderInput | SortOrder
    privateExerciseId?: SortOrderInput | SortOrder
    gymPayload?: SortOrderInput | SortOrder
    runningPayload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schedule?: DailyScheduleOrderByWithRelationInput
    gymMaster?: GymExerciseMasterOrderByWithRelationInput
    runningMaster?: RunningExerciseMasterOrderByWithRelationInput
    privateExercise?: PrivateExerciseOrderByWithRelationInput
  }

  export type ScheduleItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScheduleItemWhereInput | ScheduleItemWhereInput[]
    OR?: ScheduleItemWhereInput[]
    NOT?: ScheduleItemWhereInput | ScheduleItemWhereInput[]
    scheduleId?: StringFilter<"ScheduleItem"> | string
    sequenceOrder?: IntFilter<"ScheduleItem"> | number
    sportType?: StringFilter<"ScheduleItem"> | string
    isPrivateExercise?: BoolFilter<"ScheduleItem"> | boolean
    gymMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    runningMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    privateExerciseId?: StringNullableFilter<"ScheduleItem"> | string | null
    gymPayload?: JsonNullableFilter<"ScheduleItem">
    runningPayload?: JsonNullableFilter<"ScheduleItem">
    createdAt?: DateTimeFilter<"ScheduleItem"> | Date | string
    updatedAt?: DateTimeFilter<"ScheduleItem"> | Date | string
    schedule?: XOR<DailyScheduleScalarRelationFilter, DailyScheduleWhereInput>
    gymMaster?: XOR<GymExerciseMasterNullableScalarRelationFilter, GymExerciseMasterWhereInput> | null
    runningMaster?: XOR<RunningExerciseMasterNullableScalarRelationFilter, RunningExerciseMasterWhereInput> | null
    privateExercise?: XOR<PrivateExerciseNullableScalarRelationFilter, PrivateExerciseWhereInput> | null
  }, "id">

  export type ScheduleItemOrderByWithAggregationInput = {
    id?: SortOrder
    scheduleId?: SortOrder
    sequenceOrder?: SortOrder
    sportType?: SortOrder
    isPrivateExercise?: SortOrder
    gymMasterId?: SortOrderInput | SortOrder
    runningMasterId?: SortOrderInput | SortOrder
    privateExerciseId?: SortOrderInput | SortOrder
    gymPayload?: SortOrderInput | SortOrder
    runningPayload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ScheduleItemCountOrderByAggregateInput
    _avg?: ScheduleItemAvgOrderByAggregateInput
    _max?: ScheduleItemMaxOrderByAggregateInput
    _min?: ScheduleItemMinOrderByAggregateInput
    _sum?: ScheduleItemSumOrderByAggregateInput
  }

  export type ScheduleItemScalarWhereWithAggregatesInput = {
    AND?: ScheduleItemScalarWhereWithAggregatesInput | ScheduleItemScalarWhereWithAggregatesInput[]
    OR?: ScheduleItemScalarWhereWithAggregatesInput[]
    NOT?: ScheduleItemScalarWhereWithAggregatesInput | ScheduleItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ScheduleItem"> | string
    scheduleId?: StringWithAggregatesFilter<"ScheduleItem"> | string
    sequenceOrder?: IntWithAggregatesFilter<"ScheduleItem"> | number
    sportType?: StringWithAggregatesFilter<"ScheduleItem"> | string
    isPrivateExercise?: BoolWithAggregatesFilter<"ScheduleItem"> | boolean
    gymMasterId?: StringNullableWithAggregatesFilter<"ScheduleItem"> | string | null
    runningMasterId?: StringNullableWithAggregatesFilter<"ScheduleItem"> | string | null
    privateExerciseId?: StringNullableWithAggregatesFilter<"ScheduleItem"> | string | null
    gymPayload?: JsonNullableWithAggregatesFilter<"ScheduleItem">
    runningPayload?: JsonNullableWithAggregatesFilter<"ScheduleItem">
    createdAt?: DateTimeWithAggregatesFilter<"ScheduleItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ScheduleItem"> | Date | string
  }

  export type BlogPostWhereInput = {
    AND?: BlogPostWhereInput | BlogPostWhereInput[]
    OR?: BlogPostWhereInput[]
    NOT?: BlogPostWhereInput | BlogPostWhereInput[]
    id?: StringFilter<"BlogPost"> | string
    title?: StringFilter<"BlogPost"> | string
    slug?: StringFilter<"BlogPost"> | string
    excerpt?: StringFilter<"BlogPost"> | string
    content?: StringFilter<"BlogPost"> | string
    coverImage?: StringNullableFilter<"BlogPost"> | string | null
    tags?: StringNullableListFilter<"BlogPost">
    categoryKey?: StringNullableFilter<"BlogPost"> | string | null
    status?: StringFilter<"BlogPost"> | string
    readingTime?: IntFilter<"BlogPost"> | number
    publishedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    authorId?: StringNullableFilter<"BlogPost"> | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
    category?: XOR<BlogCategoryNullableScalarRelationFilter, BlogCategoryWhereInput> | null
  }

  export type BlogPostOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    content?: SortOrder
    coverImage?: SortOrderInput | SortOrder
    tags?: SortOrder
    categoryKey?: SortOrderInput | SortOrder
    status?: SortOrder
    readingTime?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    authorId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: BlogCategoryOrderByWithRelationInput
  }

  export type BlogPostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: BlogPostWhereInput | BlogPostWhereInput[]
    OR?: BlogPostWhereInput[]
    NOT?: BlogPostWhereInput | BlogPostWhereInput[]
    title?: StringFilter<"BlogPost"> | string
    excerpt?: StringFilter<"BlogPost"> | string
    content?: StringFilter<"BlogPost"> | string
    coverImage?: StringNullableFilter<"BlogPost"> | string | null
    tags?: StringNullableListFilter<"BlogPost">
    categoryKey?: StringNullableFilter<"BlogPost"> | string | null
    status?: StringFilter<"BlogPost"> | string
    readingTime?: IntFilter<"BlogPost"> | number
    publishedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    authorId?: StringNullableFilter<"BlogPost"> | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
    category?: XOR<BlogCategoryNullableScalarRelationFilter, BlogCategoryWhereInput> | null
  }, "id" | "slug">

  export type BlogPostOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    content?: SortOrder
    coverImage?: SortOrderInput | SortOrder
    tags?: SortOrder
    categoryKey?: SortOrderInput | SortOrder
    status?: SortOrder
    readingTime?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    authorId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BlogPostCountOrderByAggregateInput
    _avg?: BlogPostAvgOrderByAggregateInput
    _max?: BlogPostMaxOrderByAggregateInput
    _min?: BlogPostMinOrderByAggregateInput
    _sum?: BlogPostSumOrderByAggregateInput
  }

  export type BlogPostScalarWhereWithAggregatesInput = {
    AND?: BlogPostScalarWhereWithAggregatesInput | BlogPostScalarWhereWithAggregatesInput[]
    OR?: BlogPostScalarWhereWithAggregatesInput[]
    NOT?: BlogPostScalarWhereWithAggregatesInput | BlogPostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlogPost"> | string
    title?: StringWithAggregatesFilter<"BlogPost"> | string
    slug?: StringWithAggregatesFilter<"BlogPost"> | string
    excerpt?: StringWithAggregatesFilter<"BlogPost"> | string
    content?: StringWithAggregatesFilter<"BlogPost"> | string
    coverImage?: StringNullableWithAggregatesFilter<"BlogPost"> | string | null
    tags?: StringNullableListFilter<"BlogPost">
    categoryKey?: StringNullableWithAggregatesFilter<"BlogPost"> | string | null
    status?: StringWithAggregatesFilter<"BlogPost"> | string
    readingTime?: IntWithAggregatesFilter<"BlogPost"> | number
    publishedAt?: DateTimeNullableWithAggregatesFilter<"BlogPost"> | Date | string | null
    authorId?: StringNullableWithAggregatesFilter<"BlogPost"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BlogPost"> | Date | string
  }

  export type BlogCategoryWhereInput = {
    AND?: BlogCategoryWhereInput | BlogCategoryWhereInput[]
    OR?: BlogCategoryWhereInput[]
    NOT?: BlogCategoryWhereInput | BlogCategoryWhereInput[]
    id?: StringFilter<"BlogCategory"> | string
    key?: StringFilter<"BlogCategory"> | string
    label?: StringFilter<"BlogCategory"> | string
    description?: StringNullableFilter<"BlogCategory"> | string | null
    imageUrl?: StringNullableFilter<"BlogCategory"> | string | null
    isActive?: BoolFilter<"BlogCategory"> | boolean
    order?: IntFilter<"BlogCategory"> | number
    createdAt?: DateTimeFilter<"BlogCategory"> | Date | string
    updatedAt?: DateTimeFilter<"BlogCategory"> | Date | string
    posts?: BlogPostListRelationFilter
  }

  export type BlogCategoryOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    posts?: BlogPostOrderByRelationAggregateInput
  }

  export type BlogCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    AND?: BlogCategoryWhereInput | BlogCategoryWhereInput[]
    OR?: BlogCategoryWhereInput[]
    NOT?: BlogCategoryWhereInput | BlogCategoryWhereInput[]
    label?: StringFilter<"BlogCategory"> | string
    description?: StringNullableFilter<"BlogCategory"> | string | null
    imageUrl?: StringNullableFilter<"BlogCategory"> | string | null
    isActive?: BoolFilter<"BlogCategory"> | boolean
    order?: IntFilter<"BlogCategory"> | number
    createdAt?: DateTimeFilter<"BlogCategory"> | Date | string
    updatedAt?: DateTimeFilter<"BlogCategory"> | Date | string
    posts?: BlogPostListRelationFilter
  }, "id" | "key">

  export type BlogCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BlogCategoryCountOrderByAggregateInput
    _avg?: BlogCategoryAvgOrderByAggregateInput
    _max?: BlogCategoryMaxOrderByAggregateInput
    _min?: BlogCategoryMinOrderByAggregateInput
    _sum?: BlogCategorySumOrderByAggregateInput
  }

  export type BlogCategoryScalarWhereWithAggregatesInput = {
    AND?: BlogCategoryScalarWhereWithAggregatesInput | BlogCategoryScalarWhereWithAggregatesInput[]
    OR?: BlogCategoryScalarWhereWithAggregatesInput[]
    NOT?: BlogCategoryScalarWhereWithAggregatesInput | BlogCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlogCategory"> | string
    key?: StringWithAggregatesFilter<"BlogCategory"> | string
    label?: StringWithAggregatesFilter<"BlogCategory"> | string
    description?: StringNullableWithAggregatesFilter<"BlogCategory"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"BlogCategory"> | string | null
    isActive?: BoolWithAggregatesFilter<"BlogCategory"> | boolean
    order?: IntWithAggregatesFilter<"BlogCategory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"BlogCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BlogCategory"> | Date | string
  }

  export type AssetWhereInput = {
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    id?: StringFilter<"Asset"> | string
    fileName?: StringFilter<"Asset"> | string
    url?: StringFilter<"Asset"> | string
    key?: StringNullableFilter<"Asset"> | string | null
    storageProvider?: StringFilter<"Asset"> | string
    mimeType?: StringNullableFilter<"Asset"> | string | null
    size?: IntNullableFilter<"Asset"> | number | null
    category?: StringNullableFilter<"Asset"> | string | null
    uploadedBy?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
  }

  export type AssetOrderByWithRelationInput = {
    id?: SortOrder
    fileName?: SortOrder
    url?: SortOrder
    key?: SortOrderInput | SortOrder
    storageProvider?: SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    uploadedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    fileName?: StringFilter<"Asset"> | string
    url?: StringFilter<"Asset"> | string
    key?: StringNullableFilter<"Asset"> | string | null
    storageProvider?: StringFilter<"Asset"> | string
    mimeType?: StringNullableFilter<"Asset"> | string | null
    size?: IntNullableFilter<"Asset"> | number | null
    category?: StringNullableFilter<"Asset"> | string | null
    uploadedBy?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
  }, "id">

  export type AssetOrderByWithAggregationInput = {
    id?: SortOrder
    fileName?: SortOrder
    url?: SortOrder
    key?: SortOrderInput | SortOrder
    storageProvider?: SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    uploadedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AssetCountOrderByAggregateInput
    _avg?: AssetAvgOrderByAggregateInput
    _max?: AssetMaxOrderByAggregateInput
    _min?: AssetMinOrderByAggregateInput
    _sum?: AssetSumOrderByAggregateInput
  }

  export type AssetScalarWhereWithAggregatesInput = {
    AND?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    OR?: AssetScalarWhereWithAggregatesInput[]
    NOT?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Asset"> | string
    fileName?: StringWithAggregatesFilter<"Asset"> | string
    url?: StringWithAggregatesFilter<"Asset"> | string
    key?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    storageProvider?: StringWithAggregatesFilter<"Asset"> | string
    mimeType?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    size?: IntNullableWithAggregatesFilter<"Asset"> | number | null
    category?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    uploadedBy?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
  }

  export type AppConfigWhereInput = {
    AND?: AppConfigWhereInput | AppConfigWhereInput[]
    OR?: AppConfigWhereInput[]
    NOT?: AppConfigWhereInput | AppConfigWhereInput[]
    id?: IntFilter<"AppConfig"> | number
    key?: StringFilter<"AppConfig"> | string
    value?: JsonFilter<"AppConfig">
    label?: StringNullableFilter<"AppConfig"> | string | null
    updatedAt?: DateTimeFilter<"AppConfig"> | Date | string
  }

  export type AppConfigOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    label?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    key?: string
    AND?: AppConfigWhereInput | AppConfigWhereInput[]
    OR?: AppConfigWhereInput[]
    NOT?: AppConfigWhereInput | AppConfigWhereInput[]
    value?: JsonFilter<"AppConfig">
    label?: StringNullableFilter<"AppConfig"> | string | null
    updatedAt?: DateTimeFilter<"AppConfig"> | Date | string
  }, "id" | "key">

  export type AppConfigOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    label?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: AppConfigCountOrderByAggregateInput
    _avg?: AppConfigAvgOrderByAggregateInput
    _max?: AppConfigMaxOrderByAggregateInput
    _min?: AppConfigMinOrderByAggregateInput
    _sum?: AppConfigSumOrderByAggregateInput
  }

  export type AppConfigScalarWhereWithAggregatesInput = {
    AND?: AppConfigScalarWhereWithAggregatesInput | AppConfigScalarWhereWithAggregatesInput[]
    OR?: AppConfigScalarWhereWithAggregatesInput[]
    NOT?: AppConfigScalarWhereWithAggregatesInput | AppConfigScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AppConfig"> | number
    key?: StringWithAggregatesFilter<"AppConfig"> | string
    value?: JsonWithAggregatesFilter<"AppConfig">
    label?: StringNullableWithAggregatesFilter<"AppConfig"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"AppConfig"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    privateExercises?: PrivateExerciseCreateNestedManyWithoutUserInput
    dailySchedules?: DailyScheduleCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    privateExercises?: PrivateExerciseUncheckedCreateNestedManyWithoutUserInput
    dailySchedules?: DailyScheduleUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    privateExercises?: PrivateExerciseUpdateManyWithoutUserNestedInput
    dailySchedules?: DailyScheduleUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    privateExercises?: PrivateExerciseUncheckedUpdateManyWithoutUserNestedInput
    dailySchedules?: DailyScheduleUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GymExerciseMasterCreateInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterCreatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    garminExerciseEnum?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemCreateNestedManyWithoutGymMasterInput
  }

  export type GymExerciseMasterUncheckedCreateInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterCreatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    garminExerciseEnum?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemUncheckedCreateNestedManyWithoutGymMasterInput
  }

  export type GymExerciseMasterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUpdateManyWithoutGymMasterNestedInput
  }

  export type GymExerciseMasterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUncheckedUpdateManyWithoutGymMasterNestedInput
  }

  export type GymExerciseMasterCreateManyInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterCreatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    garminExerciseEnum?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GymExerciseMasterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GymExerciseMasterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RunningExerciseMasterCreateInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    workoutStructure: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemCreateNestedManyWithoutRunningMasterInput
  }

  export type RunningExerciseMasterUncheckedCreateInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    workoutStructure: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemUncheckedCreateNestedManyWithoutRunningMasterInput
  }

  export type RunningExerciseMasterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUpdateManyWithoutRunningMasterNestedInput
  }

  export type RunningExerciseMasterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUncheckedUpdateManyWithoutRunningMasterNestedInput
  }

  export type RunningExerciseMasterCreateManyInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    workoutStructure: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RunningExerciseMasterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RunningExerciseMasterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PrivateExerciseCreateInput = {
    id?: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPrivateExercisesInput
    scheduleItems?: ScheduleItemCreateNestedManyWithoutPrivateExerciseInput
  }

  export type PrivateExerciseUncheckedCreateInput = {
    id?: string
    userId: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemUncheckedCreateNestedManyWithoutPrivateExerciseInput
  }

  export type PrivateExerciseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPrivateExercisesNestedInput
    scheduleItems?: ScheduleItemUpdateManyWithoutPrivateExerciseNestedInput
  }

  export type PrivateExerciseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUncheckedUpdateManyWithoutPrivateExerciseNestedInput
  }

  export type PrivateExerciseCreateManyInput = {
    id?: string
    userId: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PrivateExerciseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PrivateExerciseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyScheduleCreateInput = {
    id?: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDailySchedulesInput
    items?: ScheduleItemCreateNestedManyWithoutScheduleInput
  }

  export type DailyScheduleUncheckedCreateInput = {
    id?: string
    userId: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ScheduleItemUncheckedCreateNestedManyWithoutScheduleInput
  }

  export type DailyScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDailySchedulesNestedInput
    items?: ScheduleItemUpdateManyWithoutScheduleNestedInput
  }

  export type DailyScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ScheduleItemUncheckedUpdateManyWithoutScheduleNestedInput
  }

  export type DailyScheduleCreateManyInput = {
    id?: string
    userId: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule: DailyScheduleCreateNestedOneWithoutItemsInput
    gymMaster?: GymExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    runningMaster?: RunningExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    privateExercise?: PrivateExerciseCreateNestedOneWithoutScheduleItemsInput
  }

  export type ScheduleItemUncheckedCreateInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: DailyScheduleUpdateOneRequiredWithoutItemsNestedInput
    gymMaster?: GymExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    runningMaster?: RunningExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    privateExercise?: PrivateExerciseUpdateOneWithoutScheduleItemsNestedInput
  }

  export type ScheduleItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateManyInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: BlogCategoryCreateNestedOneWithoutPostsInput
  }

  export type BlogPostUncheckedCreateInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    categoryKey?: string | null
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: BlogCategoryUpdateOneWithoutPostsNestedInput
  }

  export type BlogPostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    categoryKey?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateManyInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    categoryKey?: string | null
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    categoryKey?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogCategoryCreateInput = {
    id?: string
    key: string
    label: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    posts?: BlogPostCreateNestedManyWithoutCategoryInput
  }

  export type BlogCategoryUncheckedCreateInput = {
    id?: string
    key: string
    label: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    posts?: BlogPostUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type BlogCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: BlogPostUpdateManyWithoutCategoryNestedInput
  }

  export type BlogCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: BlogPostUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type BlogCategoryCreateManyInput = {
    id?: string
    key: string
    label: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCreateInput = {
    id?: string
    fileName: string
    url: string
    key?: string | null
    storageProvider?: string
    mimeType?: string | null
    size?: number | null
    category?: string | null
    uploadedBy?: string | null
    createdAt?: Date | string
  }

  export type AssetUncheckedCreateInput = {
    id?: string
    fileName: string
    url: string
    key?: string | null
    storageProvider?: string
    mimeType?: string | null
    size?: number | null
    category?: string | null
    uploadedBy?: string | null
    createdAt?: Date | string
  }

  export type AssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    key?: NullableStringFieldUpdateOperationsInput | string | null
    storageProvider?: StringFieldUpdateOperationsInput | string
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    key?: NullableStringFieldUpdateOperationsInput | string | null
    storageProvider?: StringFieldUpdateOperationsInput | string
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCreateManyInput = {
    id?: string
    fileName: string
    url: string
    key?: string | null
    storageProvider?: string
    mimeType?: string | null
    size?: number | null
    category?: string | null
    uploadedBy?: string | null
    createdAt?: Date | string
  }

  export type AssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    key?: NullableStringFieldUpdateOperationsInput | string | null
    storageProvider?: StringFieldUpdateOperationsInput | string
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    key?: NullableStringFieldUpdateOperationsInput | string | null
    storageProvider?: StringFieldUpdateOperationsInput | string
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigCreateInput = {
    key: string
    value: JsonNullValueInput | InputJsonValue
    label?: string | null
    updatedAt?: Date | string
  }

  export type AppConfigUncheckedCreateInput = {
    id?: number
    key: string
    value: JsonNullValueInput | InputJsonValue
    label?: string | null
    updatedAt?: Date | string
  }

  export type AppConfigUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    label?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    label?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigCreateManyInput = {
    id?: number
    key: string
    value: JsonNullValueInput | InputJsonValue
    label?: string | null
    updatedAt?: Date | string
  }

  export type AppConfigUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    label?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    label?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumUserTierFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierFilter<$PrismaModel> | $Enums.UserTier
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PrivateExerciseListRelationFilter = {
    every?: PrivateExerciseWhereInput
    some?: PrivateExerciseWhereInput
    none?: PrivateExerciseWhereInput
  }

  export type DailyScheduleListRelationFilter = {
    every?: DailyScheduleWhereInput
    some?: DailyScheduleWhereInput
    none?: DailyScheduleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PrivateExerciseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DailyScheduleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    googleId?: SortOrder
    avatarUrl?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    googleId?: SortOrder
    avatarUrl?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    googleId?: SortOrder
    avatarUrl?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumUserTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierWithAggregatesFilter<$PrismaModel> | $Enums.UserTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTierFilter<$PrismaModel>
    _max?: NestedEnumUserTierFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumMuscleGroupFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel>
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumMuscleGroupFilter<$PrismaModel> | $Enums.MuscleGroup
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ScheduleItemListRelationFilter = {
    every?: ScheduleItemWhereInput
    some?: ScheduleItemWhereInput
    none?: ScheduleItemWhereInput
  }

  export type ScheduleItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GymExerciseMasterCountOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    targetMuscleGroup?: SortOrder
    secondaryMuscleGroups?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    garminExerciseEnum?: SortOrder
    instructions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GymExerciseMasterMaxOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    targetMuscleGroup?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    garminExerciseEnum?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GymExerciseMasterMinOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    targetMuscleGroup?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    garminExerciseEnum?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumMuscleGroupWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel>
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumMuscleGroupWithAggregatesFilter<$PrismaModel> | $Enums.MuscleGroup
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMuscleGroupFilter<$PrismaModel>
    _max?: NestedEnumMuscleGroupFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumRunningTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRunningTypeFilter<$PrismaModel> | $Enums.RunningType
  }

  export type RunningExerciseMasterCountOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    runningType?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    instructions?: SortOrder
    workoutStructure?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RunningExerciseMasterMaxOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    runningType?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RunningExerciseMasterMinOrderByAggregateInput = {
    id?: SortOrder
    isActive?: SortOrder
    name?: SortOrder
    vietnameseName?: SortOrder
    runningType?: SortOrder
    youtubeEmbedUrl?: SortOrder
    gifUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumRunningTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRunningTypeWithAggregatesFilter<$PrismaModel> | $Enums.RunningType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRunningTypeFilter<$PrismaModel>
    _max?: NestedEnumRunningTypeFilter<$PrismaModel>
  }

  export type EnumMuscleGroupNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel> | null
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMuscleGroupNullableFilter<$PrismaModel> | $Enums.MuscleGroup | null
  }

  export type EnumRunningTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRunningTypeNullableFilter<$PrismaModel> | $Enums.RunningType | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PrivateExerciseCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    isActive?: SortOrder
    sportType?: SortOrder
    name?: SortOrder
    targetMuscleGroup?: SortOrder
    runningType?: SortOrder
    customNotes?: SortOrder
    gifUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PrivateExerciseMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    isActive?: SortOrder
    sportType?: SortOrder
    name?: SortOrder
    targetMuscleGroup?: SortOrder
    runningType?: SortOrder
    customNotes?: SortOrder
    gifUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PrivateExerciseMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    isActive?: SortOrder
    sportType?: SortOrder
    name?: SortOrder
    targetMuscleGroup?: SortOrder
    runningType?: SortOrder
    customNotes?: SortOrder
    gifUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMuscleGroupNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel> | null
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMuscleGroupNullableWithAggregatesFilter<$PrismaModel> | $Enums.MuscleGroup | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMuscleGroupNullableFilter<$PrismaModel>
    _max?: NestedEnumMuscleGroupNullableFilter<$PrismaModel>
  }

  export type EnumRunningTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRunningTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.RunningType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRunningTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumRunningTypeNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumDayStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DayStatus | EnumDayStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDayStatusFilter<$PrismaModel> | $Enums.DayStatus
  }

  export type DailyScheduleUserIdDateStringCompoundUniqueInput = {
    userId: string
    dateString: string
  }

  export type DailyScheduleCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    dateString?: SortOrder
    weekNumber?: SortOrder
    year?: SortOrder
    dayStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyScheduleAvgOrderByAggregateInput = {
    weekNumber?: SortOrder
    year?: SortOrder
  }

  export type DailyScheduleMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    dateString?: SortOrder
    weekNumber?: SortOrder
    year?: SortOrder
    dayStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyScheduleMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    dateString?: SortOrder
    weekNumber?: SortOrder
    year?: SortOrder
    dayStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyScheduleSumOrderByAggregateInput = {
    weekNumber?: SortOrder
    year?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumDayStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DayStatus | EnumDayStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDayStatusWithAggregatesFilter<$PrismaModel> | $Enums.DayStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDayStatusFilter<$PrismaModel>
    _max?: NestedEnumDayStatusFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DailyScheduleScalarRelationFilter = {
    is?: DailyScheduleWhereInput
    isNot?: DailyScheduleWhereInput
  }

  export type GymExerciseMasterNullableScalarRelationFilter = {
    is?: GymExerciseMasterWhereInput | null
    isNot?: GymExerciseMasterWhereInput | null
  }

  export type RunningExerciseMasterNullableScalarRelationFilter = {
    is?: RunningExerciseMasterWhereInput | null
    isNot?: RunningExerciseMasterWhereInput | null
  }

  export type PrivateExerciseNullableScalarRelationFilter = {
    is?: PrivateExerciseWhereInput | null
    isNot?: PrivateExerciseWhereInput | null
  }

  export type ScheduleItemCountOrderByAggregateInput = {
    id?: SortOrder
    scheduleId?: SortOrder
    sequenceOrder?: SortOrder
    sportType?: SortOrder
    isPrivateExercise?: SortOrder
    gymMasterId?: SortOrder
    runningMasterId?: SortOrder
    privateExerciseId?: SortOrder
    gymPayload?: SortOrder
    runningPayload?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ScheduleItemAvgOrderByAggregateInput = {
    sequenceOrder?: SortOrder
  }

  export type ScheduleItemMaxOrderByAggregateInput = {
    id?: SortOrder
    scheduleId?: SortOrder
    sequenceOrder?: SortOrder
    sportType?: SortOrder
    isPrivateExercise?: SortOrder
    gymMasterId?: SortOrder
    runningMasterId?: SortOrder
    privateExerciseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ScheduleItemMinOrderByAggregateInput = {
    id?: SortOrder
    scheduleId?: SortOrder
    sequenceOrder?: SortOrder
    sportType?: SortOrder
    isPrivateExercise?: SortOrder
    gymMasterId?: SortOrder
    runningMasterId?: SortOrder
    privateExerciseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ScheduleItemSumOrderByAggregateInput = {
    sequenceOrder?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BlogCategoryNullableScalarRelationFilter = {
    is?: BlogCategoryWhereInput | null
    isNot?: BlogCategoryWhereInput | null
  }

  export type BlogPostCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    content?: SortOrder
    coverImage?: SortOrder
    tags?: SortOrder
    categoryKey?: SortOrder
    status?: SortOrder
    readingTime?: SortOrder
    publishedAt?: SortOrder
    authorId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogPostAvgOrderByAggregateInput = {
    readingTime?: SortOrder
  }

  export type BlogPostMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    content?: SortOrder
    coverImage?: SortOrder
    categoryKey?: SortOrder
    status?: SortOrder
    readingTime?: SortOrder
    publishedAt?: SortOrder
    authorId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogPostMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    content?: SortOrder
    coverImage?: SortOrder
    categoryKey?: SortOrder
    status?: SortOrder
    readingTime?: SortOrder
    publishedAt?: SortOrder
    authorId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogPostSumOrderByAggregateInput = {
    readingTime?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BlogPostListRelationFilter = {
    every?: BlogPostWhereInput
    some?: BlogPostWhereInput
    none?: BlogPostWhereInput
  }

  export type BlogPostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BlogCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    isActive?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogCategoryAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type BlogCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    isActive?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    isActive?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogCategorySumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type AssetCountOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    url?: SortOrder
    key?: SortOrder
    storageProvider?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    uploadedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type AssetMaxOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    url?: SortOrder
    key?: SortOrder
    storageProvider?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    uploadedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetMinOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    url?: SortOrder
    key?: SortOrder
    storageProvider?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    uploadedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type AppConfigCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    label?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    label?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PrivateExerciseCreateNestedManyWithoutUserInput = {
    create?: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput> | PrivateExerciseCreateWithoutUserInput[] | PrivateExerciseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutUserInput | PrivateExerciseCreateOrConnectWithoutUserInput[]
    createMany?: PrivateExerciseCreateManyUserInputEnvelope
    connect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
  }

  export type DailyScheduleCreateNestedManyWithoutUserInput = {
    create?: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput> | DailyScheduleCreateWithoutUserInput[] | DailyScheduleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutUserInput | DailyScheduleCreateOrConnectWithoutUserInput[]
    createMany?: DailyScheduleCreateManyUserInputEnvelope
    connect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
  }

  export type PrivateExerciseUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput> | PrivateExerciseCreateWithoutUserInput[] | PrivateExerciseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutUserInput | PrivateExerciseCreateOrConnectWithoutUserInput[]
    createMany?: PrivateExerciseCreateManyUserInputEnvelope
    connect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
  }

  export type DailyScheduleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput> | DailyScheduleCreateWithoutUserInput[] | DailyScheduleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutUserInput | DailyScheduleCreateOrConnectWithoutUserInput[]
    createMany?: DailyScheduleCreateManyUserInputEnvelope
    connect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumUserTierFieldUpdateOperationsInput = {
    set?: $Enums.UserTier
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PrivateExerciseUpdateManyWithoutUserNestedInput = {
    create?: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput> | PrivateExerciseCreateWithoutUserInput[] | PrivateExerciseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutUserInput | PrivateExerciseCreateOrConnectWithoutUserInput[]
    upsert?: PrivateExerciseUpsertWithWhereUniqueWithoutUserInput | PrivateExerciseUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PrivateExerciseCreateManyUserInputEnvelope
    set?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    disconnect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    delete?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    connect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    update?: PrivateExerciseUpdateWithWhereUniqueWithoutUserInput | PrivateExerciseUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PrivateExerciseUpdateManyWithWhereWithoutUserInput | PrivateExerciseUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PrivateExerciseScalarWhereInput | PrivateExerciseScalarWhereInput[]
  }

  export type DailyScheduleUpdateManyWithoutUserNestedInput = {
    create?: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput> | DailyScheduleCreateWithoutUserInput[] | DailyScheduleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutUserInput | DailyScheduleCreateOrConnectWithoutUserInput[]
    upsert?: DailyScheduleUpsertWithWhereUniqueWithoutUserInput | DailyScheduleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DailyScheduleCreateManyUserInputEnvelope
    set?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    disconnect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    delete?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    connect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    update?: DailyScheduleUpdateWithWhereUniqueWithoutUserInput | DailyScheduleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DailyScheduleUpdateManyWithWhereWithoutUserInput | DailyScheduleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DailyScheduleScalarWhereInput | DailyScheduleScalarWhereInput[]
  }

  export type PrivateExerciseUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput> | PrivateExerciseCreateWithoutUserInput[] | PrivateExerciseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutUserInput | PrivateExerciseCreateOrConnectWithoutUserInput[]
    upsert?: PrivateExerciseUpsertWithWhereUniqueWithoutUserInput | PrivateExerciseUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PrivateExerciseCreateManyUserInputEnvelope
    set?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    disconnect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    delete?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    connect?: PrivateExerciseWhereUniqueInput | PrivateExerciseWhereUniqueInput[]
    update?: PrivateExerciseUpdateWithWhereUniqueWithoutUserInput | PrivateExerciseUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PrivateExerciseUpdateManyWithWhereWithoutUserInput | PrivateExerciseUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PrivateExerciseScalarWhereInput | PrivateExerciseScalarWhereInput[]
  }

  export type DailyScheduleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput> | DailyScheduleCreateWithoutUserInput[] | DailyScheduleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutUserInput | DailyScheduleCreateOrConnectWithoutUserInput[]
    upsert?: DailyScheduleUpsertWithWhereUniqueWithoutUserInput | DailyScheduleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DailyScheduleCreateManyUserInputEnvelope
    set?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    disconnect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    delete?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    connect?: DailyScheduleWhereUniqueInput | DailyScheduleWhereUniqueInput[]
    update?: DailyScheduleUpdateWithWhereUniqueWithoutUserInput | DailyScheduleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DailyScheduleUpdateManyWithWhereWithoutUserInput | DailyScheduleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DailyScheduleScalarWhereInput | DailyScheduleScalarWhereInput[]
  }

  export type GymExerciseMasterCreatesecondaryMuscleGroupsInput = {
    set: string[]
  }

  export type ScheduleItemCreateNestedManyWithoutGymMasterInput = {
    create?: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput> | ScheduleItemCreateWithoutGymMasterInput[] | ScheduleItemUncheckedCreateWithoutGymMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutGymMasterInput | ScheduleItemCreateOrConnectWithoutGymMasterInput[]
    createMany?: ScheduleItemCreateManyGymMasterInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type ScheduleItemUncheckedCreateNestedManyWithoutGymMasterInput = {
    create?: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput> | ScheduleItemCreateWithoutGymMasterInput[] | ScheduleItemUncheckedCreateWithoutGymMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutGymMasterInput | ScheduleItemCreateOrConnectWithoutGymMasterInput[]
    createMany?: ScheduleItemCreateManyGymMasterInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumMuscleGroupFieldUpdateOperationsInput = {
    set?: $Enums.MuscleGroup
  }

  export type GymExerciseMasterUpdatesecondaryMuscleGroupsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ScheduleItemUpdateManyWithoutGymMasterNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput> | ScheduleItemCreateWithoutGymMasterInput[] | ScheduleItemUncheckedCreateWithoutGymMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutGymMasterInput | ScheduleItemCreateOrConnectWithoutGymMasterInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutGymMasterInput | ScheduleItemUpsertWithWhereUniqueWithoutGymMasterInput[]
    createMany?: ScheduleItemCreateManyGymMasterInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutGymMasterInput | ScheduleItemUpdateWithWhereUniqueWithoutGymMasterInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutGymMasterInput | ScheduleItemUpdateManyWithWhereWithoutGymMasterInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type ScheduleItemUncheckedUpdateManyWithoutGymMasterNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput> | ScheduleItemCreateWithoutGymMasterInput[] | ScheduleItemUncheckedCreateWithoutGymMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutGymMasterInput | ScheduleItemCreateOrConnectWithoutGymMasterInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutGymMasterInput | ScheduleItemUpsertWithWhereUniqueWithoutGymMasterInput[]
    createMany?: ScheduleItemCreateManyGymMasterInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutGymMasterInput | ScheduleItemUpdateWithWhereUniqueWithoutGymMasterInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutGymMasterInput | ScheduleItemUpdateManyWithWhereWithoutGymMasterInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type ScheduleItemCreateNestedManyWithoutRunningMasterInput = {
    create?: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput> | ScheduleItemCreateWithoutRunningMasterInput[] | ScheduleItemUncheckedCreateWithoutRunningMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutRunningMasterInput | ScheduleItemCreateOrConnectWithoutRunningMasterInput[]
    createMany?: ScheduleItemCreateManyRunningMasterInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type ScheduleItemUncheckedCreateNestedManyWithoutRunningMasterInput = {
    create?: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput> | ScheduleItemCreateWithoutRunningMasterInput[] | ScheduleItemUncheckedCreateWithoutRunningMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutRunningMasterInput | ScheduleItemCreateOrConnectWithoutRunningMasterInput[]
    createMany?: ScheduleItemCreateManyRunningMasterInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type EnumRunningTypeFieldUpdateOperationsInput = {
    set?: $Enums.RunningType
  }

  export type ScheduleItemUpdateManyWithoutRunningMasterNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput> | ScheduleItemCreateWithoutRunningMasterInput[] | ScheduleItemUncheckedCreateWithoutRunningMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutRunningMasterInput | ScheduleItemCreateOrConnectWithoutRunningMasterInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutRunningMasterInput | ScheduleItemUpsertWithWhereUniqueWithoutRunningMasterInput[]
    createMany?: ScheduleItemCreateManyRunningMasterInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutRunningMasterInput | ScheduleItemUpdateWithWhereUniqueWithoutRunningMasterInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutRunningMasterInput | ScheduleItemUpdateManyWithWhereWithoutRunningMasterInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type ScheduleItemUncheckedUpdateManyWithoutRunningMasterNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput> | ScheduleItemCreateWithoutRunningMasterInput[] | ScheduleItemUncheckedCreateWithoutRunningMasterInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutRunningMasterInput | ScheduleItemCreateOrConnectWithoutRunningMasterInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutRunningMasterInput | ScheduleItemUpsertWithWhereUniqueWithoutRunningMasterInput[]
    createMany?: ScheduleItemCreateManyRunningMasterInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutRunningMasterInput | ScheduleItemUpdateWithWhereUniqueWithoutRunningMasterInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutRunningMasterInput | ScheduleItemUpdateManyWithWhereWithoutRunningMasterInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPrivateExercisesInput = {
    create?: XOR<UserCreateWithoutPrivateExercisesInput, UserUncheckedCreateWithoutPrivateExercisesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPrivateExercisesInput
    connect?: UserWhereUniqueInput
  }

  export type ScheduleItemCreateNestedManyWithoutPrivateExerciseInput = {
    create?: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput> | ScheduleItemCreateWithoutPrivateExerciseInput[] | ScheduleItemUncheckedCreateWithoutPrivateExerciseInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutPrivateExerciseInput | ScheduleItemCreateOrConnectWithoutPrivateExerciseInput[]
    createMany?: ScheduleItemCreateManyPrivateExerciseInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type ScheduleItemUncheckedCreateNestedManyWithoutPrivateExerciseInput = {
    create?: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput> | ScheduleItemCreateWithoutPrivateExerciseInput[] | ScheduleItemUncheckedCreateWithoutPrivateExerciseInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutPrivateExerciseInput | ScheduleItemCreateOrConnectWithoutPrivateExerciseInput[]
    createMany?: ScheduleItemCreateManyPrivateExerciseInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type NullableEnumMuscleGroupFieldUpdateOperationsInput = {
    set?: $Enums.MuscleGroup | null
  }

  export type NullableEnumRunningTypeFieldUpdateOperationsInput = {
    set?: $Enums.RunningType | null
  }

  export type UserUpdateOneRequiredWithoutPrivateExercisesNestedInput = {
    create?: XOR<UserCreateWithoutPrivateExercisesInput, UserUncheckedCreateWithoutPrivateExercisesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPrivateExercisesInput
    upsert?: UserUpsertWithoutPrivateExercisesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPrivateExercisesInput, UserUpdateWithoutPrivateExercisesInput>, UserUncheckedUpdateWithoutPrivateExercisesInput>
  }

  export type ScheduleItemUpdateManyWithoutPrivateExerciseNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput> | ScheduleItemCreateWithoutPrivateExerciseInput[] | ScheduleItemUncheckedCreateWithoutPrivateExerciseInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutPrivateExerciseInput | ScheduleItemCreateOrConnectWithoutPrivateExerciseInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutPrivateExerciseInput | ScheduleItemUpsertWithWhereUniqueWithoutPrivateExerciseInput[]
    createMany?: ScheduleItemCreateManyPrivateExerciseInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutPrivateExerciseInput | ScheduleItemUpdateWithWhereUniqueWithoutPrivateExerciseInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutPrivateExerciseInput | ScheduleItemUpdateManyWithWhereWithoutPrivateExerciseInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type ScheduleItemUncheckedUpdateManyWithoutPrivateExerciseNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput> | ScheduleItemCreateWithoutPrivateExerciseInput[] | ScheduleItemUncheckedCreateWithoutPrivateExerciseInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutPrivateExerciseInput | ScheduleItemCreateOrConnectWithoutPrivateExerciseInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutPrivateExerciseInput | ScheduleItemUpsertWithWhereUniqueWithoutPrivateExerciseInput[]
    createMany?: ScheduleItemCreateManyPrivateExerciseInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutPrivateExerciseInput | ScheduleItemUpdateWithWhereUniqueWithoutPrivateExerciseInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutPrivateExerciseInput | ScheduleItemUpdateManyWithWhereWithoutPrivateExerciseInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutDailySchedulesInput = {
    create?: XOR<UserCreateWithoutDailySchedulesInput, UserUncheckedCreateWithoutDailySchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDailySchedulesInput
    connect?: UserWhereUniqueInput
  }

  export type ScheduleItemCreateNestedManyWithoutScheduleInput = {
    create?: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput> | ScheduleItemCreateWithoutScheduleInput[] | ScheduleItemUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutScheduleInput | ScheduleItemCreateOrConnectWithoutScheduleInput[]
    createMany?: ScheduleItemCreateManyScheduleInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type ScheduleItemUncheckedCreateNestedManyWithoutScheduleInput = {
    create?: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput> | ScheduleItemCreateWithoutScheduleInput[] | ScheduleItemUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutScheduleInput | ScheduleItemCreateOrConnectWithoutScheduleInput[]
    createMany?: ScheduleItemCreateManyScheduleInputEnvelope
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumDayStatusFieldUpdateOperationsInput = {
    set?: $Enums.DayStatus
  }

  export type UserUpdateOneRequiredWithoutDailySchedulesNestedInput = {
    create?: XOR<UserCreateWithoutDailySchedulesInput, UserUncheckedCreateWithoutDailySchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDailySchedulesInput
    upsert?: UserUpsertWithoutDailySchedulesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDailySchedulesInput, UserUpdateWithoutDailySchedulesInput>, UserUncheckedUpdateWithoutDailySchedulesInput>
  }

  export type ScheduleItemUpdateManyWithoutScheduleNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput> | ScheduleItemCreateWithoutScheduleInput[] | ScheduleItemUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutScheduleInput | ScheduleItemCreateOrConnectWithoutScheduleInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutScheduleInput | ScheduleItemUpsertWithWhereUniqueWithoutScheduleInput[]
    createMany?: ScheduleItemCreateManyScheduleInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutScheduleInput | ScheduleItemUpdateWithWhereUniqueWithoutScheduleInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutScheduleInput | ScheduleItemUpdateManyWithWhereWithoutScheduleInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type ScheduleItemUncheckedUpdateManyWithoutScheduleNestedInput = {
    create?: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput> | ScheduleItemCreateWithoutScheduleInput[] | ScheduleItemUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: ScheduleItemCreateOrConnectWithoutScheduleInput | ScheduleItemCreateOrConnectWithoutScheduleInput[]
    upsert?: ScheduleItemUpsertWithWhereUniqueWithoutScheduleInput | ScheduleItemUpsertWithWhereUniqueWithoutScheduleInput[]
    createMany?: ScheduleItemCreateManyScheduleInputEnvelope
    set?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    disconnect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    delete?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    connect?: ScheduleItemWhereUniqueInput | ScheduleItemWhereUniqueInput[]
    update?: ScheduleItemUpdateWithWhereUniqueWithoutScheduleInput | ScheduleItemUpdateWithWhereUniqueWithoutScheduleInput[]
    updateMany?: ScheduleItemUpdateManyWithWhereWithoutScheduleInput | ScheduleItemUpdateManyWithWhereWithoutScheduleInput[]
    deleteMany?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
  }

  export type DailyScheduleCreateNestedOneWithoutItemsInput = {
    create?: XOR<DailyScheduleCreateWithoutItemsInput, DailyScheduleUncheckedCreateWithoutItemsInput>
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutItemsInput
    connect?: DailyScheduleWhereUniqueInput
  }

  export type GymExerciseMasterCreateNestedOneWithoutScheduleItemsInput = {
    create?: XOR<GymExerciseMasterCreateWithoutScheduleItemsInput, GymExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: GymExerciseMasterCreateOrConnectWithoutScheduleItemsInput
    connect?: GymExerciseMasterWhereUniqueInput
  }

  export type RunningExerciseMasterCreateNestedOneWithoutScheduleItemsInput = {
    create?: XOR<RunningExerciseMasterCreateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: RunningExerciseMasterCreateOrConnectWithoutScheduleItemsInput
    connect?: RunningExerciseMasterWhereUniqueInput
  }

  export type PrivateExerciseCreateNestedOneWithoutScheduleItemsInput = {
    create?: XOR<PrivateExerciseCreateWithoutScheduleItemsInput, PrivateExerciseUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutScheduleItemsInput
    connect?: PrivateExerciseWhereUniqueInput
  }

  export type DailyScheduleUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<DailyScheduleCreateWithoutItemsInput, DailyScheduleUncheckedCreateWithoutItemsInput>
    connectOrCreate?: DailyScheduleCreateOrConnectWithoutItemsInput
    upsert?: DailyScheduleUpsertWithoutItemsInput
    connect?: DailyScheduleWhereUniqueInput
    update?: XOR<XOR<DailyScheduleUpdateToOneWithWhereWithoutItemsInput, DailyScheduleUpdateWithoutItemsInput>, DailyScheduleUncheckedUpdateWithoutItemsInput>
  }

  export type GymExerciseMasterUpdateOneWithoutScheduleItemsNestedInput = {
    create?: XOR<GymExerciseMasterCreateWithoutScheduleItemsInput, GymExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: GymExerciseMasterCreateOrConnectWithoutScheduleItemsInput
    upsert?: GymExerciseMasterUpsertWithoutScheduleItemsInput
    disconnect?: GymExerciseMasterWhereInput | boolean
    delete?: GymExerciseMasterWhereInput | boolean
    connect?: GymExerciseMasterWhereUniqueInput
    update?: XOR<XOR<GymExerciseMasterUpdateToOneWithWhereWithoutScheduleItemsInput, GymExerciseMasterUpdateWithoutScheduleItemsInput>, GymExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type RunningExerciseMasterUpdateOneWithoutScheduleItemsNestedInput = {
    create?: XOR<RunningExerciseMasterCreateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: RunningExerciseMasterCreateOrConnectWithoutScheduleItemsInput
    upsert?: RunningExerciseMasterUpsertWithoutScheduleItemsInput
    disconnect?: RunningExerciseMasterWhereInput | boolean
    delete?: RunningExerciseMasterWhereInput | boolean
    connect?: RunningExerciseMasterWhereUniqueInput
    update?: XOR<XOR<RunningExerciseMasterUpdateToOneWithWhereWithoutScheduleItemsInput, RunningExerciseMasterUpdateWithoutScheduleItemsInput>, RunningExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type PrivateExerciseUpdateOneWithoutScheduleItemsNestedInput = {
    create?: XOR<PrivateExerciseCreateWithoutScheduleItemsInput, PrivateExerciseUncheckedCreateWithoutScheduleItemsInput>
    connectOrCreate?: PrivateExerciseCreateOrConnectWithoutScheduleItemsInput
    upsert?: PrivateExerciseUpsertWithoutScheduleItemsInput
    disconnect?: PrivateExerciseWhereInput | boolean
    delete?: PrivateExerciseWhereInput | boolean
    connect?: PrivateExerciseWhereUniqueInput
    update?: XOR<XOR<PrivateExerciseUpdateToOneWithWhereWithoutScheduleItemsInput, PrivateExerciseUpdateWithoutScheduleItemsInput>, PrivateExerciseUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type BlogPostCreatetagsInput = {
    set: string[]
  }

  export type BlogCategoryCreateNestedOneWithoutPostsInput = {
    create?: XOR<BlogCategoryCreateWithoutPostsInput, BlogCategoryUncheckedCreateWithoutPostsInput>
    connectOrCreate?: BlogCategoryCreateOrConnectWithoutPostsInput
    connect?: BlogCategoryWhereUniqueInput
  }

  export type BlogPostUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BlogCategoryUpdateOneWithoutPostsNestedInput = {
    create?: XOR<BlogCategoryCreateWithoutPostsInput, BlogCategoryUncheckedCreateWithoutPostsInput>
    connectOrCreate?: BlogCategoryCreateOrConnectWithoutPostsInput
    upsert?: BlogCategoryUpsertWithoutPostsInput
    disconnect?: BlogCategoryWhereInput | boolean
    delete?: BlogCategoryWhereInput | boolean
    connect?: BlogCategoryWhereUniqueInput
    update?: XOR<XOR<BlogCategoryUpdateToOneWithWhereWithoutPostsInput, BlogCategoryUpdateWithoutPostsInput>, BlogCategoryUncheckedUpdateWithoutPostsInput>
  }

  export type BlogPostCreateNestedManyWithoutCategoryInput = {
    create?: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput> | BlogPostCreateWithoutCategoryInput[] | BlogPostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutCategoryInput | BlogPostCreateOrConnectWithoutCategoryInput[]
    createMany?: BlogPostCreateManyCategoryInputEnvelope
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type BlogPostUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput> | BlogPostCreateWithoutCategoryInput[] | BlogPostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutCategoryInput | BlogPostCreateOrConnectWithoutCategoryInput[]
    createMany?: BlogPostCreateManyCategoryInputEnvelope
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type BlogPostUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput> | BlogPostCreateWithoutCategoryInput[] | BlogPostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutCategoryInput | BlogPostCreateOrConnectWithoutCategoryInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutCategoryInput | BlogPostUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: BlogPostCreateManyCategoryInputEnvelope
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutCategoryInput | BlogPostUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutCategoryInput | BlogPostUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type BlogPostUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput> | BlogPostCreateWithoutCategoryInput[] | BlogPostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutCategoryInput | BlogPostCreateOrConnectWithoutCategoryInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutCategoryInput | BlogPostUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: BlogPostCreateManyCategoryInputEnvelope
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutCategoryInput | BlogPostUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutCategoryInput | BlogPostUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumUserTierFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierFilter<$PrismaModel> | $Enums.UserTier
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumUserTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierWithAggregatesFilter<$PrismaModel> | $Enums.UserTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTierFilter<$PrismaModel>
    _max?: NestedEnumUserTierFilter<$PrismaModel>
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumMuscleGroupFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel>
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumMuscleGroupFilter<$PrismaModel> | $Enums.MuscleGroup
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumMuscleGroupWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel>
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumMuscleGroupWithAggregatesFilter<$PrismaModel> | $Enums.MuscleGroup
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMuscleGroupFilter<$PrismaModel>
    _max?: NestedEnumMuscleGroupFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumRunningTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRunningTypeFilter<$PrismaModel> | $Enums.RunningType
  }

  export type NestedEnumRunningTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRunningTypeWithAggregatesFilter<$PrismaModel> | $Enums.RunningType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRunningTypeFilter<$PrismaModel>
    _max?: NestedEnumRunningTypeFilter<$PrismaModel>
  }

  export type NestedEnumMuscleGroupNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel> | null
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMuscleGroupNullableFilter<$PrismaModel> | $Enums.MuscleGroup | null
  }

  export type NestedEnumRunningTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRunningTypeNullableFilter<$PrismaModel> | $Enums.RunningType | null
  }

  export type NestedEnumMuscleGroupNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MuscleGroup | EnumMuscleGroupFieldRefInput<$PrismaModel> | null
    in?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MuscleGroup[] | ListEnumMuscleGroupFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMuscleGroupNullableWithAggregatesFilter<$PrismaModel> | $Enums.MuscleGroup | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMuscleGroupNullableFilter<$PrismaModel>
    _max?: NestedEnumMuscleGroupNullableFilter<$PrismaModel>
  }

  export type NestedEnumRunningTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RunningType | EnumRunningTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RunningType[] | ListEnumRunningTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRunningTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.RunningType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRunningTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumRunningTypeNullableFilter<$PrismaModel>
  }

  export type NestedEnumDayStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DayStatus | EnumDayStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDayStatusFilter<$PrismaModel> | $Enums.DayStatus
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumDayStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DayStatus | EnumDayStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DayStatus[] | ListEnumDayStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDayStatusWithAggregatesFilter<$PrismaModel> | $Enums.DayStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDayStatusFilter<$PrismaModel>
    _max?: NestedEnumDayStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type PrivateExerciseCreateWithoutUserInput = {
    id?: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemCreateNestedManyWithoutPrivateExerciseInput
  }

  export type PrivateExerciseUncheckedCreateWithoutUserInput = {
    id?: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    scheduleItems?: ScheduleItemUncheckedCreateNestedManyWithoutPrivateExerciseInput
  }

  export type PrivateExerciseCreateOrConnectWithoutUserInput = {
    where: PrivateExerciseWhereUniqueInput
    create: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput>
  }

  export type PrivateExerciseCreateManyUserInputEnvelope = {
    data: PrivateExerciseCreateManyUserInput | PrivateExerciseCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DailyScheduleCreateWithoutUserInput = {
    id?: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ScheduleItemCreateNestedManyWithoutScheduleInput
  }

  export type DailyScheduleUncheckedCreateWithoutUserInput = {
    id?: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ScheduleItemUncheckedCreateNestedManyWithoutScheduleInput
  }

  export type DailyScheduleCreateOrConnectWithoutUserInput = {
    where: DailyScheduleWhereUniqueInput
    create: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput>
  }

  export type DailyScheduleCreateManyUserInputEnvelope = {
    data: DailyScheduleCreateManyUserInput | DailyScheduleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PrivateExerciseUpsertWithWhereUniqueWithoutUserInput = {
    where: PrivateExerciseWhereUniqueInput
    update: XOR<PrivateExerciseUpdateWithoutUserInput, PrivateExerciseUncheckedUpdateWithoutUserInput>
    create: XOR<PrivateExerciseCreateWithoutUserInput, PrivateExerciseUncheckedCreateWithoutUserInput>
  }

  export type PrivateExerciseUpdateWithWhereUniqueWithoutUserInput = {
    where: PrivateExerciseWhereUniqueInput
    data: XOR<PrivateExerciseUpdateWithoutUserInput, PrivateExerciseUncheckedUpdateWithoutUserInput>
  }

  export type PrivateExerciseUpdateManyWithWhereWithoutUserInput = {
    where: PrivateExerciseScalarWhereInput
    data: XOR<PrivateExerciseUpdateManyMutationInput, PrivateExerciseUncheckedUpdateManyWithoutUserInput>
  }

  export type PrivateExerciseScalarWhereInput = {
    AND?: PrivateExerciseScalarWhereInput | PrivateExerciseScalarWhereInput[]
    OR?: PrivateExerciseScalarWhereInput[]
    NOT?: PrivateExerciseScalarWhereInput | PrivateExerciseScalarWhereInput[]
    id?: StringFilter<"PrivateExercise"> | string
    userId?: StringFilter<"PrivateExercise"> | string
    isActive?: BoolFilter<"PrivateExercise"> | boolean
    sportType?: StringFilter<"PrivateExercise"> | string
    name?: StringFilter<"PrivateExercise"> | string
    targetMuscleGroup?: EnumMuscleGroupNullableFilter<"PrivateExercise"> | $Enums.MuscleGroup | null
    runningType?: EnumRunningTypeNullableFilter<"PrivateExercise"> | $Enums.RunningType | null
    customNotes?: StringNullableFilter<"PrivateExercise"> | string | null
    gifUrl?: StringNullableFilter<"PrivateExercise"> | string | null
    createdAt?: DateTimeFilter<"PrivateExercise"> | Date | string
    updatedAt?: DateTimeFilter<"PrivateExercise"> | Date | string
  }

  export type DailyScheduleUpsertWithWhereUniqueWithoutUserInput = {
    where: DailyScheduleWhereUniqueInput
    update: XOR<DailyScheduleUpdateWithoutUserInput, DailyScheduleUncheckedUpdateWithoutUserInput>
    create: XOR<DailyScheduleCreateWithoutUserInput, DailyScheduleUncheckedCreateWithoutUserInput>
  }

  export type DailyScheduleUpdateWithWhereUniqueWithoutUserInput = {
    where: DailyScheduleWhereUniqueInput
    data: XOR<DailyScheduleUpdateWithoutUserInput, DailyScheduleUncheckedUpdateWithoutUserInput>
  }

  export type DailyScheduleUpdateManyWithWhereWithoutUserInput = {
    where: DailyScheduleScalarWhereInput
    data: XOR<DailyScheduleUpdateManyMutationInput, DailyScheduleUncheckedUpdateManyWithoutUserInput>
  }

  export type DailyScheduleScalarWhereInput = {
    AND?: DailyScheduleScalarWhereInput | DailyScheduleScalarWhereInput[]
    OR?: DailyScheduleScalarWhereInput[]
    NOT?: DailyScheduleScalarWhereInput | DailyScheduleScalarWhereInput[]
    id?: StringFilter<"DailySchedule"> | string
    userId?: StringFilter<"DailySchedule"> | string
    dateString?: StringFilter<"DailySchedule"> | string
    weekNumber?: IntFilter<"DailySchedule"> | number
    year?: IntFilter<"DailySchedule"> | number
    dayStatus?: EnumDayStatusFilter<"DailySchedule"> | $Enums.DayStatus
    createdAt?: DateTimeFilter<"DailySchedule"> | Date | string
    updatedAt?: DateTimeFilter<"DailySchedule"> | Date | string
  }

  export type ScheduleItemCreateWithoutGymMasterInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule: DailyScheduleCreateNestedOneWithoutItemsInput
    runningMaster?: RunningExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    privateExercise?: PrivateExerciseCreateNestedOneWithoutScheduleItemsInput
  }

  export type ScheduleItemUncheckedCreateWithoutGymMasterInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemCreateOrConnectWithoutGymMasterInput = {
    where: ScheduleItemWhereUniqueInput
    create: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput>
  }

  export type ScheduleItemCreateManyGymMasterInputEnvelope = {
    data: ScheduleItemCreateManyGymMasterInput | ScheduleItemCreateManyGymMasterInput[]
    skipDuplicates?: boolean
  }

  export type ScheduleItemUpsertWithWhereUniqueWithoutGymMasterInput = {
    where: ScheduleItemWhereUniqueInput
    update: XOR<ScheduleItemUpdateWithoutGymMasterInput, ScheduleItemUncheckedUpdateWithoutGymMasterInput>
    create: XOR<ScheduleItemCreateWithoutGymMasterInput, ScheduleItemUncheckedCreateWithoutGymMasterInput>
  }

  export type ScheduleItemUpdateWithWhereUniqueWithoutGymMasterInput = {
    where: ScheduleItemWhereUniqueInput
    data: XOR<ScheduleItemUpdateWithoutGymMasterInput, ScheduleItemUncheckedUpdateWithoutGymMasterInput>
  }

  export type ScheduleItemUpdateManyWithWhereWithoutGymMasterInput = {
    where: ScheduleItemScalarWhereInput
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyWithoutGymMasterInput>
  }

  export type ScheduleItemScalarWhereInput = {
    AND?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
    OR?: ScheduleItemScalarWhereInput[]
    NOT?: ScheduleItemScalarWhereInput | ScheduleItemScalarWhereInput[]
    id?: StringFilter<"ScheduleItem"> | string
    scheduleId?: StringFilter<"ScheduleItem"> | string
    sequenceOrder?: IntFilter<"ScheduleItem"> | number
    sportType?: StringFilter<"ScheduleItem"> | string
    isPrivateExercise?: BoolFilter<"ScheduleItem"> | boolean
    gymMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    runningMasterId?: StringNullableFilter<"ScheduleItem"> | string | null
    privateExerciseId?: StringNullableFilter<"ScheduleItem"> | string | null
    gymPayload?: JsonNullableFilter<"ScheduleItem">
    runningPayload?: JsonNullableFilter<"ScheduleItem">
    createdAt?: DateTimeFilter<"ScheduleItem"> | Date | string
    updatedAt?: DateTimeFilter<"ScheduleItem"> | Date | string
  }

  export type ScheduleItemCreateWithoutRunningMasterInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule: DailyScheduleCreateNestedOneWithoutItemsInput
    gymMaster?: GymExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    privateExercise?: PrivateExerciseCreateNestedOneWithoutScheduleItemsInput
  }

  export type ScheduleItemUncheckedCreateWithoutRunningMasterInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemCreateOrConnectWithoutRunningMasterInput = {
    where: ScheduleItemWhereUniqueInput
    create: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput>
  }

  export type ScheduleItemCreateManyRunningMasterInputEnvelope = {
    data: ScheduleItemCreateManyRunningMasterInput | ScheduleItemCreateManyRunningMasterInput[]
    skipDuplicates?: boolean
  }

  export type ScheduleItemUpsertWithWhereUniqueWithoutRunningMasterInput = {
    where: ScheduleItemWhereUniqueInput
    update: XOR<ScheduleItemUpdateWithoutRunningMasterInput, ScheduleItemUncheckedUpdateWithoutRunningMasterInput>
    create: XOR<ScheduleItemCreateWithoutRunningMasterInput, ScheduleItemUncheckedCreateWithoutRunningMasterInput>
  }

  export type ScheduleItemUpdateWithWhereUniqueWithoutRunningMasterInput = {
    where: ScheduleItemWhereUniqueInput
    data: XOR<ScheduleItemUpdateWithoutRunningMasterInput, ScheduleItemUncheckedUpdateWithoutRunningMasterInput>
  }

  export type ScheduleItemUpdateManyWithWhereWithoutRunningMasterInput = {
    where: ScheduleItemScalarWhereInput
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyWithoutRunningMasterInput>
  }

  export type UserCreateWithoutPrivateExercisesInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    dailySchedules?: DailyScheduleCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPrivateExercisesInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    dailySchedules?: DailyScheduleUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPrivateExercisesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPrivateExercisesInput, UserUncheckedCreateWithoutPrivateExercisesInput>
  }

  export type ScheduleItemCreateWithoutPrivateExerciseInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule: DailyScheduleCreateNestedOneWithoutItemsInput
    gymMaster?: GymExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    runningMaster?: RunningExerciseMasterCreateNestedOneWithoutScheduleItemsInput
  }

  export type ScheduleItemUncheckedCreateWithoutPrivateExerciseInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemCreateOrConnectWithoutPrivateExerciseInput = {
    where: ScheduleItemWhereUniqueInput
    create: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput>
  }

  export type ScheduleItemCreateManyPrivateExerciseInputEnvelope = {
    data: ScheduleItemCreateManyPrivateExerciseInput | ScheduleItemCreateManyPrivateExerciseInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutPrivateExercisesInput = {
    update: XOR<UserUpdateWithoutPrivateExercisesInput, UserUncheckedUpdateWithoutPrivateExercisesInput>
    create: XOR<UserCreateWithoutPrivateExercisesInput, UserUncheckedCreateWithoutPrivateExercisesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPrivateExercisesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPrivateExercisesInput, UserUncheckedUpdateWithoutPrivateExercisesInput>
  }

  export type UserUpdateWithoutPrivateExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailySchedules?: DailyScheduleUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPrivateExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailySchedules?: DailyScheduleUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ScheduleItemUpsertWithWhereUniqueWithoutPrivateExerciseInput = {
    where: ScheduleItemWhereUniqueInput
    update: XOR<ScheduleItemUpdateWithoutPrivateExerciseInput, ScheduleItemUncheckedUpdateWithoutPrivateExerciseInput>
    create: XOR<ScheduleItemCreateWithoutPrivateExerciseInput, ScheduleItemUncheckedCreateWithoutPrivateExerciseInput>
  }

  export type ScheduleItemUpdateWithWhereUniqueWithoutPrivateExerciseInput = {
    where: ScheduleItemWhereUniqueInput
    data: XOR<ScheduleItemUpdateWithoutPrivateExerciseInput, ScheduleItemUncheckedUpdateWithoutPrivateExerciseInput>
  }

  export type ScheduleItemUpdateManyWithWhereWithoutPrivateExerciseInput = {
    where: ScheduleItemScalarWhereInput
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyWithoutPrivateExerciseInput>
  }

  export type UserCreateWithoutDailySchedulesInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    privateExercises?: PrivateExerciseCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDailySchedulesInput = {
    id?: string
    email: string
    name?: string | null
    googleId?: string | null
    avatarUrl?: string | null
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    privateExercises?: PrivateExerciseUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDailySchedulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDailySchedulesInput, UserUncheckedCreateWithoutDailySchedulesInput>
  }

  export type ScheduleItemCreateWithoutScheduleInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    gymMaster?: GymExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    runningMaster?: RunningExerciseMasterCreateNestedOneWithoutScheduleItemsInput
    privateExercise?: PrivateExerciseCreateNestedOneWithoutScheduleItemsInput
  }

  export type ScheduleItemUncheckedCreateWithoutScheduleInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemCreateOrConnectWithoutScheduleInput = {
    where: ScheduleItemWhereUniqueInput
    create: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput>
  }

  export type ScheduleItemCreateManyScheduleInputEnvelope = {
    data: ScheduleItemCreateManyScheduleInput | ScheduleItemCreateManyScheduleInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutDailySchedulesInput = {
    update: XOR<UserUpdateWithoutDailySchedulesInput, UserUncheckedUpdateWithoutDailySchedulesInput>
    create: XOR<UserCreateWithoutDailySchedulesInput, UserUncheckedCreateWithoutDailySchedulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDailySchedulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDailySchedulesInput, UserUncheckedUpdateWithoutDailySchedulesInput>
  }

  export type UserUpdateWithoutDailySchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    privateExercises?: PrivateExerciseUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDailySchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    googleId?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    privateExercises?: PrivateExerciseUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ScheduleItemUpsertWithWhereUniqueWithoutScheduleInput = {
    where: ScheduleItemWhereUniqueInput
    update: XOR<ScheduleItemUpdateWithoutScheduleInput, ScheduleItemUncheckedUpdateWithoutScheduleInput>
    create: XOR<ScheduleItemCreateWithoutScheduleInput, ScheduleItemUncheckedCreateWithoutScheduleInput>
  }

  export type ScheduleItemUpdateWithWhereUniqueWithoutScheduleInput = {
    where: ScheduleItemWhereUniqueInput
    data: XOR<ScheduleItemUpdateWithoutScheduleInput, ScheduleItemUncheckedUpdateWithoutScheduleInput>
  }

  export type ScheduleItemUpdateManyWithWhereWithoutScheduleInput = {
    where: ScheduleItemScalarWhereInput
    data: XOR<ScheduleItemUpdateManyMutationInput, ScheduleItemUncheckedUpdateManyWithoutScheduleInput>
  }

  export type DailyScheduleCreateWithoutItemsInput = {
    id?: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDailySchedulesInput
  }

  export type DailyScheduleUncheckedCreateWithoutItemsInput = {
    id?: string
    userId: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyScheduleCreateOrConnectWithoutItemsInput = {
    where: DailyScheduleWhereUniqueInput
    create: XOR<DailyScheduleCreateWithoutItemsInput, DailyScheduleUncheckedCreateWithoutItemsInput>
  }

  export type GymExerciseMasterCreateWithoutScheduleItemsInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterCreatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    garminExerciseEnum?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GymExerciseMasterUncheckedCreateWithoutScheduleItemsInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    targetMuscleGroup: $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterCreatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    garminExerciseEnum?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GymExerciseMasterCreateOrConnectWithoutScheduleItemsInput = {
    where: GymExerciseMasterWhereUniqueInput
    create: XOR<GymExerciseMasterCreateWithoutScheduleItemsInput, GymExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
  }

  export type RunningExerciseMasterCreateWithoutScheduleItemsInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    workoutStructure: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RunningExerciseMasterUncheckedCreateWithoutScheduleItemsInput = {
    id?: string
    isActive?: boolean
    name: string
    vietnameseName: string
    runningType: $Enums.RunningType
    youtubeEmbedUrl?: string | null
    gifUrl?: string | null
    instructions: JsonNullValueInput | InputJsonValue
    workoutStructure: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RunningExerciseMasterCreateOrConnectWithoutScheduleItemsInput = {
    where: RunningExerciseMasterWhereUniqueInput
    create: XOR<RunningExerciseMasterCreateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
  }

  export type PrivateExerciseCreateWithoutScheduleItemsInput = {
    id?: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPrivateExercisesInput
  }

  export type PrivateExerciseUncheckedCreateWithoutScheduleItemsInput = {
    id?: string
    userId: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PrivateExerciseCreateOrConnectWithoutScheduleItemsInput = {
    where: PrivateExerciseWhereUniqueInput
    create: XOR<PrivateExerciseCreateWithoutScheduleItemsInput, PrivateExerciseUncheckedCreateWithoutScheduleItemsInput>
  }

  export type DailyScheduleUpsertWithoutItemsInput = {
    update: XOR<DailyScheduleUpdateWithoutItemsInput, DailyScheduleUncheckedUpdateWithoutItemsInput>
    create: XOR<DailyScheduleCreateWithoutItemsInput, DailyScheduleUncheckedCreateWithoutItemsInput>
    where?: DailyScheduleWhereInput
  }

  export type DailyScheduleUpdateToOneWithWhereWithoutItemsInput = {
    where?: DailyScheduleWhereInput
    data: XOR<DailyScheduleUpdateWithoutItemsInput, DailyScheduleUncheckedUpdateWithoutItemsInput>
  }

  export type DailyScheduleUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDailySchedulesNestedInput
  }

  export type DailyScheduleUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GymExerciseMasterUpsertWithoutScheduleItemsInput = {
    update: XOR<GymExerciseMasterUpdateWithoutScheduleItemsInput, GymExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
    create: XOR<GymExerciseMasterCreateWithoutScheduleItemsInput, GymExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    where?: GymExerciseMasterWhereInput
  }

  export type GymExerciseMasterUpdateToOneWithWhereWithoutScheduleItemsInput = {
    where?: GymExerciseMasterWhereInput
    data: XOR<GymExerciseMasterUpdateWithoutScheduleItemsInput, GymExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type GymExerciseMasterUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GymExerciseMasterUncheckedUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: EnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup
    secondaryMuscleGroups?: GymExerciseMasterUpdatesecondaryMuscleGroupsInput | string[]
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    garminExerciseEnum?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RunningExerciseMasterUpsertWithoutScheduleItemsInput = {
    update: XOR<RunningExerciseMasterUpdateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
    create: XOR<RunningExerciseMasterCreateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedCreateWithoutScheduleItemsInput>
    where?: RunningExerciseMasterWhereInput
  }

  export type RunningExerciseMasterUpdateToOneWithWhereWithoutScheduleItemsInput = {
    where?: RunningExerciseMasterWhereInput
    data: XOR<RunningExerciseMasterUpdateWithoutScheduleItemsInput, RunningExerciseMasterUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type RunningExerciseMasterUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RunningExerciseMasterUncheckedUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    name?: StringFieldUpdateOperationsInput | string
    vietnameseName?: StringFieldUpdateOperationsInput | string
    runningType?: EnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType
    youtubeEmbedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: JsonNullValueInput | InputJsonValue
    workoutStructure?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PrivateExerciseUpsertWithoutScheduleItemsInput = {
    update: XOR<PrivateExerciseUpdateWithoutScheduleItemsInput, PrivateExerciseUncheckedUpdateWithoutScheduleItemsInput>
    create: XOR<PrivateExerciseCreateWithoutScheduleItemsInput, PrivateExerciseUncheckedCreateWithoutScheduleItemsInput>
    where?: PrivateExerciseWhereInput
  }

  export type PrivateExerciseUpdateToOneWithWhereWithoutScheduleItemsInput = {
    where?: PrivateExerciseWhereInput
    data: XOR<PrivateExerciseUpdateWithoutScheduleItemsInput, PrivateExerciseUncheckedUpdateWithoutScheduleItemsInput>
  }

  export type PrivateExerciseUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPrivateExercisesNestedInput
  }

  export type PrivateExerciseUncheckedUpdateWithoutScheduleItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogCategoryCreateWithoutPostsInput = {
    id?: string
    key: string
    label: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogCategoryUncheckedCreateWithoutPostsInput = {
    id?: string
    key: string
    label: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogCategoryCreateOrConnectWithoutPostsInput = {
    where: BlogCategoryWhereUniqueInput
    create: XOR<BlogCategoryCreateWithoutPostsInput, BlogCategoryUncheckedCreateWithoutPostsInput>
  }

  export type BlogCategoryUpsertWithoutPostsInput = {
    update: XOR<BlogCategoryUpdateWithoutPostsInput, BlogCategoryUncheckedUpdateWithoutPostsInput>
    create: XOR<BlogCategoryCreateWithoutPostsInput, BlogCategoryUncheckedCreateWithoutPostsInput>
    where?: BlogCategoryWhereInput
  }

  export type BlogCategoryUpdateToOneWithWhereWithoutPostsInput = {
    where?: BlogCategoryWhereInput
    data: XOR<BlogCategoryUpdateWithoutPostsInput, BlogCategoryUncheckedUpdateWithoutPostsInput>
  }

  export type BlogCategoryUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogCategoryUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateWithoutCategoryInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUncheckedCreateWithoutCategoryInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostCreateOrConnectWithoutCategoryInput = {
    where: BlogPostWhereUniqueInput
    create: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput>
  }

  export type BlogPostCreateManyCategoryInputEnvelope = {
    data: BlogPostCreateManyCategoryInput | BlogPostCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type BlogPostUpsertWithWhereUniqueWithoutCategoryInput = {
    where: BlogPostWhereUniqueInput
    update: XOR<BlogPostUpdateWithoutCategoryInput, BlogPostUncheckedUpdateWithoutCategoryInput>
    create: XOR<BlogPostCreateWithoutCategoryInput, BlogPostUncheckedCreateWithoutCategoryInput>
  }

  export type BlogPostUpdateWithWhereUniqueWithoutCategoryInput = {
    where: BlogPostWhereUniqueInput
    data: XOR<BlogPostUpdateWithoutCategoryInput, BlogPostUncheckedUpdateWithoutCategoryInput>
  }

  export type BlogPostUpdateManyWithWhereWithoutCategoryInput = {
    where: BlogPostScalarWhereInput
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyWithoutCategoryInput>
  }

  export type BlogPostScalarWhereInput = {
    AND?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
    OR?: BlogPostScalarWhereInput[]
    NOT?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
    id?: StringFilter<"BlogPost"> | string
    title?: StringFilter<"BlogPost"> | string
    slug?: StringFilter<"BlogPost"> | string
    excerpt?: StringFilter<"BlogPost"> | string
    content?: StringFilter<"BlogPost"> | string
    coverImage?: StringNullableFilter<"BlogPost"> | string | null
    tags?: StringNullableListFilter<"BlogPost">
    categoryKey?: StringNullableFilter<"BlogPost"> | string | null
    status?: StringFilter<"BlogPost"> | string
    readingTime?: IntFilter<"BlogPost"> | number
    publishedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    authorId?: StringNullableFilter<"BlogPost"> | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
  }

  export type PrivateExerciseCreateManyUserInput = {
    id?: string
    isActive?: boolean
    sportType: string
    name: string
    targetMuscleGroup?: $Enums.MuscleGroup | null
    runningType?: $Enums.RunningType | null
    customNotes?: string | null
    gifUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyScheduleCreateManyUserInput = {
    id?: string
    dateString: string
    weekNumber: number
    year: number
    dayStatus?: $Enums.DayStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PrivateExerciseUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUpdateManyWithoutPrivateExerciseNestedInput
  }

  export type PrivateExerciseUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleItems?: ScheduleItemUncheckedUpdateManyWithoutPrivateExerciseNestedInput
  }

  export type PrivateExerciseUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sportType?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    targetMuscleGroup?: NullableEnumMuscleGroupFieldUpdateOperationsInput | $Enums.MuscleGroup | null
    runningType?: NullableEnumRunningTypeFieldUpdateOperationsInput | $Enums.RunningType | null
    customNotes?: NullableStringFieldUpdateOperationsInput | string | null
    gifUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyScheduleUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ScheduleItemUpdateManyWithoutScheduleNestedInput
  }

  export type DailyScheduleUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ScheduleItemUncheckedUpdateManyWithoutScheduleNestedInput
  }

  export type DailyScheduleUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    dateString?: StringFieldUpdateOperationsInput | string
    weekNumber?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    dayStatus?: EnumDayStatusFieldUpdateOperationsInput | $Enums.DayStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateManyGymMasterInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateWithoutGymMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: DailyScheduleUpdateOneRequiredWithoutItemsNestedInput
    runningMaster?: RunningExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    privateExercise?: PrivateExerciseUpdateOneWithoutScheduleItemsNestedInput
  }

  export type ScheduleItemUncheckedUpdateWithoutGymMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemUncheckedUpdateManyWithoutGymMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateManyRunningMasterInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateWithoutRunningMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: DailyScheduleUpdateOneRequiredWithoutItemsNestedInput
    gymMaster?: GymExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    privateExercise?: PrivateExerciseUpdateOneWithoutScheduleItemsNestedInput
  }

  export type ScheduleItemUncheckedUpdateWithoutRunningMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemUncheckedUpdateManyWithoutRunningMasterInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateManyPrivateExerciseInput = {
    id?: string
    scheduleId: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateWithoutPrivateExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: DailyScheduleUpdateOneRequiredWithoutItemsNestedInput
    gymMaster?: GymExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    runningMaster?: RunningExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
  }

  export type ScheduleItemUncheckedUpdateWithoutPrivateExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemUncheckedUpdateManyWithoutPrivateExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemCreateManyScheduleInput = {
    id?: string
    sequenceOrder: number
    sportType: string
    isPrivateExercise?: boolean
    gymMasterId?: string | null
    runningMasterId?: string | null
    privateExerciseId?: string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ScheduleItemUpdateWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gymMaster?: GymExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    runningMaster?: RunningExerciseMasterUpdateOneWithoutScheduleItemsNestedInput
    privateExercise?: PrivateExerciseUpdateOneWithoutScheduleItemsNestedInput
  }

  export type ScheduleItemUncheckedUpdateWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleItemUncheckedUpdateManyWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    sequenceOrder?: IntFieldUpdateOperationsInput | number
    sportType?: StringFieldUpdateOperationsInput | string
    isPrivateExercise?: BoolFieldUpdateOperationsInput | boolean
    gymMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    runningMasterId?: NullableStringFieldUpdateOperationsInput | string | null
    privateExerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    gymPayload?: NullableJsonNullValueInput | InputJsonValue
    runningPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateManyCategoryInput = {
    id?: string
    title: string
    slug: string
    excerpt?: string
    content?: string
    coverImage?: string | null
    tags?: BlogPostCreatetagsInput | string[]
    status?: string
    readingTime?: number
    publishedAt?: Date | string | null
    authorId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    coverImage?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: BlogPostUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    readingTime?: IntFieldUpdateOperationsInput | number
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}