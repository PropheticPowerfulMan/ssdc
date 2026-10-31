"""Explicit offline operator command; never trusts roles or clearance from browser input."""
import argparse
from datetime import timedelta
from app.db import SessionLocal
from app.models import User, now

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("subject", help="Exact Keycloak user UUID")
    parser.add_argument("--name", required=True)
    parser.add_argument("--department", default="DANTIC")
    parser.add_argument("--roles", default="reader", help="reader,uploader,approver,auditor; admin gives no content privilege")
    parser.add_argument("--clearance", type=int, choices=range(5), default=0)
    parser.add_argument("--compartments", default="")
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()
    roles = [x for x in args.roles.split(",") if x]
    if not set(roles) <= {"reader", "uploader", "approver", "auditor", "admin"} or not 1 <= args.days <= 365:
        parser.error("Invalid roles or clearance duration")
    with SessionLocal.begin() as db:
        if db.get(User, args.subject):
            parser.error("Account already provisioned; review and update via controlled migration")
        db.add(User(id=args.subject, name=args.name, department=args.department, roles=roles,
                    clearance=args.clearance, compartments=[x for x in args.compartments.split(",") if x],
                    clearance_expires=now() + timedelta(days=args.days), active=True))

if __name__ == "__main__":
    main()
