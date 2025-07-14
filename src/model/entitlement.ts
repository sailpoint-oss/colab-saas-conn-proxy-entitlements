import { Attributes, Permission, StdEntitlementListOutput } from '@sailpoint/connector-sdk'
import { EntitlementDocument } from 'sailpoint-api-client'

export class Entitlement implements StdEntitlementListOutput {
    identity: string
    uuid: string
    type: string = 'entitlement'
    deleted?: boolean | undefined
    attributes: Attributes
    permissions?: Permission[] | undefined

    constructor(entitlementDocument: EntitlementDocument) {
        const source = entitlementDocument.source?.name ?? 'Unknown Source'
        this.attributes = {
            id: entitlementDocument.id,
            name: entitlementDocument.name,
            description: `Proxy entitlement for ${source}`,
        }
        this.identity = entitlementDocument.id
        this.uuid = entitlementDocument.name
    }
}
