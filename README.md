# Dynamic Lookup of API Gateway API Keys

This project demostrates how custom lambda authorizers can be used to add API keys in Amazon API Gateway. The source of the key (key identifier) can be in request body (for POST requests) , request parameter or in the request header. XML, JSON or formdata request body are supported.

## CDK Configuration

Ensure you modify the API key names and values in `bin/apigw_project.ts` as per your need. Ensure there are API keys are unique.
There are 3 initialization of the stack. Choose which initialization type is suitable for your use case. You can deploy one or more stacks
1. ApiGWStackbody initializes the stack to lookup the key identifier is in request body. Based on type of request body , review `lamda/BodyMetaData.json`
2. ApiGWStackparameter initializes the stack to lookup the key identifier in request parameter. Review the  `keysourcetype` and `keysource` parameter.
3. ApiGWStackparameter initializes the stack to lookup the key identifier in request header. Review the  `keysourcetype` and `keysource` parameter.


## Deployment

AWS credentials that provide necessary permissions to create the resources with AWS account is needed. 

A preferred way is to use AWS Cloud9 which has all the dependencies pre-installed. Recommendation is to use t2.micro instance for this. Cloud9 has all the dependencies needed for running this application. 

If you want to run the application from local environment, ensure you have
* Node JS (v16+) – Download and install using steps mentioned  [here](https://nodejs.org/en/download/)
* AWS CDK CLI (v1.111+) -  Install using steps mentioned [here](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)


To deploy this solution clone this repository.

Run following command in `lambda` and `lambdaatedge` directory to download the needed nodejs dependencies

```node
npm install
```

To deploy the solution refer the commands in `aws-apigw-apikey-dynamiclookup-cdk` directory

* `cdk deploy --all`     deploy this stack to your default AWS account/region
* `cdk diff`       compare deployed stack with current state
* `cdk synth`      emits the synthesized CloudFormation template

## Configuration and Testing

### Scenario 1 - Key Identifier present in request body.
In this scenario, the key identifier is present in the request body. The type of request body supported are JSON, XML or form-data.

Visit [Scenario 1](scenario1.md) for configuring and testing  

### Scenario 2 - Key Identifier present in request parameter.
In this scenario, the key identifier is present in the request parameter.

Visit [Scenario 2](scenario2.md) for configuring and testing  


### Scenario 3 - Key Identifier present in request header.
In this scenario, the key identifier is present in the request header.

Visit [Scenario 3](scenario3.md) for configuring and testing  


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.