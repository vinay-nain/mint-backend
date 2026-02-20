import crypto from "crypto";
import bcrypt from "bcrypt";

const genPass = async (pw) => {
    let salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash(pw, salt);

    return password;
};

const verifyPass = async (pw, hash) => {
    let verify = await bcrypt.compare(pw, hash);
    console.log(verify)
    return verify;
};

export { genPass, verifyPass };
