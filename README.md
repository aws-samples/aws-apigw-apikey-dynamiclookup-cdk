## Dynamic Lookup of API Gateway API Keys

This project demostrates how custom lambda authorizers can be used to add API keys in Amazon API Gateway. The source of the key (key identifier) can be in request body (for POST requests) , request parameter or in the request header. XML, JSON or formdata request body are supported.

### Configuration

Ensure you modify the API key names and values in `bin/apigw_project.ts` as per your need.
There are 3 initialization of the stack. Choose which initialization type is suitable for your use case.

1. ApiGWStackbody initializes the stack to lookup the key identifier is in request body. Based on type of request body , review `lamda/BodyMetaData.json`
2. ApiGWStackparameter initializes the stack to lookup the key identifier in request parameter. Review the  `keysourcetype` and `keysource` parameter.
3. ApiGWStackparameter initializes the stack to lookup the key identifier in request header. Review the  `keysourcetype` and `keysource` parameter.

### Request body samples and mechanism for choosing identifiers

#### XML

Sample request body

```xml
<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <author>Raut, Sanket</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>104.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>Indepth infomration for XML.</description>
   </book>
</catalog>
```

For above sample , if the key identifer is the genre , ensure  you use xpath notation for `keyIdentifier` to `string(/catalog/book[1]/genre)` in `lambda/BodyMetaData.json`. Since the request body is xml mention `bodyType` to be `xml`

#### JSON

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

For above sample , if the key identifer is the source , ensure  you use xpath notation for `keyIdentifier` to `$.preferedCommunication.source` in `lambda/BodyMetaData.json`. Since the request body is json mention `bodyType` to be `json` 

### Deployment

Prerequisites requires installation of  [AWS CDK 1.85.0+](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)

To deploy the solution refer the commands

* `cdk deploy`     deploy this stack to your default AWS account/region
* `cdk diff`       compare deployed stack with current state
* `cdk synth`      emits the synthesized CloudFormation template

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.