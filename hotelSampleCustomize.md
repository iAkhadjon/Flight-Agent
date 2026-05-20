Example: Customizing User Interface Using Custom Lightning Types with Top-Level Collection Renderer Override
This example explains how to override the default user interface to create a customized appearance of responses on the custom agent’s action output with custom Lightning types.

In this example, you specify a renderer collection override for the custom Lighting type that you created.

Before You Begin 

Download these sample data files.

apexClass.zip
hotelLWCandCLT.zip
Example Apex Class for Retrieving Hotel Information 

Use these Apex classes together to create a custom agent action that finds available hotels. The main HotelReservation class contains the invocable method, and the other classes define the complex data structures for the request and response.

When you create your custom agent action, select the method Find hotels.

HotelReservation Class

This class is the main class that contains the logic for the find hotels agent action.

@JsonAccess(serializable='always' deserializable='always')
global class HotelReservation {
    @InvocableMethod(label='Find hotels ' description='Find Available Hotels')
    global static List<HotelResponse> findHotels(List<HotelRequest> req) {
        // For example, we hardcode the data and don’t focus on how we retrieve it.
        // However, consider that we receive available hotel data from a service
        // and then iterate through the data to generate the final response.

        List<HotelResponse> hotelResponseList = new List<HotelResponse>();

        Room r1 = new Room('DELUX', 2, 15.15d, 2000l, false);
        List<Room> rooms = new List<Room>();
        rooms.add(r1);

        HotelCategory fourStar = new HotelCategory('four');
        Hotel hotel1 = new Hotel('Sahara Hotels', 'Gacchibowli Hyderabad', rooms, fourStar);
        HotelCategory fiveStar = new HotelCategory('five');
        Hotel hotel2 = new Hotel('Taj Vivanta', 'Kokapet', rooms, fiveStar);
        List<Hotel> hotels = new List<Hotel>();
        hotels.add(hotel1);
        hotels.add(hotel2);

        HotelResponse hotelresponse = new HotelResponse(hotels);
        hotelResponseList.add(hotelresponse);

        return hotelResponseList;
    }
}
HotelResponse Class

This class defines the data structure for the response that returns a list of available hotels.

@JsonAccess(serializable='always' deserializable='always')
global class HotelResponse {
    @InvocableVariable
    global List<Hotel> hotels;

    global HotelResponse(List<Hotel> hotels) {
        this.hotels = hotels;
    }
}
Hotel Class

This class defines the data structure for hotel details.

@JsonAccess(serializable='always' deserializable='always')
global class Hotel {
    @InvocableVariable
    global String name;

    @InvocableVariable
    global String address;

    @InvocableVariable
    global List<Room> rooms;

    @InvocableVariable
    global HotelCategory hotelCategory;

    global Hotel(String name, String address, List<Room> rooms, HotelCategory hotelCategory) {
        this.name = name;
        this.address = address;
        this.rooms = rooms;
        this.hotelCategory = hotelCategory;
    }
}
Room Class

This class defines the data structure for rooms within a hotel.

@JsonAccess(serializable='always' deserializable='always')
global class Room {
    @InvocableVariable
    global String type;

    @InvocableVariable
    global Integer available;

    @InvocableVariable
    global Double discountPercentage;

    @InvocableVariable
    global Long price;

    @InvocableVariable
    global Boolean petAllowed;

    global Room(String type, Integer available, Double discountPercentage, Long price, Boolean petAllowed) {
        this.type = type;
        this.available = available;
        this.discountPercentage = discountPercentage;
        this.price = price;
        this.petAllowed = petAllowed;
    }
}
HotelCategory Class

This class defines the data structure for a hotel’s star rating.

@JsonAccess(serializable='always' deserializable='always')
global class HotelCategory {
    @InvocableVariable
    global String star;

    global HotelCategory(String star) {
        this.star = star;
    }
}
HotelRequest Class

This class defines the data structure for the agent action’s input criteria.

