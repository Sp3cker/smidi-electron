# node-swift Reference

This file summarizes the `node-swift` runtime and macro package so another LLM can reason about the codebase without rereading it. Paths are relative to `~/Library/Developer/Xcode/DerivedData/smidi-xcode-bfjxxzzzntsweagvcbkljdocpkno/SourcePackages/checkouts/node-swift` unless stated otherwise.

---

## High-Level Architecture
- `NodeAPI` target exposes Swift wrappers around Node-API (N-API) concepts: values, functions, environments, async queues.
- `NodeAPIMacros` target provides Swift macros (`#NodeModule`, `#NodeClass`, etc.) that generate boilerplate for exporting Swift code to Node.
- Core idea: Swift code runs on a `NodeActor`, interacting with Node’s event loop via `NodeEnvironment` and `NodeContext` helpers. Swift values convert to/from JS values lazily through `NodeValueConvertible`.

### Module Registration Flow
1. A Swift source file imports `NodeAPI` and annotates with `#NodeModule` (see `Sources/module/module.swift` in this repo for usage).
2. `#NodeModule` expands to a C entry point (`node_swift_register`) returning a pointer from `NodeModuleRegistrar.register`.
3. `NodeModuleRegistrar.register(init:)` executes the provided closure inside a `NodeContext` bound to the Node environment and returns the raw JS value to Node.

---

## Runtime Contexts & Actors
- `NodeActor` (attribute defined in NodeAPI) isolates APIs that must run on Node’s JS thread. Many public entry points are annotated with `@NodeActor` or require callers to hop onto it using `NodeContext.runOnActor`.
- `NodeContext` (Sources/NodeAPI/NodeContext.swift) tracks N-API handles created during a call from JS into Swift. It ensures values persist correctly across the JS ↔ Swift boundary, using reference counting and optional boxing for non-objects.
- `NodeEnvironment` (Sources/NodeAPI/NodeEnvironment.swift) wraps `napi_env` with ergonomic helpers:
  - `global` property returns the global object (`Promise`, `process`, etc.).
  - `addCleanupHook` and `NodeAsyncQueue` integration for scheduling work back on Node’s loop.
  - Convenience subscripts to access global properties (`NodeEnvironment.current.console`).

### Memory & Lifetime Rules
- Values created inside a `NodeContext` are tracked; at the end of the call, non-escaped values are released.
- Escaping a value (returning it or persisting it) requires calling `NodeValueBase.persist`—handled automatically when returning from exported functions.
- `NodeDeferredValue` lets you pass values that will be materialized lazily on the Node actor.

---

## Core Value Types
_All conform to `NodeValue` and live in `Sources/NodeAPI`._

- `NodeValueBase`: thin wrapper that owns a `napi_value` and remembers its environment.
- `NodeValueConvertible`: protocol for anything that can be marshaled to JS. Includes helper `rawValue()` to get `napi_value`.
- `AnyNodeValue`: type-erased JS value. Many APIs return `AnyNodeValue` when the concrete type is unknown.
- `NodeObject`: wraps JS objects, giving dynamic member/key subscripts. `NodeObject.DynamicProperty` lazily fetches properties and conforms to `NodeCallable` so you can call methods as functions.
- `NodeFunction`: subclass of `NodeObject` representing JS functions. Offers:
  - `call(on:_:)` to invoke with explicit receiver/arguments.
  - `construct(withArguments:)` to do `new Fn(...)`.
  - Convenience inits to build Swift callbacks (sync/async, void/returning).
- `NodePromise`, `NodeArray`, `NodeBuffer`, etc., mirror JS built-ins.

### NodeCallable Protocol
- Any callable JS value conforms to `NodeCallable` (dynamic callable). When you call `try value.dynamicallyCall(withArguments: [...])`, the implementation ensures the value truly is a function; otherwise, it throws `NodeAPIError(.functionExpected)` with message “Cannot call a non-function”.
- `NodeCallable.receiver` defaults to `undefined`, but `NodeObject.DynamicProperty` overrides it so `object["method"]` retains `object` as `this` when invoked.

---

## Macros & Generated APIs
- `#NodeModule(exports:)` (Sources/NodeAPIMacros/NodeModuleMacro.swift) wraps the provided expression in a closure and registers it via `NodeModuleRegistrar`. The expansion generates:
  ```swift
  @_cdecl("node_swift_register")
  public func __macro_local_register(env: OpaquePointer) -> OpaquePointer? {
      NodeAPI.NodeModuleRegistrar(env).register { /* exports */ }
  }
  ```
- `#NodeClass`, `#NodeMethod`, `#NodeProperty`, `#NodeConstructor` macros (Sources/NodeAPIMacros) build JS classes backed by Swift types with automatic property/method exposure.
- Tests in `Tests/NodeAPIMacrosTests` show expected expansions for reference.

---

## Creating Functions Exported to Node
Pattern (see README example and `Sources/module/module.swift`):

```swift
#NodeModule(exports: [
  "myConst": 42,
  "myFn": try NodeFunction { (a: Double, b: Double) in
    a + b
  },
  "myAsyncFn": try NodeFunction { (path: String) async throws -> String in
    try await Task.sleep(nanoseconds: 1_000)
    return "done"
  },
])
```

