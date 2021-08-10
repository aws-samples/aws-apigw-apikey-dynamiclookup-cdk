## Dynamic Lookup of API Gateway API Keys

This project demostrates how custom lambda authorizers can be used to add API keys in Amazon API Gateway. The source of the key (key identifier) can be in request body (for POST requests) , request parameter or in the request header. XML, JSON or formdata request body are supported.

### Configuration

Ensure you modify the API key names and values in `bin/apigw_project.ts` as per your need.
There are 3 initialization of the stack. Choose which initialization type is suitable for your use case.

1. ApiGWStackbody initializes the stack to lookup the key identifier is in request body. Based on type of request body , review `lamda/BodyMetaData.json`
2. ApiGWStackparameter initializes the stack to lookup the key identifier in request parameter. Review the  `keysourcetype` and `keysource` parameter.
3. ApiGWStackparameter initializes the stack to lookup the key identifier in request header. Review the  `keysourcetype` and `keysource` parameter.

### Request body samples and mechanism for choosing identifiers

#### Scenario 1 - Key Identifier present in request body.
In this scenario, the key identifier is present in the request body. The type of request body supported are JSON, XML or form-data. 

Sample request body - XML

```xml
<catalog>
   <book id="bk101">
      <author>Famous, Author </author>
      <title>XML Developer'\''s Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications 
      with XML.</description>
   </book>
</catalog>
```

For above sample , if the key identifer is the `genre` , ensure  you use xpath notation for `keyIdentifier` to `string(/catalog/book[1]/genre)` in `lambdaatedge/BodyMetaData.json`. Since the request body is xml mention `bodyType` to be `xml`

The file `lambdaatedge/BodyMetaData.json` should look like 
```json
{
    "bodyType":"xml",
    "keyIdentifier": "string(/catalog/book[1]/genre)"
}

```

Sample request body - JSON 

```json
{
    "name": "John",
    "age": 30,
    "car": "NewElectric",
    "preferedCommunication": {
     "source": "email"
    }
    
}
```

For above sample , if the key identifer is  `source` , ensure  you use xpath notation for `keyIdentifier` to `$.preferedCommunication.source` in `lambda/BodyMetaData.json`. Since the request body is json mention `bodyType` to be `json` 


The file `lambdaatedge/BodyMetaData.json` should look like 
```json
{
    "bodyType":"json",
    "keyIdentifier": "$.preferedCommunication.source"
}

This key identifier value should be configured in the Dynamodb table. The name of dynamodb table is printed as output of CDK with label ApiGWStackbody.DynamodbTable.  You would need to  retrieve  AWS Key Id from AWS console and associate it with the api key identifier in dynamodb table.

![Console](https://github.com/aws-samples/aws-apigw-apikey-dynamiclookup-cdk/blob/main/APIKeys.png?raw=trueAPIKeys.png)

### Deployment

Prerequisites requires installation of  [AWS CDK 1.85.0+](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)

Run following command in `lambda` and `lambdaatedge` directory to download the needed nodejs dependencies

```node
npm install
```

To deploy the solution refer the commands

* `cdk deploy --all`     deploy this stack to your default AWS account/region
* `cdk diff`       compare deployed stack with current state
* `cdk synth`      emits the synthesized CloudFormation template

#### Populate Dynamodb lookup table

After the depolyment is complete , note the `DynamodbTable` output parameter. Populate that dynamodb table with value of key identifier value to awskeyid (NOTE:  This is different from key name and can be found on AWS Console). A sample CLI command to add one record for XML example above is

```
aws dynamodb put-item \
    --table-name ApiGWStackbody-lookuptableF6A7E1C6-1RK11ZGKCWVYE \
    --item '{
  		"id": {"S": "Computer"},
  		"awskeyid": {"S": "1ha4frr8n0"}
	}' \
    --return-consumed-capacity TOTAL
```


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.