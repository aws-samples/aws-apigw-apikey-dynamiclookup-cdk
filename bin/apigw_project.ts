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


import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import * as apigw from "../lib/apigw-stack";
import { Period } from "@aws-cdk/aws-apigateway";

const app = new cdk.App();

new apigw.ApiGWStack(app, "ApiGWStackbody", {
  keysourcetype: "Body",
  UsagesPlans: [
    {
      name: "FairUsagePlan",
      quota: {
        limit: 10,
        period: Period.DAY,
      },
      throttle: {
        burstLimit: 5,
        rateLimit: 5,
      },
      keys: [
        {
          keyIdentifier: "largeBank1",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAa",
        },
        {
          keyIdentifier: "largeBank2",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAb",
        },
      ],
    },
  ],
});


new apigw.ApiGWStack(app, "ApiGWStackparameter", {
  keysourcetype: "RequestParameter",
  keysource: "tenantId",
  UsagesPlans: [
    {
      name: "FairUsagePlan2",
      quota: {
        limit: 10,
        period: Period.DAY,
      },
      throttle: {
        burstLimit: 5,
        rateLimit: 5,
      },
      keys: [
        {
          keyIdentifier: "largeBank3",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAc",
        },
        {
          keyIdentifier: "largeBank4",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAd",
        },
      ],
    },
  ],
});

new apigw.ApiGWStack(app, "ApiGWStackheader", {
  keysourcetype: "Header",
  keysource: "tenantId",
  UsagesPlans: [
    {
      name: "FairUsagePlan3",
      quota: {
        limit: 10,
        period: Period.DAY,
      },
      throttle: {
        burstLimit: 5,
        rateLimit: 5,
      },
      keys: [
        {
          keyIdentifier: "largeBank5",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAe",
        },
        {
          keyIdentifier: "largeBank6",
          keyValue: "9etGN6CmeI1osXpmOdNnsabYJ4W520QT6sMvgVAf",
        },
      ],
    },
  ],
});
