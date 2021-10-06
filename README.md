# Zenchain lib

Component to execute multiple zenroom contracts in chain. The lib is taking in input a yml file that consists in blocks. Every block can have a type and these are the recognized types for the library:
- INPUT
- ZENROOM
- OUTPUT

An Input block is used to provide an input for next contracts (it can be avoided at all, it's there just to readibility)
A Zenroom block is used when there is a zenroom contract to execute. The library will try to find a zenroom contract (.zen) and a keys file (.keys) for the contract in the contracts folder with same name.
An Output block is the final state for our chain. When the library encounters an output block it will stop.

The library is building for every block iteration a context file that contains all input and all output for every contract that is executed. This means that you can use the output(or part of it) of a contract as input for all the next contracts. To access a property from the context in the yml or .keys file you need to specify context.get('name-of-contract').output to access the output (you can access even .keys or .data if you want to use same input)

The library is able to evaluate expression and use it to decide a specific path of contracts (you can see it in correct-keypair.yml line 13). This means we can even repeat execution of contracts until a specific condition is not met (A counter for instance - you can see it in correct-keypair-repeat line 11-13-14).


## Test

```bash
npm install
npm run test
```