@JsonAccess(serializable='always' deserializable='always')
global class HotelRequest {
    @InvocableVariable
    global String city;

    @InvocableVariable
    global Date checkInDate;

    @InvocableVariable
    global Date checkOutDate;
}
The Apex class Hotel Reservation accepts the hotel search criteria, including the check in date, check out date, and city, and then returns a list of available hotels.

Note

For this example, hotel availability data is already included in the Hotel Reservation Apex class. However, in a real-time scenario, hotel information is fetched from an external service, and the Apex class processes that data to generate the final response.

Create Agent Action by Using Apex Class 

For information about how to create a custom action by using Apex class, see Create a Custom Agent Action.

Inputs and outputs for the agent action are defined by using standard Lightning types.

Input:

checkInDate, checkOutDate, and city use standard Lightning types such as lightning__dateType and lightning__textType.
Output:

The output hotels for the agent action is a list type.
Here’s an image that shows the custom agent action created.

Input and output settings for a 'Find hotels' agent action. Inputs: checkInDate, checkOutDate, City. Output: hotels.

The available flight information is retrieved by using @apexClassType/c__Hotel in the agent action output, where:

apexClassType is the bundle name.
Hotel is the Apex class.
When you execute this agent action, it prompts you to provide input and then generates the output.

Agent Action Execution Input 

The agent’s action UI collects these details to find available hotels.

Check in date
Check out date
City
Here’s the image that shows how the custom agent action input appears in an agent conversation.

Agent action input collects hotel details: checkInDate, checkOutDate, and city.

Agent Action Execution Output 

The agent’s action UI returns the available hotel details.

Here’s the image that shows how the custom agent action’s output appears in an agent conversation.

Agent's response to a hotel details request. The response lacks labels and is presented in a format that is hard to understand.

Result Data 

The agent displays the hotel data in the response.

Here’s the sample code that shows the available hotel data.

{
  "hotels": [
    {
      "rooms": [
        {
          "type": "DELUX",
          "price": 2000,
          "petAllowed": false,
          "discountPercentage": 15.15,
          "available": 2
        }
      ],
      "name": "Sahara Hotels",
      "hotelCategory": {
        "star": "four"
      },
      "address": "Gacchibowli Hyderabad"
    },
    {
      "rooms": [
        {
          "type": "DELUX",
          "price": 2000,
          "petAllowed": false,
          "discountPercentage": 15.15,
          "available": 2
        }
      ],
      "name": "Taj Vivanta",
      "hotelCategory": {
        "star": "five"
      },
      "address": "Kokapet"
    }
  ]
}
Customize UI for Output 

Create a custom Lightning type named hotelResponse to enhance the visibility of the information in the output UI.

Override Default UI for Output With Custom Lightning Types 

Override the agent’s action UI for output to enhance the user experience by using Custom Lightning Types (CLTs). With CLTs, you can add your own Lightning Web Components (LWC) to present data for lists in a more structured and intuitive format.

Configure the renderer.json file to override the default UI of a custom Lightning type in the agent action.

Here’s an example showing a lightningTypes folder for a custom Lightning type named hotelResponse.

+--lightningTypes
        +--hotelResponse
            +--schema.json
            +--lightningDesktopGenAi
               +--renderer.json
Note

This example uses lightningDesktopGenAi to configure the custom Lightning type. To configure the type for the enhancedWebChat channel, create the renderer.json file in the corresponding channel folder.

The custom Lightning type hotelResponse includes a schema.json file and a renderer.json file. The renderer.json file controls how the data is displayed to the user in the agent action output.

This sample code shows the contents of the schema.json file.

{
  "title": "Hotel Reservation",
  "description": "Hotel Reservation",
  "lightning:type": "@apexClassType/c__Hotel"
}
This sample code shows the contents of the renderer.json file.

{
  "collection": {
    "renderer": {
      "componentOverrides": {
        "$": {
          "definition": "c/hotelDetails"
        }
      }
    }
  }
}
Build Output Components with Lightning Web Components 

This section explains how the components are created and deployed for agent action output.

This image shows the Lightning Web Component (LWC) folder structure.

