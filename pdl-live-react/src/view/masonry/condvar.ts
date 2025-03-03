export default class ConditionVariable {
  private condition: boolean = false
  private waitingPromises: {
    resolve: () => void
    reject: (reason?: unknown) => void
  }[] = []

  public async wait(): Promise<void> {
    if (this.condition) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.waitingPromises.push({ resolve, reject })
    })
  }

  public signal(): void {
    if (this.waitingPromises.length > 0) {
      const { resolve } = this.waitingPromises.shift()!
      resolve()
      this.condition = true
    }
  }

  public reset(): void {
    this.condition = false
  }
}
