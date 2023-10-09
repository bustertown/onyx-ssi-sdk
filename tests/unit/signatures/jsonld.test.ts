import {
    DEFAULT_CONTEXT,
    JSONLDService,
    SCHEMA_CONTEXT,
    VERIFIABLE_CREDENTIAL,
    VERIFIABLE_PRESENTATION,
} from '../../../src/services/common';
import { KEY_ALG } from '../../../src/utils';

describe('jsonld utilities', () => {
    const didWithKeys = {
        did: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
        keyPair: {
            algorithm: KEY_ALG.EdDSA,
            publicKey:
                '0x76f11a56051843a758f457c5891bac494056d447f3606e5131648c453d6f30f5',
            privateKey:
                '0xb2e15a821fe57b6af467ab4c3aaa264456a14f90bed5cf8a00f013bdbe7177be76f11a56051843a758f457c5891bac494056d447f3606e5131648c453d6f30f5',
        },
    };

    const context = [DEFAULT_CONTEXT, SCHEMA_CONTEXT];
    const credentialSubject = {
        id: 'did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508',
        name: 'Ollie',
    };
    const issuer = {
        id: didWithKeys.did,
    };
    const type = [VERIFIABLE_CREDENTIAL, 'ProofOfName'];
    const issuanceDate = '2023-05-18T17:34:26.000Z';

    const VC_PAYLOAD = {
        '@context': context,
        credentialSubject,
        issuer,
        type,
        issuanceDate,
    };
    const holder = didWithKeys.did;

    const verifiableCredential = [
        {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://schema.org/docs/jsonldcontext.jsonld',
            ],
            type: ['VerifiableCredential', 'ProofOfName'],
            issuer: {
                id: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            },
            issuanceDate: '2023-05-18T17:34:26.000Z',
            credentialSubject: {
                id: 'did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508',
                name: 'Ollie',
            },
            proof: {
                type: 'Ed25519Signature2018',
                created: '2023-10-07T20:19:38Z',
                verificationMethod:
                    'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz#z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                proofPurpose: 'assertionMethod',
                jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ChSGNIRN8MCACFGgZ6DAwE2ysTYHgr7ZvwktrBwejp8MbdIn6zDGcGY9HSpvdF9cqA_NXfz78ZlWsUZTC4mNBQ',
            },
        },
    ];

    const VP_PAYLOAD = {
        '@context': context,
        type: VERIFIABLE_PRESENTATION,
        holder,
        verifiableCredential,
    };

    it('SignVC for jsonld using did:key', async () => {
        const jsonldService = new JSONLDService();
        const ldProof = await jsonldService.signVC(didWithKeys, VC_PAYLOAD);
        const parsedResult = JSON.parse(ldProof);

        expect(parsedResult).toEqual({
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://schema.org/docs/jsonldcontext.jsonld',
            ],
            type: ['VerifiableCredential', 'ProofOfName'],
            issuer: {
                id: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            },
            issuanceDate: '2023-05-18T17:34:26.000Z',
            credentialSubject: {
                id: 'did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508',
                name: 'Ollie',
            },
            proof: {
                type: 'Ed25519Signature2018',
                created: expect.any(String) as string, // Only need to know field is populated
                verificationMethod:
                    'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz#z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                proofPurpose: 'assertionMethod',
                jws: expect.any(String) as string, // Only need to know field is populated as it changes each time it is ran
            },
        });
    });

    it('SignVC for jsonld using did:key with an id', async () => {
        const jsonldService = new JSONLDService();
        const ldProof = await jsonldService.signVC(didWithKeys, {
            ...VC_PAYLOAD,
            id: didWithKeys.did,
        });
        const parsedResult = JSON.parse(ldProof);

        expect(parsedResult).toEqual({
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://schema.org/docs/jsonldcontext.jsonld',
            ],
            type: ['VerifiableCredential', 'ProofOfName'],
            issuer: {
                id: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            },
            id: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            issuanceDate: '2023-05-18T17:34:26.000Z',
            credentialSubject: {
                id: 'did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508',
                name: 'Ollie',
            },
            proof: {
                type: 'Ed25519Signature2018',
                created: expect.any(String) as string, // Only need to know field is populated
                verificationMethod:
                    'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz#z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                proofPurpose: 'assertionMethod',
                jws: expect.any(String) as string, // Only need to know field is populated as it changes each time it is ran
            },
        });
    });

    it('signVC fails if using keys not encrypted with EdDSA', async () => {
        // invalid didWithKeys
        const invalidDidWithKeys = {
            did: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            keyPair: {
                algorithm: KEY_ALG.ES256K,
                publicKey:
                    '0x76f11a56051843a758f457c5891bac494056d447f3606e5131648c453d6f30f5',
                privateKey:
                    '0xb2e15a821fe57b6af467ab4c3aaa264456a14f90bed5cf8a00f013bdbe7177be76f11a56051843a758f457c5891bac494056d447f3606e5131648c453d6f30f5',
            },
        };
        const jsonldService = new JSONLDService();
        await expect(
            jsonldService.signVP(invalidDidWithKeys, VP_PAYLOAD),
        ).rejects.toThrowError(Error);
    });

    it('SignVC throws an error if a context is missing with additional properties', async () => {
        const jsonldService = new JSONLDService();
        await expect(
            jsonldService.signVC(didWithKeys, {
                ...VC_PAYLOAD,
                '@context': [DEFAULT_CONTEXT],
            }),
        ).rejects.toThrowError('credential is not valid JSON-LD:');
    });

    it('SignVP throws error for missing challenge', async () => {
        const jsonldService = new JSONLDService();
        await expect(
            jsonldService.signVP(didWithKeys, VP_PAYLOAD),
        ).rejects.toThrowError(
            'A challenge is required for a verifiable presentation.',
        );
    });

    it('SignVP successfully signs a jsonld proof', async () => {
        const jsonldService = new JSONLDService();

        const vpResult = await jsonldService.signVP(didWithKeys, VP_PAYLOAD, {
            challenge: 'jasonschallenge',
        });

        const parsedResult = JSON.parse(vpResult);

        expect(parsedResult).toEqual({
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://schema.org/docs/jsonldcontext.jsonld',
            ],
            type: 'VerifiablePresentation',
            holder: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
            proof: {
                type: 'Ed25519Signature2018',
                created: expect.any(String) as string, // Only need to know field is populated
                verificationMethod:
                    'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz#z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                proofPurpose: 'authentication',
                challenge: 'jasonschallenge',
                jws: expect.any(String) as string, // Only need to know field is populated as it changes each time it is ran
            },
            verifiableCredential: {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://schema.org/docs/jsonldcontext.jsonld',
                ],
                type: ['VerifiableCredential', 'ProofOfName'],
                issuer: {
                    id: 'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                },
                issuanceDate: '2023-05-18T17:34:26.000Z',
                credentialSubject: {
                    id: 'did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508',
                    name: 'Ollie',
                },
                proof: {
                    type: 'Ed25519Signature2018',
                    created: '2023-10-07T20:19:38Z',
                    verificationMethod:
                        'did:key:z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz#z6MknTZPNAtKXhYUC51KueL2RmJX6nMhZAbjfzV6LRv17Juz',
                    proofPurpose: 'assertionMethod',
                    jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ChSGNIRN8MCACFGgZ6DAwE2ysTYHgr7ZvwktrBwejp8MbdIn6zDGcGY9HSpvdF9cqA_NXfz78ZlWsUZTC4mNBQ',
                },
            },
        });
    });
});
