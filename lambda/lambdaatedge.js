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

'use strict';

const querystring = require('querystring');
const jsonpath = require("jsonpath");
const xmlpath = require("xpath");
var dom = require('xmldom').DOMParser
const bodymetadata = require('./BodyMetaData.json')

const ORIGINKEYIDENTIFIER = "OriginKeyIdentifier";
const KEY_SOURCE_TYPE = bodymetadata.bodyType
const KEY_IDENTIFIER = bodymetadata.keyIdentifier
/**
 * This function demonstrates how you can read the body of a POST request 
 * generated by an HTML form (web form). The function is triggered in a
 * CloudFront viewer request or origin request event type.
 */

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    //const headers = request.headers;
    console.log('request is ', JSON.stringify(request));
    console.log('bodymetadata is  ',bodymetadata);
    let lookupkey = null;
    if (request.method === 'POST') {
        /* HTTP body is always passed as base64-encoded string. Decode it. */
        const body = Buffer.from(request.body.data, 'base64').toString();
        console.log('The body is ',body);
        console.log('Body type is  ',KEY_SOURCE_TYPE, ' and identifier is ',KEY_IDENTIFIER);
        /* HTML forms send the data in query string format. Parse it. */
        if(KEY_SOURCE_TYPE === 'formdata'){
            const formdata = querystring.parse(body);
            lookupkey = formdata.KEY_IDENTIFIER   
        }
        else if(KEY_SOURCE_TYPE === 'json'){
            const jsondata = JSON.parse(body);
            lookupkey = jsonpath.query(jsondata, KEY_IDENTIFIER)[0];
        }
        else if(KEY_SOURCE_TYPE === 'xml'){
            var xmldata = new dom().parseFromString(body)
            lookupkey= xmlpath.select(KEY_IDENTIFIER, xmldata)    
        }
        console.log('lookup key is ',lookupkey,' Setting it as a value in header with key ',ORIGINKEYIDENTIFIER);
        //request.origin.custom.customHeaders[ORIGINKEYIDENTIFIER] = [{key: ORIGINKEYIDENTIFIER, value: lookupkey}]; 
        request.headers[ORIGINKEYIDENTIFIER] = [{key: ORIGINKEYIDENTIFIER, value: lookupkey}]; 
        console.log('new request is ', JSON.stringify(request));
    }
    return callback(null, request);
};