global class AccountIntakeAgent {
  @InvocableMethod(
    label='Review Account Intake'
    description='Reviews account and contact information submitted from the Agentforce LWC form.'
  )
  global static List<AccountIntakeResponse> reviewAccountIntake(
    List<AccountIntakeActionRequest> requests
  ) {
    List<AccountIntakeResponse> responses = new List<AccountIntakeResponse>();

    if (requests == null || requests.isEmpty()) {
      AccountIntakeResponse response = new AccountIntakeResponse();
      response.response = buildResponse(null);
      responses.add(response);
      return responses;
    }

    for (AccountIntakeActionRequest request : requests) {
      AccountIntakeResponse response = new AccountIntakeResponse();
      response.response = buildResponse(
        request == null ? null : request.accountDetails
      );
      responses.add(response);
    }

    return responses;
  }

  @TestVisible
  private static String buildResponse(AccountIntakeRequest accountDetails) {
    if (accountDetails == null) {
      return 'I did not receive any account details. Please submit the Account Intake form so I can respond based on those inputs.';
    }

    List<String> missingFields = new List<String>();
    addMissingField(missingFields, 'Account Name', accountDetails.accountName);
    addMissingField(missingFields, 'Phone', accountDetails.phone);
    addMissingField(missingFields, 'Industry', accountDetails.industry);
    addMissingField(missingFields, 'Contact Name', accountDetails.contactName);
    addMissingField(
      missingFields,
      'Contact Email',
      accountDetails.contactEmail
    );

    List<String> lines = new List<String>();
    lines.add('Account intake submitted.');
    lines.add('Account: ' + valueOrFallback(accountDetails.accountName));
    lines.add('Phone: ' + valueOrFallback(accountDetails.phone));
    lines.add('Industry: ' + valueOrFallback(accountDetails.industry));
    lines.add(
      'Primary contact: ' + valueOrFallback(accountDetails.contactName)
    );
    lines.add('Contact email: ' + valueOrFallback(accountDetails.contactEmail));

    if (missingFields.isEmpty()) {
      lines.add(
        'Recommended next step: use these details to create or update the Account and primary Contact records.'
      );
    } else {
      lines.add(
        'Recommended next step: collect the missing fields before creating or updating records: ' +
          String.join(missingFields, ', ') +
          '.'
      );
    }

    return String.join(lines, '\n');
  }

  private static void addMissingField(
    List<String> missingFields,
    String label,
    String value
  ) {
    if (String.isBlank(value)) {
      missingFields.add(label);
    }
  }

  private static String valueOrFallback(String value) {
    return String.isBlank(value) ? 'Not provided' : value.trim();
  }

  @JsonAccess(serializable='always' deserializable='always')
  global class AccountIntakeActionRequest {
    @InvocableVariable(required=true)
    global AccountIntakeRequest accountDetails;
  }

  @JsonAccess(serializable='always' deserializable='always')
  global class AccountIntakeResponse {
    @InvocableVariable
    global String response;
  }
}
