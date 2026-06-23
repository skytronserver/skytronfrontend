import * as Yup from "yup";

const schema1 = Yup.string().required();
const schema2 = Yup.string();

console.log("schema1 tests:", JSON.stringify(schema1.describe()));
console.log("schema2 tests:", JSON.stringify(schema2.describe()));
