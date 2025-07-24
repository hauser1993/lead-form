declare module '@ballerine/web-ui-sdk' {
  export interface BallerineSDKFlows {
    init(config: any): Promise<void>
    mount(options: {
      flowName: string
      elementId: string
      useModal?: boolean
    }): void
  }

  export const flows: BallerineSDKFlows
} 