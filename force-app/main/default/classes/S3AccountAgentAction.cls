global with sharing class S3AccountAgentAction {
  private static final String NAMED_CREDENTIAL = 'callout:AWS_S3_Demo';
  private static final String DEFAULT_OBJECT_PATH = '/account.json';
  private static final Integer TIMEOUT_MS = 20000;

  @InvocableMethod(
    label='Get Account Data From S3'
    description='Retrieves account and contact data from AWS S3 bucket.'
    callout=true
  )
  global static List<S3AccountActionResponse> getAccountData(
    List<S3AccountActionRequest> requests
  ) {
    List<S3AccountActionResponse> responses = new List<S3AccountActionResponse>();

    if (requests == null || requests.isEmpty()) {
      responses.add(buildActionResponse(fetchAccountData(null)));
      return responses;
    }

    for (S3AccountActionRequest request : requests) {
      S3AccountRequest config = request == null ? null : request.request;
      responses.add(buildActionResponse(fetchAccountData(config)));
    }

    return responses;
  }

  private static S3AccountActionResponse buildActionResponse(
    S3AccountResponse accountData
  ) {
    S3AccountActionResponse response = new S3AccountActionResponse();
    response.accountData = accountData;
    return response;
  }

  @TestVisible
  private static S3AccountResponse fetchAccountData(S3AccountRequest config) {
    if (config != null && config.mockMode == true) {
      return buildMockResponse();
    }

    try {
      HttpRequest request = new HttpRequest();
      request.setEndpoint(buildEndpoint(config));
      request.setMethod('GET');
      request.setTimeout(TIMEOUT_MS);
      request.setHeader('Accept', 'application/json');

      HttpResponse response = new Http().send(request);
      Integer statusCode = response.getStatusCode();

      if (statusCode < 200 || statusCode >= 300) {
        return buildErrorResponse(
          'AWS S3 returned HTTP ' +
            statusCode +
            buildStatusSuffix(response.getStatus())
        );
      }

      String body = response.getBody();
      if (String.isBlank(body)) {
        return buildErrorResponse('AWS S3 returned an empty response.');
      }

      return parseResponseBody(body);
    } catch (S3AccountConfigurationException ex) {
      return buildErrorResponse(ex.getMessage());
    } catch (System.CalloutException ex) {
      return buildErrorResponse('AWS S3 callout failed: ' + ex.getMessage());
    } catch (Exception ex) {
      return buildErrorResponse(
        'Unable to retrieve account data from AWS S3: ' + ex.getMessage()
      );
    }
  }

  private static S3AccountResponse parseResponseBody(String body) {
    S3AccountPayload payload;

    try {
      payload = (S3AccountPayload) JSON.deserialize(
        body,
        S3AccountPayload.class
      );
    } catch (System.JSONException ex) {
      return buildErrorResponse(
        'AWS S3 returned malformed JSON: ' + ex.getMessage()
      );
    }

    if (payload == null || payload.account == null) {
      return buildErrorResponse(
        'AWS S3 response did not include an account object.'
      );
    }

    S3AccountResponse response = new S3AccountResponse();
    response.success = true;
    response.message = 'Account data retrieved from AWS S3.';
    response.account = payload.account;
    response.contacts = normalizeContacts(payload.contacts);
    return response;
  }

  private static List<S3ContactDTO> normalizeContacts(
    List<S3ContactDTO> contacts
  ) {
    List<S3ContactDTO> normalizedContacts = new List<S3ContactDTO>();

    if (contacts == null) {
      return normalizedContacts;
    }

    for (S3ContactDTO contact : contacts) {
      if (contact != null) {
        normalizedContacts.add(contact);
      }
    }

    return normalizedContacts;
  }

  private static S3AccountResponse buildErrorResponse(String message) {
    S3AccountResponse response = new S3AccountResponse();
    response.success = false;
    response.message = message;
    response.account = null;
    response.contacts = new List<S3ContactDTO>();
    return response;
  }

  private static S3AccountResponse buildMockResponse() {
    S3AccountDTO account = new S3AccountDTO();
    account.id = '001DEMO000001';
    account.name = 'Acme Korea';
    account.industry = 'Technology';
    account.phone = '+82-2-1234-5678';
    account.website = 'https://www.acme.example';

    S3ContactDTO firstContact = new S3ContactDTO();
    firstContact.id = '003DEMO000001';
    firstContact.firstName = 'Jin';
    firstContact.lastName = 'Kim';
    firstContact.email = 'jin.kim@acme.example';
    firstContact.title = 'VP Sales';

    S3ContactDTO secondContact = new S3ContactDTO();
    secondContact.id = '003DEMO000002';
    secondContact.firstName = 'Mina';
    secondContact.lastName = 'Park';
    secondContact.email = 'mina.park@acme.example';
    secondContact.title = 'Solution Architect';

    S3AccountResponse response = new S3AccountResponse();
    response.success = true;
    response.message = 'Account data loaded from mock mode.';
    response.account = account;
    response.contacts = new List<S3ContactDTO>{ firstContact, secondContact };
    return response;
  }

  private static String buildEndpoint(S3AccountRequest config) {
    String objectPath = normalizeObjectPath(
      config == null ? null : config.s3ObjectPath
    );
    String bucketOverride = normalizeBucketOverride(
      config == null ? null : config.bucketOverride
    );

    if (bucketOverride == null) {
      return NAMED_CREDENTIAL + objectPath;
    }

    return NAMED_CREDENTIAL + '/' + bucketOverride + objectPath;
  }

  private static String normalizeObjectPath(String rawPath) {
    if (String.isBlank(rawPath)) {
      return DEFAULT_OBJECT_PATH;
    }

    String normalizedPath = rawPath.trim();
    if (normalizedPath.contains('://') || normalizedPath.contains('..')) {
      throw new S3AccountConfigurationException(
        'S3 object path must be a relative object key.'
      );
    }

    while (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }

    if (String.isBlank(normalizedPath)) {
      throw new S3AccountConfigurationException(
        'S3 object path cannot be empty.'
      );
    }

    return '/' + encodePath(normalizedPath);
  }

  private static String normalizeBucketOverride(String rawBucketOverride) {
    if (String.isBlank(rawBucketOverride)) {
      return null;
    }

    String bucketOverride = rawBucketOverride.trim();
    String invalidCharacters = bucketOverride.replaceAll('[A-Za-z0-9.-]', '');

    if (
      bucketOverride.length() < 3 ||
      bucketOverride.length() > 63 ||
      invalidCharacters.length() > 0
    ) {
      throw new S3AccountConfigurationException(
        'Bucket override must be a valid S3 bucket name.'
      );
    }

    return encodePathSegment(bucketOverride);
  }

  private static String encodePath(String path) {
    List<String> encodedSegments = new List<String>();

    for (String segment : path.split('/')) {
      if (!String.isBlank(segment)) {
        encodedSegments.add(encodePathSegment(segment));
      }
    }

    return String.join(encodedSegments, '/');
  }

  private static String encodePathSegment(String segment) {
    return EncodingUtil.urlEncode(segment, 'UTF-8').replace('+', '%20');
  }

  private static String buildStatusSuffix(String status) {
    return String.isBlank(status) ? '.' : ' (' + status + ').';
  }

  private class S3AccountPayload {
    public S3AccountDTO account;
    public List<S3ContactDTO> contacts;
  }

  private class S3AccountConfigurationException extends Exception {
  }

  @JsonAccess(serializable='always' deserializable='always')
  global class S3AccountActionRequest {
    @InvocableVariable(label='S3 Account Request')
    global S3AccountRequest request;
  }

  @JsonAccess(serializable='always' deserializable='always')
  global class S3AccountActionResponse {
    @InvocableVariable(label='Account Data')
    global S3AccountResponse accountData;
  }
}
