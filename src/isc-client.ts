import {
    AccessRequestItem,
    AccessRequestItemTypeV3,
    AccessRequestResponse,
    AccessRequestsApi,
    AccessRequestsApiCreateAccessRequestRequest,
    AccessRequestType,
    Account,
    AccountsApi,
    AccountsApiListAccountsRequest,
    Configuration,
    ConfigurationParameters,
    EntitlementsV2025Api,
    EntitlementsV2025ApiGetEntitlementRequest,
    EntitlementsV2025ApiPatchEntitlementRequest,
    EntitlementV2025,
    IdentityDocument,
    Index,
    JsonPatchOperationV2025,
    Paginator,
    PublicIdentitiesConfigApi,
    PublicIdentityConfig,
    Schema,
    Search,
    SearchApi,
    SearchDocument,
    SourcesApi,
    SourcesApiCreateSourceSchemaRequest,
} from 'sailpoint-api-client'
import { TOKEN_URL_PATH } from './data/constants'
import { Config } from './model/config'
import { logger } from '@sailpoint/connector-sdk'

export class ISCClient {
    private config: Configuration

    constructor(config: Config) {
        const conf: ConfigurationParameters = {
            baseurl: config.baseurl,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            tokenUrl: new URL(config.baseurl).origin + TOKEN_URL_PATH,
        }
        this.config = new Configuration(conf)
        this.config.experimental = true
    }

    async getPublicIdentityConfig(): Promise<PublicIdentityConfig> {
        const api = new PublicIdentitiesConfigApi(this.config)

        const response = await api.getPublicIdentityConfig()

        return response.data
    }

    async listSources() {
        const api = new SourcesApi(this.config)

        const response = await Paginator.paginate(api, api.listSources)

        return response.data
    }

    async listSourceSchemas(sourceId: string): Promise<Schema[]> {
        const api = new SourcesApi(this.config)

        const response = await api.getSourceSchemas({ sourceId })

        return response.data
    }

    async createSchema(schema: Schema, sourceId: string): Promise<Schema> {
        const api = new SourcesApi(this.config)

        const requestParameters: SourcesApiCreateSourceSchemaRequest = {
            schema,
            sourceId,
        }

        const response = await api.createSourceSchema(requestParameters)

        return response.data
    }

    async search(query: string, index: Index): Promise<SearchDocument[]> {
        const api = new SearchApi(this.config)
        const search: Search = {
            indices: [index],
            query: {
                query,
            },
            sort: ['id'],
            includeNested: true,
        }

        const response = await Paginator.paginateSearchApi(api, search)
        return response.data as SearchDocument[]
    }

    async getIdentity(id: string): Promise<IdentityDocument | undefined> {
        const api = new SearchApi(this.config)
        const search: Search = {
            indices: ['identities'],
            query: {
                query: `id:${id}`,
            },
            includeNested: true,
        }

        const response = await api.searchPost({ search })

        if (response.data.length > 0) {
            return response.data[0] as IdentityDocument
        } else {
            return undefined
        }
    }

    async getIdentityByUid(name: string): Promise<IdentityDocument | undefined> {
        const api = new SearchApi(this.config)
        const search: Search = {
            indices: ['identities'],
            query: {
                query: `attributes.uid.exact:${name}`,
            },
            includeNested: true,
        }

        const response = await api.searchPost({ search })

        if (response.data.length > 0) {
            return response.data[0] as IdentityDocument
        } else {
            return undefined
        }
    }

    async getAccount(nativeIdentity: string): Promise<Account | undefined> {
        const api = new AccountsApi(this.config)

        const requestParameters: AccountsApiListAccountsRequest = {
            filters: `nativeIdentity eq ${nativeIdentity}`,
        }

        const response = await api.listAccounts(requestParameters)

        if (response.data.length > 0) {
            return response.data[0]
        } else {
            return undefined
        }
    }

    async createAccessRequest(
        identity: string,
        entitlements: string[],
        requestType: AccessRequestType,
        comment: string
    ): Promise<AccessRequestResponse> {
        const api = new AccessRequestsApi(this.config)

        const requestedItems: AccessRequestItem[] = entitlements.map((x) => ({
            id: x,
            type: AccessRequestItemTypeV3.Entitlement,
            comment,
        }))

        const requestParameters: AccessRequestsApiCreateAccessRequestRequest = {
            accessRequest: {
                requestedFor: [identity],
                requestType,
                requestedItems,
            },
        }

        const response = await api.createAccessRequest(requestParameters)

        return response.data
    }

    async getEntitlement(id: string): Promise<EntitlementV2025> {
        const api = new EntitlementsV2025Api(this.config)

        const requestParameters: EntitlementsV2025ApiGetEntitlementRequest = {
            id,
            xSailPointExperimental: 'true',
        }

        const response = await api.getEntitlement(requestParameters)

        return response.data
    }

    async patchEntitlement(id: string, patch: JsonPatchOperationV2025[]): Promise<EntitlementV2025> {
        const api = new EntitlementsV2025Api(this.config)

        const requestParameters: EntitlementsV2025ApiPatchEntitlementRequest = {
            id,
            xSailPointExperimental: 'true',
            jsonPatchOperationV2025: patch,
        }

        const response = await api.patchEntitlement(requestParameters)

        return response.data
    }
}
