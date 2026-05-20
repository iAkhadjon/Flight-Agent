@JsonAccess(serializable='always' deserializable='always')
global class AccountIntakeRequest {
  @AuraEnabled
  global String accountName;

  @AuraEnabled
  global String phone;

  @AuraEnabled
  global String industry;

  @AuraEnabled
  global String contactName;

  @AuraEnabled
  global String contactEmail;
}
