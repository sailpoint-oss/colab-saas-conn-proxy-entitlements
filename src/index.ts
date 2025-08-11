import {
    createConnector,
    readConfig,
    logger,
    ConnectorError,
    StdTestConnectionHandler,
    StdEntitlementListHandler,
    StdAccountCreateHandler,
    StdAccountUpdateHandler,
} from '@sailpoint/connector-sdk'
import { Config } from './model/config'
import { ISCClient } from './isc-client'
import { AccessRequestType, EntitlementDocument, IdentityDocument, Index } from 'sailpoint-api-client'
import { Entitlement } from './model/entitlement'
import { Account } from './model/account'

// Connector must be exported as module property named connector
export const connector = async () => {
    logger.debug('Initializing connector')
    const config: Config = await readConfig()
    logger.debug('Configuration loaded', { config })

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const isc = new ISCClient(config)
    logger.debug('ISC client initialized')

    const createAccessRequest = async (identity: string, entitlements: string[], requestType: AccessRequestType) => {
        logger.debug('Creating access request', { identity, entitlements, requestType })

        if (requestType === AccessRequestType.GrantAccess && config.makeRequestable) {
            logger.debug('Checking and updating requestable status for entitlements')
            for (const id of entitlements) {
                const entitlement = await isc.getEntitlement(id)
                logger.debug('Checking entitlement requestable status', {
                    entitlementId: id,
                    isRequestable: entitlement.requestable,
                })
                if (!entitlement.requestable) {
                    logger.debug('Making entitlement requestable', { entitlementId: id })
                    await isc.patchEntitlement(id, [{ op: 'replace', path: '/requestable', value: true }])
                }
            }
        }
        let response
        try {
            response = await isc.createAccessRequest(identity, entitlements, requestType, config.comment)
        } catch (error) {
            logger.debug('First attempt failed, retrying in 1 minute', { error })
            await new Promise((resolve) => setTimeout(resolve, 60000))
            response = await isc.createAccessRequest(identity, entitlements, requestType, config.comment)
        }
        logger.debug('Access request created successfully', { response })
        return response
    }

    const stdTestConnection: StdTestConnectionHandler = async (context, input, res) => {
        logger.debug('Testing connection')
        try {
            await isc.getPublicIdentityConfig()
            logger.debug('Connection test successful')
            res.send({})
        } catch (error) {
            logger.error('Connection test failed', { error })
            throw new ConnectorError(error as string)
        }
    }

    const stdEntitlementList: StdEntitlementListHandler = async (context, input, res) => {
        logger.debug('Starting entitlement list operation')
        const entitlementSearch = (await isc.search(config.search, Index.Entitlements)) as EntitlementDocument[]
        logger.debug('Found entitlements', { count: entitlementSearch.length })

        for (const e of entitlementSearch) {
            const entitlement = new Entitlement(e)
            logger.debug('Processing entitlement', { entitlement })
            res.send(entitlement)
        }
        logger.debug('Entitlement list operation completed')
    }

    const stdAccountCreate: StdAccountCreateHandler = async (context, input, res) => {
        logger.info('Starting account creation')
        logger.info({ input })
        const name = input.attributes.name as string
        const entitlements = [input.attributes.entitlements].flat()
        logger.info('Account creation parameters', { name, entitlements })

        let identity: IdentityDocument | undefined = undefined
        let attempts = 0
        const maxAttempts = 5
        const delayMs = 60000 // 1 minute in milliseconds

        while (!identity) {
            try {
                identity = await isc.getIdentityByUid(name)
            } catch (error) {
                logger.debug('Identity not found, retrying in 1 minute', { error })
            }

            if (attempts++ >= maxAttempts) {
                logger.error('Max attempts reached, identity not found')
                throw new ConnectorError('Identity not found')
            }

            await new Promise((resolve) => setTimeout(resolve, identity ? 0 : delayMs))
        }

        logger.debug('Creating access request for new account')
        const response = await createAccessRequest(identity.id, entitlements, AccessRequestType.GrantAccess)
        logger.debug('Access request created', { response })

        const account = new Account(identity, entitlements)
        logger.debug('Account created successfully', { account })
        res.send(account)
    }

    const stdAccountUpdate: StdAccountUpdateHandler = async (context, input, res) => {
        logger.debug('Starting account update', { input })

        const identity = await isc.getIdentity(input.identity)
        logger.debug('Retrieved identity', { identity })

        const existingAccount = await isc.getAccount(input.identity)
        logger.debug('Retrieved existing account', { existingAccount })

        if (!identity) {
            logger.error('Identity not found during update')
            throw new ConnectorError('Identity not found')
        }
        if (!existingAccount) {
            logger.error('Account not found during update')
            throw new ConnectorError('Account not found')
        }

        const entitlementsAdd: string[] = []
        const entitlementsRemove: string[] = []

        if (input.changes) {
            logger.debug('Processing account changes', { changes: input.changes })
            for (const change of input.changes) {
                const values = [change.value].flat()
                logger.debug('Processing change operation', { operation: change.op, values })
                for (const value of values) {
                    switch (change.op) {
                        case 'Add':
                            entitlementsAdd.push(value)
                            break
                        case 'Remove':
                            entitlementsRemove.push(value)
                            break
                        case 'Set':
                            logger.error('Unsupported Set operation encountered')
                            throw new ConnectorError('Set is not supported')
                    }
                }
            }
        }

        if (entitlementsAdd.length > 0) {
            logger.debug('Adding entitlements', { entitlements: entitlementsAdd })
            const response = await createAccessRequest(identity.id, entitlementsAdd, AccessRequestType.GrantAccess)
            logger.debug('Entitlements added successfully', { response })
        }

        if (entitlementsRemove.length > 0) {
            logger.debug('Removing entitlements', { entitlements: entitlementsRemove })
            const response = await createAccessRequest(identity.id, entitlementsRemove, AccessRequestType.RevokeAccess)
            logger.debug('Entitlements removed successfully', { response })
        }

        const entitlements = [...existingAccount?.attributes?.entitlements, ...entitlementsAdd].filter(
            (x) => !entitlementsRemove.includes(x)
        )
        logger.debug('Final entitlements list', { entitlements })

        const account = new Account(identity, entitlements)
        logger.debug('Account updated successfully', { account })
        res.send(account)
    }

    logger.debug('Creating connector with handlers')
    return createConnector()
        .stdTestConnection(stdTestConnection)
        .stdAccountCreate(stdAccountCreate)
        .stdAccountUpdate(stdAccountUpdate)
        .stdEntitlementList(stdEntitlementList)
}
