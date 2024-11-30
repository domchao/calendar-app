from datetime import datetime

from ics import Calendar, Event


def parse_date_string_to_datetime(date_str):
    date_object = datetime.strptime(date_str, "%Y-%m-%d")
    return date_object


def _create_event_from_llm_json(llm_json):
    # Set up new event
    ical_event = Event()
    # Populate event with llm_json fields
    ical_event.name = llm_json["event_name"]
    ical_event.begin = parse_date_string_to_datetime(llm_json["event_start"])
    ical_event.end = parse_date_string_to_datetime(llm_json["event_end"])

    return ical_event


def create_calendar_ics_from_events_list(events_list, output_path):
    # Create a new calendar
    calendar = Calendar()

    # Create ical event objects
    ical_events = [_create_event_from_llm_json(event) for event in events_list]

    # Add the events to the calendar
    for event in ical_events:
        calendar.events.add(event)

    # Write the calendar to an .ics file
    with open(output_path, "w") as f:
        f.writelines(calendar)

    print("iCal event created and saved'")
