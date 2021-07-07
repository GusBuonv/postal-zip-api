interface IZipCodesRegistry {
  /**
   * Test if the zip code is in the registry
   *
   * @param zip Zip code to check
   * @returns Whether or not the code is in the registry
   */
  readonly has: (zip: number) => Promise<boolean>
  /**
   * Adds a zip code to the registry, if it is not already present
   *
   * @param zip The zip code to add
   * @returns Whether the zip code was added to the registry
   */
  readonly insert: (zip: number) => Promise<boolean>
  /**
   * Removes a zip code from the registry, if it is in the registry
   *
   * @param zip Zip code to remove
   * @returns Whether or not the zip code was removed
   */
  readonly delete: (zip: number) => Promise<boolean>
  /**
   * Get the list of zip codes in the registry as a string. Contiguous ranges of
   * zip codes are grouped.
   *
   * @returns The list of zip codes
   */
  readonly display: () => Promise<string>
}

// NOTE: The interface mandates Promise return types for extensibility.
// ZipCodesRegistry stores the list in memory and, thus, doesn't require
// asynchronous execution. However, if we wanted to instead use a persistent
// store, the operations would be asynchronous.
