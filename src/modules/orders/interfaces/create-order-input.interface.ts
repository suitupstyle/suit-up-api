export interface CreateOrderInput {
    preorderId: string
    orderType: string
    orderQuantity: number
    orderLeadTime: number
    customerName: string
    customerEmail: string
    customerPassword: string
    customerHeight: number
    customerWeight: string
    jacketBook: string
    jacketFabric: string
}
