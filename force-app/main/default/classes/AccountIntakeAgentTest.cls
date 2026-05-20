@IsTest
private class AccountIntakeAgentTest {
  @IsTest
  static void returnsSubmittedDetailsInResponse() {
    AccountIntakeRequest details = new AccountIntakeRequest();
    details.accountName = 'Acme Manufacturing';
    details.phone = '415-555-0100';
    details.industry = 'Manufacturing';
    details.contactName = 'Ari Singh';
    details.contactEmail = 'ari@example.com';

    AccountIntakeAgent.AccountIntakeActionRequest request = new AccountIntakeAgent.AccountIntakeActionRequest();
    request.accountDetails = details;

    List<AccountIntakeAgent.AccountIntakeResponse> responses = AccountIntakeAgent.reviewAccountIntake(
      new List<AccountIntakeAgent.AccountIntakeActionRequest>{ request }
    );

    System.assertEquals(1, responses.size());
    System.assert(
      responses[0].response.contains('Acme Manufacturing'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('415-555-0100'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('Manufacturing'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('Ari Singh'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('ari@example.com'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('create or update the Account'),
      responses[0].response
    );
  }

  @IsTest
  static void identifiesMissingDetails() {
    AccountIntakeRequest details = new AccountIntakeRequest();
    details.accountName = 'Acme Manufacturing';

    AccountIntakeAgent.AccountIntakeActionRequest request = new AccountIntakeAgent.AccountIntakeActionRequest();
    request.accountDetails = details;

    List<AccountIntakeAgent.AccountIntakeResponse> responses = AccountIntakeAgent.reviewAccountIntake(
      new List<AccountIntakeAgent.AccountIntakeActionRequest>{ request }
    );

    System.assert(
      responses[0].response.contains('Phone'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('Industry'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('Contact Name'),
      responses[0].response
    );
    System.assert(
      responses[0].response.contains('Contact Email'),
      responses[0].response
    );
  }
}
