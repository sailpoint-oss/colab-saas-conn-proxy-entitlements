import { Attributes, StdAccountListOutput } from '@sailpoint/connector-sdk'
import { IdentityDocument } from 'sailpoint-api-client'

export class Account implements StdAccountListOutput {
    identity: string
    uuid: string
    disabled?: boolean | undefined
    attributes: Attributes

    constructor(identity: IdentityDocument, entitlements: string[]) {
        this.attributes = {
            id: identity.id,
            name: identity.name,
            entitlements: entitlements,
        }
        this.identity = identity.id
        this.uuid = identity.name
    }
}
