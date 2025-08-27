- Watch a directory for new/changed MIDI files
- If *new* midi file
    - Parse MIDI, add midi to "state"
    - Assign new Midi a channel (max of 12)

## Midiman
    - Backed by sqlite
        - Stores the deltas needed for each Midi file in Store, such as target Voicegroup, where to place loop markers
    - Keeps track of state of Midi files in directory
    - When given a directory, starts Filewatcher.
    - When FileWatcher detects a change, it tells Midiman:
        - Type of change: New File | Updated File | Deleted File
        - Change neccesitation: Update Midi data | Add new Midi | Remove Midi from store
