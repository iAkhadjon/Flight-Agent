@IsTest
private class S3AccountAgentActionTest {
  private static final String SUCCESS_BODY =
    '{"account":{"id":"001DEMO000001","name":"Acme Korea","industry":"Technology",' +
    '"phone":"+82-2-1234-5678","website":"https://www.acme.example"},' +
    '"contacts":[{"id":"003DEMO000001","firstName":"Jin","lastName":"Kim",' +
    '"email":"jin.kim@acme.example","title":"VP Sales"},' +
    '{"id":"003DEMO000002","firstName":"Mina","lastName":"Park",' +
    '"email":"mina.park@acme.example","title":"Solution Architect"}]}';

  @IsTest
  static void successfulS3ResponseReturnsTypedAccountData() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        200,
        'OK',
        SUCCESS_BODY,
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(1, responses.size());
    S3AccountResponse accountData = responses[0].accountData;
    System.assertEquals(true, accountData.success);
    System.assertEquals('Acme Korea', accountData.account.name);
    System.assertEquals('Technology', accountData.account.industry);
    System.assertEquals('+82-2-1234-5678', accountData.account.phone);
    System.assertEquals(
      'https://www.acme.example',
      accountData.account.website
    );
    System.assertEquals(2, accountData.contacts.size());
    System.assertEquals('Jin', accountData.contacts[0].firstName);
    System.assertEquals('Solution Architect', accountData.contacts[1].title);
  }

  @IsTest
  static void customObjectPathAndBucketOverrideAreApplied() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        200,
        'OK',
        SUCCESS_BODY,
        'callout:AWS_S3_Demo/demo-bucket/folder/account%20data.json'
      )
    );

    S3AccountRequest requestConfig = new S3AccountRequest();
    requestConfig.s3ObjectPath = '/folder/account data.json';
    requestConfig.bucketOverride = 'demo-bucket';

    S3AccountAgentAction.S3AccountActionRequest request = new S3AccountAgentAction.S3AccountActionRequest();
    request.request = requestConfig;

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{ request }
    );
    Test.stopTest();

    System.assertEquals(true, responses[0].accountData.success);
  }

  @IsTest
  static void failedResponseReturnsErrorState() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        500,
        'Internal Server Error',
        '{"error":"server"}',
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      null
    );
    Test.stopTest();

    System.assertEquals(false, responses[0].accountData.success);
    System.assert(
      responses[0].accountData.message.contains('HTTP 500'),
      responses[0].accountData.message
    );
    System.assertEquals(0, responses[0].accountData.contacts.size());
  }

  @IsTest
  static void handlesForbiddenStatus() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        403,
        'Forbidden',
        '{}',
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> forbiddenResponses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(false, forbiddenResponses[0].accountData.success);
    System.assert(
      forbiddenResponses[0].accountData.message.contains('HTTP 403'),
      forbiddenResponses[0].accountData.message
    );
  }

  @IsTest
  static void handlesNotFoundStatus() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        404,
        'Not Found',
        '{}',
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> notFoundResponses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(false, notFoundResponses[0].accountData.success);
    System.assert(
      notFoundResponses[0].accountData.message.contains('HTTP 404'),
      notFoundResponses[0].accountData.message
    );
  }

  @IsTest
  static void malformedJsonReturnsErrorState() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        200,
        'OK',
        '{"account":',
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(false, responses[0].accountData.success);
    System.assert(
      responses[0].accountData.message.contains('malformed JSON'),
      responses[0].accountData.message
    );
  }

  @IsTest
  static void emptyResponseReturnsErrorState() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(200, 'OK', '   ', 'callout:AWS_S3_Demo/account.json')
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(false, responses[0].accountData.success);
    System.assert(
      responses[0].accountData.message.contains('empty response'),
      responses[0].accountData.message
    );
  }

  @IsTest
  static void missingAccountObjectReturnsErrorState() {
    Test.setMock(
      HttpCalloutMock.class,
      new S3AccountMock(
        200,
        'OK',
        '{"contacts":[]}',
        'callout:AWS_S3_Demo/account.json'
      )
    );

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{
        buildRequest(null)
      }
    );
    Test.stopTest();

    System.assertEquals(false, responses[0].accountData.success);
    System.assert(
      responses[0].accountData.message.contains('account object'),
      responses[0].accountData.message
    );
  }

  @IsTest
  static void mockModeReturnsSampleDataWithoutCallout() {
    S3AccountRequest requestConfig = new S3AccountRequest();
    requestConfig.mockMode = true;

    S3AccountAgentAction.S3AccountActionRequest request = new S3AccountAgentAction.S3AccountActionRequest();
    request.request = requestConfig;

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{ request }
    );
    Test.stopTest();

    System.assertEquals(true, responses[0].accountData.success);
    System.assertEquals('Acme Korea', responses[0].accountData.account.name);
    System.assertEquals(2, responses[0].accountData.contacts.size());
  }

  @IsTest
  static void invalidConfigReturnsErrorBeforeCallout() {
    S3AccountRequest requestConfig = new S3AccountRequest();
    requestConfig.s3ObjectPath = 'https://example.com/account.json';

    S3AccountAgentAction.S3AccountActionRequest request = new S3AccountAgentAction.S3AccountActionRequest();
    request.request = requestConfig;

    Test.startTest();
    List<S3AccountAgentAction.S3AccountActionResponse> responses = S3AccountAgentAction.getAccountData(
      new List<S3AccountAgentAction.S3AccountActionRequest>{ request }
    );
    Test.stopTest();

    System.assertEquals(false, responses[0].accountData.success);
    System.assert(
      responses[0].accountData.message.contains('relative object key'),
      responses[0].accountData.message
    );
  }

  private static S3AccountAgentAction.S3AccountActionRequest buildRequest(
    String objectPath
  ) {
    S3AccountRequest requestConfig = new S3AccountRequest();
    requestConfig.s3ObjectPath = objectPath;

    S3AccountAgentAction.S3AccountActionRequest request = new S3AccountAgentAction.S3AccountActionRequest();
    request.request = requestConfig;
    return request;
  }

  private class S3AccountMock implements HttpCalloutMock {
    private Integer statusCode;
    private String status;
    private String body;
    private String expectedEndpoint;

    S3AccountMock(
      Integer statusCode,
      String status,
      String body,
      String expectedEndpoint
    ) {
      this.statusCode = statusCode;
      this.status = status;
      this.body = body;
      this.expectedEndpoint = expectedEndpoint;
    }

    public HttpResponse respond(HttpRequest request) {
      System.assertEquals('GET', request.getMethod());
      System.assertEquals(expectedEndpoint, request.getEndpoint());
      System.assertEquals('application/json', request.getHeader('Accept'));

      HttpResponse response = new HttpResponse();
      response.setStatusCode(statusCode);
      response.setStatus(status);
      response.setBody(body);
      return response;
    }
  }
}
