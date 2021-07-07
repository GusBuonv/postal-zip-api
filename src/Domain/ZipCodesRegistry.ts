import { formatZipCode } from "../Util/util";

type ZipRange = {
  // WeakRef is used to stop memory leaks. The list would prevent its own
  // garbage collection if prev was a standard reference. Using WeakRef, as soon
  // as the list head has no references outside the list (e.g. when the registry
  // exits scope), the entire list is subject to garbage collection.
  prevRef?: WeakRef<ZipRange>
  next?: ZipRange
  first: number
  last: number
}

export class ZipCodesRegistry implements IZipCodesRegistry {
  /**
   * Get the list of zip codes in the registry as a string. Contiguous ranges of
   * zip codes are grouped.
   *
   * @returns The list of zip codes
   */
  display(): Promise<string> {
    if (!this.displayCache) {
      let result = '';

      let node = this.head;
      while (node) {
        if (node.first === node.last) {
          result += `${formatZipCode(node.first)} `;
        } else {
          result += `${formatZipCode(node.first)}-${formatZipCode(node.last)} `;
        }

        node = node.next;
      }

      this.displayCache = result.trimEnd();
    }

    return Promise.resolve(this.displayCache);
  }

  /**
   * Adds a zip code to the registry, if it is not already present
   *
   * @param zip The zip code to add
   * @returns Whether the zip code was added to the registry
   */
  insert(zip: number): Promise<boolean> {
    // test for existence with quick lookup before expensive insert operation
    if (this.lookup(zip)) {
      return Promise.resolve(false);
    }

    let didInsert = false;
    let prevNode = undefined;
    let node = this.head;
    while (node) {
      const contiguousPrev = node.first - 1
      if (zip < contiguousPrev) {
        // Insert a new node before the current
        const { prevRef } = node;

        const newNode = {
          next: node,
          prevRef,
          first: zip,
          last: zip,
        };

        node.prevRef = new WeakRef(newNode);
        if (prevRef) {
          let prev: ZipRange;
          try {
            prev = this.deref(prevRef);
          } catch (err) {
            return Promise.reject(err);
          }

          prev.next = newNode;
        } else {
          this.head = newNode;
        }

        didInsert = true;
        break;
      } else if (zip === contiguousPrev) {
        // Extend the current node's range backwards
        node.first = zip;
        didInsert = true;
        break;
      } else if (zip === node.last + 1) {
        // New zip is the contiguous next of the current node's range

        if (node.next && zip === (node.next.first - 1)) {
          // Join the current node with the next
          node.last = node.next.last;
          node.next = node.next.next;
          if (node.next) {
            node.next.prevRef = new WeakRef(node);
          }
        } else {
          // Extend the current node's range forwards
          node.last = zip;
        }

        didInsert = true;
        break;
      } else if (zip <= node.last) {
        return Promise.reject(new Error('ZipCodesRegistry has entered a corrupted state'));
      }

      prevNode = node;
      node = node.next;
    }

    if (!didInsert) {
      // Insert new node at the end of the list
      const newNode: ZipRange = {
        first: zip,
        last: zip,
      };

      if (prevNode) {
        newNode.prevRef = new WeakRef(prevNode);
        prevNode.next = newNode;
      } else {
        this.head = newNode;
      }
    }

    if (process.env.DEBUG) {
      console.log(`Inserted zip code: ${formatZipCode(zip)}`);
    }

    this.index[zip] = true;
    this.displayCache = undefined;
    return Promise.resolve(true);
  }

  /**
   * Removes a zip code from the registry, if it is in the registry
   *
   * @param zip Zip code to remove
   * @returns Whether or not the zip code was removed
   */
  delete(zip: number): Promise<boolean> {
    // test for existence with quick lookup before expensive delete operation
    if (!this.lookup(zip)) {
      return Promise.resolve(false);
    }

    let didDelete = false;
    let node = this.head;
    while (node) {
      if (zip < node.first) {
        break; // State is corrupted
      }

      if (zip <= node.last) {
        if (node.first === node.last) {
          // Remove the current node
          const { prevRef, next } = node;
          if (prevRef) {
            let prev: ZipRange;
            try {
              prev = this.deref(prevRef);
            } catch (err) {
              return Promise.reject(err);
            }
            prev.next = next;
          } else {
            this.head = next;
          }

          if (next) {
            next.prevRef = prevRef;
          }
        } else if (node.first === zip) {
          node.first += 1;
        } else if (node.last === zip) {
          node.last -= 1;
        } else {
          // Split the current node at zip
          const { next, last } = node;

          const newNode = {
            next,
            prev: node,
            first: zip + 1,
            last,
          };

          node.next = newNode;
          node.last = zip - 1;

          if (next) {
            next.prevRef = new WeakRef(newNode);
          }
        }

        didDelete = true;
        break;
      }

      // Continue to the next node
      node = node.next;
    }

    if (!didDelete) {
      return Promise.reject(new Error('ZipCodesRegistry has entered a corrupted state'));
    }

    // Update the lookup index
    if (process.env.DEBUG) {
      console.log(`Deleted zip code: ${formatZipCode(zip)}`)
    }
    this.index[zip] = undefined;
    this.displayCache = undefined
    return Promise.resolve(true);
  }

  /**
   * Test if the zip code is in the registry
   *
   * @param zip Zip code to check
   * @returns Whether or not the code is in the registry
   */
  has(zip: number): Promise<boolean> {
    return Promise.resolve(this.lookup(zip));
  }

  private lookup(zip: number): boolean {
    return Boolean(this.index[zip]);
  }

  /**
   * Dereferences a ZipRange WeakRef
   *
   * @param ref Weak reference to a ZipRange
   * @returns The referenced ZipRange
   * @throws {Error} If the reference is stale
   */
  private deref(ref: WeakRef<ZipRange>): ZipRange {
    const val = ref.deref();
    if (!val) {
      this.head = undefined;
      throw new Error("Attempted to access a stale reference");
    }
    return val;
  }

  private displayCache: string | undefined
  private readonly index: Record<number, true | undefined> = {}
  private head?: ZipRange | undefined
}