The lwc folder contains a folder named hotelDetails, which is the LWC component. The hotelDetails folder includes CSS, HTML, JS, and metadata files.

The LWC component includes HTML markup designed to accept output for @apexClassType/c__Hotel. This HTML markup ensures that the data is displayed in an intuitive and customized format.

This sample code shows the contents of the hotelDetails.js-meta.xml file.

<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>64.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>HotelDetails</masterLabel>
  <targets>
        <target>lightning__AgentforceOutput</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__AgentforceOutput">
            <sourceType name="lightning__listType" itemTypeName="c__hotelResponse"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
Note

When you create an LWC component to override the UI for action input, use lightning__AgentforceInput as the target. For output, use lightning__AgentforceOutput. For information about LWC target types, see lightning__AgentforceInput Target and lightning__AgentforceOutput Target.

This sample code shows the contents of the hotelDetails.html file.

<template>
  <lightning-card title="Available Hotels" icon-name="standard:travel_mode">
    <template if:true="{value}">
      <div class="slds-p-around_medium">
        <template for:each="{value}" for:item="hotel">
          <div key="{hotel.name}" class="hotel-card slds-box slds-box_x-small slds-m-bottom_large">
            <div class="slds-grid slds-grid_align-spread slds-m-bottom_small">
              <div>
                <h2 class="slds-text-heading_medium slds-truncate hotel-name">{hotel.name}</h2>
                <div class="slds-text-body_small slds-m-top_xx-small slds-text-color_weak">
                  <lightning-icon
                    icon-name="utility:location"
                    size="xx-small"
                    class="slds-m-right_xx-small"
                  ></lightning-icon>
                  {hotel.address}
                </div>
              </div>
            </div>

            <div class="slds-grid slds-wrap slds-m-bottom_small">
              <template for:each="{hotel.rooms}" for:item="room">
                <div
                  key="{room.type}"
                  class="slds-box slds-box_xx-small slds-theme_shade slds-m-bottom_medium slds-size_1-of-1 room-box"
                >
                  <div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">
                    <div>
                      <p class="slds-text-title_bold">{room.type}</p>
                      <p class="slds-text-body_small">
                        <lightning-icon
                          icon-name="utility:event"
                          size="xx-small"
                          class="slds-m-right_xx-small"
                        ></lightning-icon>
                        Available: {room.available}
                      </p>
                      <p class="slds-text-body_small">
                        <lightning-icon
                          icon-name="utility:animal_and_nature"
                          size="xx-small"
                          class="slds-m-right_xx-small"
                        ></lightning-icon>
                        Pets Allowed: {room.petAllowed}
                      </p>
                    </div>
                    <div class="slds-text-align_right">
                      <div class="price-tag">₹{room.price}</div>
                      <div class="discount-chip">{room.discountPercentage}% Off</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
  </lightning-card>
</template>
This sample code shows the contents of the hotelDetails.js file.

import { LightningElement, api } from "lwc";

export default class HotelDetails extends LightningElement {
  @api value;
}
See Also

Lightning Web Components Developer Guide: Get Started with Lightning Web Components
Integrate Custom Lightning Type into Agent Action Output 

To add a custom Lightning type to the agent action, complete these steps.

Open the agent action.
Edit the Output Rendering parameter of the agent action output for HotelResponse.
Select the custom lightning type HotelResponse.
Save the agent action.
The Unsupported Data Type message appears in the Map to Variable parameter. You see this message when you refer to types such as @apexClassType and custom Lightning types in an agent action’s Output Rendering parameter. This message doesn’t affect your saved work and can be safely ignored.

This image shows the custom Lightning type that you created.

The agent action output settings with 'hotelResponse' selected in the Output Rendering field.

Customized Input UI 

Before executing the agent action that you modified, reload the agent page. The agent prompts you to provide input and then generate the output. The output provides a new UI experience.

This image shows how the custom agent action’s input appears in an agent conversation.

Agent's response to a hotel details request. The response includes clear labels and is presented in a format that is easy to understand.