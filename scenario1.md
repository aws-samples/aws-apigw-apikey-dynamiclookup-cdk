In this scenario, the key identifier is present in the request body. The type of request body supported are JSON, XML or form-data. 

<strong><em>Configuration</em></strong>

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
```

This key identifier value should be configured in the Dynamodb table. The name of dynamodb table is printed as output of CDK with label ApiGWStackbody.DynamodbTable.  You would need to  retrieve  AWS Key Id from AWS console and associate it with the api key identifier in dynamodb table.

![Console](https://github.com/aws-samples/aws-apigw-apikey-dynamiclookup-cdk/blob/main/APIKeys.png?raw=trueAPIKeys.png)

You can also use [get-api-keys](https://docs.aws.amazon.com/cli/latest/reference/apigateway/get-api-keys.html) command to get the list of keys and their IDs. 
You can use following command to add values in the dynamodb table

```cli
aws dynamodb put-item \
    --table-name <<replace table name here>> \
    --item '{
  		"id": {"S": "Computer"},
  		"awskeyid": {"S": "<<replace key1 id here>>"}
	}' \
    --return-consumed-capacity TOTAL

aws dynamodb put-item \
    --table-name <<replace table name here>> \
    --item '{
  		"id": {"S": "Cooking"},
  		"awskeyid": {"S": "<<replace another key2 id here>>"}
	}' \
    --return-consumed-capacity TOTAL
```

<strong><em>Testing - XML Request</em></strong>
We will be sending a POST request to the cloudfront URL. Cloudfront URL is one of the output variable of CDK stack with label ApiGWStackbody.CloudfrontDistribution

```cli
curl --location --request POST 'https://<<Cloudfront Domain name>>/prod/books' \
--header 'Authorization: token' \
--header 'Content-Type: application/json' \
--data-raw '<?xml version="1.0"?>
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
'
```


For a different request body with Cooking genre, use the following example

```cli
curl --location --request POST 'https://<<Cloudfront Domain name>>/prod/books' \
--header 'Authorization: token' \
--header 'Content-Type: application/json' \
--data-raw '<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <author>Famous, Author </author>
      <title>Cooking Guide for dummies 101 </title>
      <genre>Cooking</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating mouth watering food.</description>
   </book>
</catalog>
'
```

You should see following response

```json
{
    "name": "Basic of whatever",
    "ISBN": "978-3-16-148410-0",
    "registrationDate": 1598274405
}
```