import base64
import os
import pytest
from cryptography.exceptions import InvalidTag
from app.crypto import DevelopmentKeyProvider, encrypt, decrypt


def test_envelope_roundtrip_tamper_context_and_unique_nonces():
    keys=DevelopmentKeyProvider(base64.b64encode(os.urandom(32)).decode())
    a=encrypt(b"fictional content", "document-a", keys)
    b=encrypt(b"fictional content", "document-a", keys)
    ciphertext,nonce,wrapped,reference=a
    assert a!=b and nonce!=b[1] and wrapped!=b[2]
    assert decrypt(ciphertext,"document-a",nonce,wrapped,reference,keys)==b"fictional content"
    for changed in [ciphertext[:-1]+bytes([ciphertext[-1]^1])]:
        with pytest.raises(InvalidTag):
            decrypt(changed,"document-a",nonce,wrapped,reference,keys)
    with pytest.raises(InvalidTag):
        decrypt(ciphertext,"document-b",nonce,wrapped,reference,keys)
    other=DevelopmentKeyProvider(base64.b64encode(os.urandom(32)).decode())
    with pytest.raises(InvalidTag):
        decrypt(ciphertext,"document-a",nonce,wrapped,reference,other)
