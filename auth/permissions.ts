import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access'

const statement = {
  ...defaultStatements
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  ...memberAc.statements
});

const admin = ac.newRole({
  ...adminAc.statements
});

const owner = ac.newRole({
  ...ownerAc.statements
});

export { ac, owner, admin, member };
