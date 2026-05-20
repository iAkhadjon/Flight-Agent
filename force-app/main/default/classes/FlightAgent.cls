global class FlightAgent {

    @InvocableMethod(label='Find Flights' description='Finds available flights')
    global static List<FlightResponse> findFlights(List<FlightRequest> req) {
        List<FlightResponse> flightResponses = new List<FlightResponse>();

        // Hardcoding the data for example and not focusing on how we retrieve it.
        // However, consider that we are receiving available flights from a service,
        // and then iterating through the data to generate the final response.

        FlightRequestFilter f = (req != null && !req.isEmpty()) ? req[0].filters : null;
        Long priceCap = (f != null) ? f.price : null;
        Double minDiscount = (f != null) ? f.discountPercentage : null;

        List<Flight> allFlights = new List<Flight>{
            new Flight('IX 2814', 1, false, 1000l, 20.20d, 70),
            new Flight('6E 488',  2, false, 2000l, 15.15d, 120),
            new Flight('6E 523',  1, false, 3000l, 13.14d, 75),
            new Flight('6E 6166', 2, false, 4000l, 14.14d, 130)
        };

        List<Flight> matched = new List<Flight>();
        for (Flight fl : allFlights) {
            if (priceCap != null && fl.price > priceCap) continue;
            if (minDiscount != null && fl.discountPercentage < minDiscount) continue;
            matched.add(fl);
        }

        AvailableFlight availableFlights = new AvailableFlight();
        availableFlights.flights = matched;

        FlightResponse fr = new FlightResponse();
        fr.aFlight = availableFlights;
        flightResponses.add(fr);

        return flightResponses;
    }

    @JsonAccess(serializable='always' deserializable='always')
    global class FlightRequest {

        @InvocableVariable(required=true)
        global FlightRequestFilter filters;
    }

    @JsonAccess(serializable='always' deserializable='always')
    global class FlightResponse {

        @InvocableVariable
        global AvailableFlight aFlight;
    }
}
