import {
    CredentialPayload,
    CreateCredentialOptions,
    PresentationPayload,
    CreatePresentationOptions,
} from 'did-jwt-vc';
import {
    Ed25519Signature2018,
    Ed25519VerificationKey2018,
} from '@transmute/ed25519-signature-2018';
import { verifiable } from '@transmute/vc.js';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
import { DIDWithKeys } from '../did/did';
import { SignatureService } from './signatures';
import { KEY_ALG, KeyUtils } from '../../../utils';
import { ContextManager } from '../schemas';
import { isString } from 'lodash';

export class JSONLDService implements SignatureService {
    /**
     *
     * @param keys - `DIDWithKeys` - the DID and the keypair that will sign the token
     * @param token - `CredentialPayload` - the Credential object
     * @param _configs Currently not supported yet.
     * @returns JSON stringified JSON-LD token
     */
    async signVC(
        keys: DIDWithKeys,
        token: CredentialPayload,
        _configs?: CreateCredentialOptions | undefined,
    ): Promise<string> {
        const key = await this.#createEd25519VerificationKey(keys);

        const { id, type, issuer, issuanceDate, credentialSubject } = token;

        let credential: VerifiableCredential = {
            '@context': token['@context'],
            type,
            issuer,
            issuanceDate:
                issuanceDate instanceof Date
                    ? issuanceDate.toISOString()
                    : issuanceDate,
            credentialSubject,
        };

        if (id !== undefined) {
            credential = { ...credential, id };
        }

        const documentLoader = new ContextManager().createDocumentLoader();

        const vc = await verifiable.credential.create({
            credential,
            format: ['vc'],
            documentLoader: (iri) => {
                return documentLoader(iri);
            },
            suite: new Ed25519Signature2018({
                key,
            }),
        });

        if (vc.items.length === 0) {
            throw new Error('There are no items found in the credential.');
        }
        // Stringify the credential for compability between languages
        // and conform to the SignatureService's function signature
        return JSON.stringify(vc.items[0]);
    }

    /**
     *
     * @param keys `DIDWithKeys` - the DID and the keypair that will sign the token
     * @param token `PresentationPayload` the credential to for presentation
     * @param configs `CreatePresentationOptions` options needed to create a verifiable presentation
     * @returns
     */
    async signVP(
        keys: DIDWithKeys,
        token: PresentationPayload,
        configs?: CreatePresentationOptions | undefined,
    ): Promise<string> {
        const { type, holder, verifiableCredential } = token;

        if (verifiableCredential?.length === 0) {
            throw new Error('Missing verifiable credential');
        }

        // If it is a string we can assume it is JWT and we need to decode it.
        if (isString(verifiableCredential?.[0])) {
            throw new Error(
                'JWT token is insufficient data for the presentation.',
            );
        }

        const vc = verifiableCredential?.[0] as VerifiableCredential;

        const presentation = {
            '@context': token['@context'],
            type,
            holder,
            verifiableCredential: vc,
        };

        const key = await this.#createEd25519VerificationKey(keys);
        const documentLoader = new ContextManager().createDocumentLoader();

        if (!configs?.challenge) {
            throw new Error(
                'A challenge is required for a verifiable presentation.',
            );
        }

        const vp = await verifiable.presentation.create({
            presentation,
            format: ['vp'],
            challenge: configs?.challenge,
            documentLoader,
            suite: new Ed25519Signature2018({
                key,
            }),
        });

        if (vp.items.length === 0) {
            throw new Error('There are no items found in the credential.');
        }

        return JSON.stringify(vp.items[0]);
    }

    /**
     * Creates a verification key to sign the credential.
     *
     * @param keys `DIDWithKeys` to use in signing the credential.
     * @returns `Ed25519VerificationKey2018` the verification key to sign the credential.
     */
    async #createEd25519VerificationKey(
        keys: DIDWithKeys,
    ): Promise<Ed25519VerificationKey2018> {
        const { did, keyPair } = keys;
        const id = did.split(':').pop();

        if (keys.keyPair.algorithm !== KEY_ALG.EdDSA) {
            throw new Error(
                'Key must have EdDSA algorithm to be converted into an Ed25519VerificationKey2018',
            );
        }

        const base58Keys = KeyUtils.encodeToBase58(keyPair);

        return await Ed25519VerificationKey2018.from({
            id: `${did}#${id}`,
            type: 'Ed25519VerificationKey2018', // Used for compatibility with 'https://www.w3.org/2018/credentials/v1' context
            controller: did,
            publicKeyBase58: base58Keys.publicKey,
            privateKeyBase58: base58Keys.privateKey,
        });
    }

    name = 'jsonld';
}
