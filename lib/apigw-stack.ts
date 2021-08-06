/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as cdk from "@aws-cdk/core";
import * as path from "path";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";

import * as api from "@aws-cdk/aws-apigateway";
import { Fn } from "@aws-cdk/core";
import { AllowedMethods } from "@aws-cdk/aws-cloudfront";
import { Tracing } from "@aws-cdk/aws-lambda";
import { ApiKeySourceType } from "@aws-cdk/aws-apigateway";

export declare enum KeySourceType {
  REQUESTPARAMETER = "RequestParameter",
  HEADERPARAMETER = "Header",
  BODY = "Body",
}

interface ApiGWStackProps extends cdk.StackProps {
  keysourcetype: string;
  keysource?: string;
  UsagesPlans: Array<{
    name: string;
    throttle: {
      rateLimit: number;
      burstLimit: number;
    };
    quota: {
      limit: number;
      period: api.Period;
    };
    keys: Array<{
      keyIdentifier: string;
      keyValue: string;
    }>;
  }>;
}

export class ApiGWStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiGWStackProps) {
    super(scope, id, props);

    //Create Dynamodb Table
    const lookupTable = new dynamodb.Table(this, "lookuptable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const authorizerfunction = new lambda.Function(
      this,
      "MyAuthorizerFunction",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "authorizer.handler",
        code: lambda.Code.fromAsset(path.join("./lambda")),
      }
    );
    authorizerfunction.addEnvironment("KEY_SOURCE_TYPE", props.keysourcetype);
    if (props.keysource)
      authorizerfunction.addEnvironment("KEY_SOURCE", props.keysource);

    authorizerfunction.addEnvironment("TABLE_NAME", lookupTable.tableName);

    lookupTable.grantReadData(authorizerfunction);
    authorizerfunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["apigateway:GET"],
        resources: ["*"],
      })
    );

    const restapi = new api.RestApi(this, "BookApi-"+props.keysourcetype, {
      endpointConfiguration: {
        types: [api.EndpointType.REGIONAL],
      },
      apiKeySourceType: ApiKeySourceType.AUTHORIZER,
      retainDeployments: true,
      deployOptions: {
        tracingEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: api.MethodLoggingLevel.INFO,
        metricsEnabled: true,
      },
    });

    const authorizer = new api.RequestAuthorizer(this, "DynamicKeyAuthorizer", {
      handler: authorizerfunction,
      authorizerName: "DynamicKeyAuthorizer",
      identitySources: [api.IdentitySource.header("Authorization")],
    });

    const method = restapi.root.addMethod(
      "ANY",
      new api.MockIntegration({
        integrationResponses: [{ statusCode: "200" }],
        passthroughBehavior: api.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{ "statusCode": 200 }',
        },
      }),
      {
        methodResponses: [{ statusCode: "200" }],
        authorizer,
        apiKeyRequired: true,
      }
    );

    const bookmethod = restapi.root.addResource("books").addMethod(
      "ANY",
      new api.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": ` 
                         { "name": "Basic of whatever",
                           "ISBN" : "978-3-16-148410-0",
                           "registrationDate": 1598274405
                         }`,
            },
          },
        ],
        passthroughBehavior: api.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{ "statusCode": 200 }',
        },
      }),
      {
        methodResponses: [{ statusCode: "200" }],
        authorizer,
        apiKeyRequired: true,
      }
    );

    //multiple Usage plan and multiple keys

    props.UsagesPlans.forEach((usageplan) => {
      const plan = restapi.addUsagePlan(usageplan.name, {
        name: usageplan.name,
        throttle: {
          rateLimit: usageplan.throttle.rateLimit,
          burstLimit: usageplan.throttle.burstLimit,
        },
        quota: {
          limit: usageplan.quota.limit,
          period: usageplan.quota.period,
        },
      });
      plan.addApiStage({
        stage: restapi.deploymentStage,
      });
      usageplan.keys.forEach((customkey) => {
        const key = restapi.addApiKey(customkey.keyIdentifier, {
          apiKeyName: customkey.keyIdentifier,
          value: customkey.keyValue,
        });
        plan.addApiKey(key);
      });
    });

    //Consider CF route only if body needs to be parsed to decide
    if (props.keysourcetype == "Body") {
      const lambdaatedge = new lambda.Function(this, "LambdaAtEdge", {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "lambdaatedge.handler",
        code: lambda.Code.fromAsset(path.join("./lambdaatedge")),
        tracing: Tracing.ACTIVE,
      });

      const domain = Fn.join(".", [
        restapi.restApiId,
        "execute-api",
        this.region,
        this.urlSuffix,
      ]);

      const apiCache = new cloudfront.CachePolicy(this, "CachingPolicy", {
        cachePolicyName: "CachingPolicy",
        comment: "A  policy for serving APIs",
        cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
          "OriginKeyIdentifier"
        ),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      });

      const cloudfrontdistribution = new cloudfront.Distribution(
        this,
        "CF for API",
        {
          defaultBehavior: {
            allowedMethods: AllowedMethods.ALLOW_ALL,
            origin: new origins.HttpOrigin(domain),
            cachePolicy: apiCache,
            edgeLambdas: [
              {
                functionVersion: lambdaatedge.currentVersion,
                eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                includeBody: true,
              },
            ],
          },
        }
      );
      new cdk.CfnOutput(this, "CloudfrontDistribution", {
        value: cloudfrontdistribution.distributionId,
      });
      new cdk.CfnOutput(this, "CloudfrontDomainName", {
        value: cloudfrontdistribution.domainName,
      });
    }

    new cdk.CfnOutput(this, "DynamodbTable", {
      value: lookupTable.tableName,
    });
  }
}
