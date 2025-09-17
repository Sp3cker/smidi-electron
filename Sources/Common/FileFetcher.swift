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
  public init() {}
  public func prefetch(from url: URL) -> Task<String, Error> {
    return Task.detached() { () async throws -> String in
      return try String(contentsOf: url, encoding: .utf8)

    }
  }
}
