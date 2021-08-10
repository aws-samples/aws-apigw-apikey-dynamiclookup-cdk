In this scenario, the key identifier is present in the request header. In this scenario , L@E will not be used because there is no need to parse the request body

<strong><em>Configuration</em></strong>

For configuring the API keys for the api key identifier , you can run following command to add data to dynamodb table. Please note the dynamodb table name from the CDK output with label name `ApiGWStackparameter.DynamodbTable`. Key5 and key6 id can be found in AWS console or you can also use [get-api-keys](https://docs.aws.amazon.com/cli/latest/reference/apigateway/get-api-keys.html) command to get the list of keys and their IDs

![Console](https://github.com/aws-samples/aws-apigw-apikey-dynamiclookup-cdk/blob/main/APIKeys.png?raw=trueAPIKeys.png)


Populate the lookup table

```cli
aws dynamodb put-item \
    --table-name <<replace table name here>> \
    --item '{
  		"id": {"S": "Computer"},
  		"awskeyid": {"S": "<<replace key5 id here>>"}
	}' \
    --return-consumed-capacity TOTAL

aws dynamodb put-item \
    --table-name <<replace table name here>> \
    --item '{
  		"id": {"S": "Cooking"},
  		"awskeyid": {"S": "<<replace another key6 id here>>"}
	}' \
    --return-consumed-capacity TOTAL
```

<strong><em>Testing - XML Request</em></strong>

After you have added the data in Dynamodb table you can send a request to API gateway URL. The REST end point is mentioned in the CDK outputs with label `ApiGWStackheader.MyRestApiEndpointxxxxxx`


```cli
curl --location --request GET '<REST ENDPOINT>/books' --header 'Authorization: token' --header 'genre: Computer'
```

For a different request header you can use the following command

```cli
curl --location --request GET '<REST ENDPOINT>/books' --header 'Authorization: token' --header 'genre: Cooking'
```

You should see following response

```json
{
    "name": "Basic of whatever",
    "ISBN": "978-3-16-148410-0",
    "registrationDate": 1598274405
}
```