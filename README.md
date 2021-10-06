# Zenchain lib

Component to execute multiple zenroom contracts in chain. The lib is taking in input a yml file that consists in blocks and a "first" property that indicates the first contract to execute. Every block has a "next" property that indicates next block to execute and has a type. These are the recognized types for the library:
- INPUT
- ZENROOM
- OUTPUT

An INPUT block is used to provide an input for next contracts (it can be avoided at all, it's there just for readibility). A ZENROOM block is used when there is a zenroom contract to execute. The library will try to find a zenroom contract (.zen) and a keys file (.keys) for the contract in the contracts folder with same name.
An OUTPUT block is the final state for our chain. When the library encounters an output block it will stop.

The library is building for every block iteration a context file that contains all input and all output for every contract that is executed. This means that you can use the output(or part of it) of a contract as input for all the next contracts. To access a property from the context in the yml or .keys file you need to specify 
```bash
context.get('name-of-contract').output
```
to access the output (you can access even .keys or .data if you want to use same input)

The library is able to evaluate expression and use a condition to follow specific flow of contracts (you can see it [here](https://github.com/pasfranc/zenchain/blob/master/correct-keypair.yml#L13)). This means we can even repeat execution of contracts until a specific condition is not met (A counter for instance - you can see it [here](https://github.com/pasfranc/zenchain/blob/master/correct-keypair-repeat.yml#L11-L15)).

In the folder there is also an example for a possible use case (verify keypair). You can find a documentation flow [here](https://github.com/pasfranc/zenchain/blob/master/verify-keypair-use-case.jpg)

## Test

```bash
npm install
npm run test
```
