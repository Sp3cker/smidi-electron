import Foundation

// actor ConcurrencyLimiter {
//   private let limit: UInt8
//   private var inFlight: UInt8 = 0
//   private var waiters: [CheckedContinuation<Void, Never>] = []

//   init(limit: UInt8) { self.limit = limit }

//   func acquire() async {
//     if inFlight < limit {
//       inFlight += 1
//       return
//     }
//     await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
//       waiters.append(cont)
//     }
//     inFlight += 1
//   }

//   func release() {
//     inFlight -= 1
//     if !waiters.isEmpty {
//       let cont = waiters.removeFirst()
//       cont.resume()
//     }
//   }
// }

public actor FilePrefetcher {

  // private var tasks: [URL: Task<String, Error>] = [:]
  // private let limiter = ConcurrencyLimiter(limit: 20)

  public init() {}

  public func prefetch(from url: URL) -> Task<String, Error> {
    // if let existing = tasks[url] {return existing}
    // Capture the limiter outside the detached task to avoid extra hops
    // let limiter = self.limiter
    return Task.detached() { () async throws -> String in
      // let task = Task.detached(priority: .utility) {() async throws -> String in
      return try String(contentsOf: url, encoding: .utf8)
      // await self.limiter.acquire()
      // defer { Task { await self.limiter.release() } }
      // memory-map for speed and memory efficiency
    }
    // tasks[url] = task
    // return task
  }
}
