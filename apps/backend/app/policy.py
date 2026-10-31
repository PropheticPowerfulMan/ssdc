from datetime import datetime, timezone


def future(value):
    if value is None:
        return False
    return value.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc) if value.tzinfo is None else value > datetime.now(timezone.utc)


def eligible(user, document):
    return bool(user.active and future(user.clearance_expires)
                and user.clearance >= document.classification
                and set(document.compartments).issubset(user.compartments)
                and user.department == document.department)


def can_read(user, document, grant):
    return bool("reader" in user.roles and eligible(user, document)
                and document.status == "released"
                and (document.expires_at is None or future(document.expires_at))
                and grant is not None and future(grant.expires_at))


def can_approve(user, document, requester_id):
    return bool("approver" in user.roles and eligible(user, document)
                and document.owner_id == user.id and requester_id != user.id
                and document.status == "released")
