import { execute } from "../executor";
 test("executor : correct keypair", async () => {
  const ymlFileName = "correct-keypair";

  const result = await execute(ymlFileName);

  expect(result).toEqual(true);
});

test("executor : wrong keypair", async () => {
  const ymlFileName = "wrong-keypair";

  const result = await execute(ymlFileName);

  const expected = { zenchain: 1.0 };

  expect(result).toEqual(false);
});

test("executor : correct keypair and 3 times create-pbkdf", async () => {
  const ymlFileName = "correct-keypair-repeat";

  const result = await execute(ymlFileName);

  const expected = { zenchain: 1.0 };

  expect(result).toEqual(true);
});
