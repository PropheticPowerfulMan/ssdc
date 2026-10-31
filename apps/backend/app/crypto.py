"""AEAD envelope encryption; document ID binds both ciphertext and wrapped DEK."""
import base64
import os
from typing import Protocol
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings


class KeyProvider(Protocol):
    def wrap(self, key: bytes, context: bytes) -> tuple[bytes, str]: ...
    def unwrap(self, wrapped: bytes, reference: str, context: bytes) -> bytes: ...


class DevelopmentKeyProvider:
    def __init__(self, encoded: str):
        self.key = base64.b64decode(encoded, validate=True)
        if len(self.key) != 32:
            raise ValueError("Development KEK must contain 32 bytes")

    def wrap(self, key, context):
        nonce = os.urandom(12)
        return nonce + AESGCM(self.key).encrypt(nonce, key, context), "development:v1"

    def unwrap(self, wrapped, reference, context):
        if reference != "development:v1":
            raise ValueError("Unknown key reference")
        return AESGCM(self.key).decrypt(wrapped[:12], wrapped[12:], context)


class AWSKeyProvider:
    def __init__(self, key_id, region):
        import boto3
        self.client = boto3.client("kms", region_name=region)
        self.key_id = key_id

    def wrap(self, key, context):
        result = self.client.encrypt(KeyId=self.key_id, Plaintext=key,
                                     EncryptionContext={"ssdc": context.decode()})
        return result["CiphertextBlob"], result["KeyId"]

    def unwrap(self, wrapped, reference, context):
        if reference != self.key_id:
            raise ValueError("Unapproved key reference; configure the full KMS key ARN")
        return self.client.decrypt(KeyId=reference, CiphertextBlob=wrapped,
                                   EncryptionContext={"ssdc": context.decode()})["Plaintext"]


def provider():
    cfg = settings()
    if cfg.kms_key_id:
        return AWSKeyProvider(cfg.kms_key_id, cfg.aws_region)
    if cfg.environment != "development":
        raise RuntimeError("External approved KMS required")
    return DevelopmentKeyProvider(cfg.development_kek)


def encrypt(content, document_id, keys):
    context = ("ssdc:v1:" + document_id).encode()
    dek, nonce = AESGCM.generate_key(bit_length=256), os.urandom(12)
    wrapped, reference = keys.wrap(dek, context)
    return AESGCM(dek).encrypt(nonce, content, context), nonce, wrapped, reference


def decrypt(ciphertext, document_id, nonce, wrapped, reference, keys):
    context = ("ssdc:v1:" + document_id).encode()
    return AESGCM(keys.unwrap(wrapped, reference, context)).decrypt(nonce, ciphertext, context)
