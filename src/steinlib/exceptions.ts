class SteinlibParsingException extends Error {
  /**
   * This is the generic exception for the overall parsing process. If there is
   * something wrong, this will be raised.
   */
  constructor(message: string) {
    super(message);
    this.name = "SteinlibParsingException";
  }
}

class UnrecognizedSectionException extends SteinlibParsingException {
  /**
   * This exception is raised when an unknown section name is found.
   */
  constructor(message: string) {
    super(message);
    this.name = "UnrecognizedSectionException";
  }
}

export { SteinlibParsingException, UnrecognizedSectionException };
