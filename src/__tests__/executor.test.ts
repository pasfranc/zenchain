import { executeChain } from "../zenchain";
 test("executor : correct keypair", async () => {
  const ymlFileName = "correct-keypair";

  const result = await executeChain(ymlFileName);

  expect(result).toEqual(true);
});

test("executor : wrong keypair", async () => {
  const ymlFileName = "wrong-keypair";

  const result = await executeChain(ymlFileName);

  const expected = { zenchain: 1.0 };

  expect(result).toEqual(false);
});

test("executor : correct keypair and 3 times create-pbkdf", async () => {
  const ymlFileName = "correct-keypair-repeat";

  const result = await executeChain(ymlFileName);

  const expected = { zenchain: 1.0 };

  expect(result).toEqual(true);
});