Notes:
- `NodeFunction` closures receive `NodeArguments` inferred from parameter list (requires types conforming to `AnyNodeValueCreatable`, including most built-ins and `String`/`Double`).
- Async callbacks automatically return JS Promises via `NodePromise` bridging.

---

## Accessing JS Objects from Swift
- `NodeEnvironment.current.global` returns the global object.
- Access properties dynamically: `try env.global["console"].log.call(["hello"])`.
- Import modules:
  - Native Node global `require` isn’t always present (e.g., Electron preload). `process.mainModule.require` can be used instead: fetch `process` -> `mainModule` -> `require` and call it with `call(on: mainModule, ["module"])`.
  - The `NodeCallable` contract requires you to check conversions: use `guard let fn = try value.as(NodeFunction.self)` before calling.

### Example: EventEmitter from Swift
```swift
let env = NodeEnvironment.current
let global = try env.global

let requireFn: NodeFunction
if let globalRequire = try global["require"].as(NodeFunction.self) {
    requireFn = globalRequire
} else {
    let process = try global["process"].as(NodeObject.self)
    let mainModule = try process["mainModule"].as(NodeObject.self)
    requireFn = try mainModule["require"].as(NodeFunction.self)
}

let events = try requireFn.call(on: requireFn.receiver, ["node:events"]).as(NodeObject.self)!
let ctor = try events["EventEmitter"].as(NodeFunction.self)!
let emitter = try ctor.construct(withArguments: [])
```
- `NodeObject.DynamicProperty` stores the original receiver, so `try emitter["emit"].as(NodeFunction.self)` can be called without re-binding `this`.

---

## Async & Threading Considerations
- Node expects callbacks to return quickly; avoid `sleep` on the Node actor. Use Swift concurrency (`Task.sleep`, `Task.detached`) plus `NodeAsyncQueue` if you need to hop threads.
- `NodeAsyncQueue` (Sources/NodeAPI/NodeAsyncQueue.swift) wraps `napi_async_context` for scheduling work that will resolve back on Node’s loop.
- If you must run blocking work, offload to a Swift `Task`/thread pool and resolve back via `NodePromise` or callback invocation on the Node actor.

---

## Error Handling Path
- Most `NodeAPI` calls throw `NodeAPIError` when the underlying N-API result isn’t `napi_ok`.
- Pending JS exceptions are converted into `AnyNodeValue` errors. If user code doesn’t catch them, `NodeEnvironment.throwUncaught` rethrows to JS at the top level.
- Exported Swift callbacks should report errors using either thrown errors (caught by NodeSwift and turned into JS exceptions) or by manually invoking Node-style callbacks.

---

## Conversion Helpers
- `AnyNodeValueCreatable` protocol drives automatic argument decoding. Standard Swift types (`String`, numbers, `Bool`, `Data`, etc.) conform via `Sources/NodeAPI/Sugar.swift` and others.
- When reading arguments manually, `NodeArguments` exposes `.this`, `.newTarget`, and supports subscript access to convert to specific types.

---

## Testing & Examples
- `example/` directory contains a simple module: `#NodeModule(exports: [...])` + `example/index.js` to load it.
- Integration tests under `test/suites` build sample modules and exercise features (class macros, promises, etc.).

---

## Common Pitfalls & Workarounds
- **Cannot call a non-function**: occurs when attempting `dynamicallyCall` on a `NodeCallable` that isn’t actually a function. Always unwrap with `try value.as(NodeFunction.self)`.
- **Missing global `require`**: in Electron or modern bundlers, global `require` may be undefined. Use `process.mainModule.require` or inject your own.
- **Blocking Node**: avoid `sleep`/`Thread.sleep`. Use async functions or `NodeAsyncQueue` scheduling.
- **Escaping unmanaged values**: When using `NodeContext.withUnmanagedContext`, ensure returned value is properly persisted; otherwise, `nodeFatalError` triggers in debug builds.

---

## Quick API Cheatsheet
- `NodeEnvironment.current` → current environment.
- `try env.global` → JS global object.
- `try someValue.as(NodeFunction.self)` → optional cast to JS function.
- `try fn.call(on: receiver, args)` → invoke function.
- `try fn.construct(withArguments: args)` → `new fn(... )`.
- `NodeDeferredValue { ... }` → lazily materialized value.
- `NodeAsyncQueue(label:)` → create queue for async tasks.
- `#NodeModule(exports: ...)` → expose Swift values/functions to Node.
- `#NodeClass` + `#NodeMethod` → export Swift classes as JS classes.

---

## References in This Project
- `Sources/module/module.swift`: Real-world use of `NodeEnvironment`, `NodeFunction`, and returning `EventEmitter` instances.
- `src/main/services/Console/ConsoleService.ts`: JS side receiving Swift-exported `EventEmitter` and invoking exported functions.
- `Sources/Core/Keysplits/Keysplits.swift`: Independent parsing utilities (not part of node-swift but interacts with module exports).

---

This document can be updated whenever new node-swift patterns, pitfalls, or helper APIs are discovered during development.
