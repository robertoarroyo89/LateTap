import { adminAuth } from "../src/lib/firebase/admin";

const uid = process.env.ADMIN_UID;
if (!uid) throw new Error("Set ADMIN_UID to the Firebase user's UID before running this command.");
const user = await adminAuth().getUser(uid);
await adminAuth().setCustomUserClaims(uid, { ...user.customClaims, admin: true });
console.info(`Admin claim granted to ${uid}. The user must sign in again to refresh the token.`);
