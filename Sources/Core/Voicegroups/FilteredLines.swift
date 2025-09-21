// struct FilteredFile: Sequence, IteratorProtocol {
//   let text: String
//   var i: String.Index

//   init(text: String) {
//     self.text = text;
//     self.i = text.startIndex
//   }
//   mutating  func next() -> Substring? {
//     while i < text.endIndex {
//       let c = text[i]
//       if c == "\n" {
//         i = text.index(after: i)
//         return Substring(text[i..<text.endIndex])
//       }
//       i = text.index(after: i)
//     }
//     return nil
//   }
// }