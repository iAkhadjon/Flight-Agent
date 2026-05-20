@JsonAccess(serializable='always' deserializable='always')
global class FlightRequestFilter {

    @AuraEnabled
    global String originCity;

    @AuraEnabled
    global String destinationCity;

    @AuraEnabled
    global Date dateOfTravel;

    @AuraEnabled
    global Long price;

    @AuraEnabled
    global Double discountPercentage;
}
